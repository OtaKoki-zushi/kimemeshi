// 媒体ごとの最新記事を Google ニュースの RSS（site: 検索）から集め、
// 同じ出来事を報じた記事を束ねて news/data/news.json に保存する。
// GitHub Actions（サーバー側）で実行するため、ブラウザのCORS制約を受けない。
// 使い方: node scripts/fetch-news.mjs            … ネットから取得
//         node scripts/fetch-news.mjs a.xml b.xml … 保存済みRSSで動作確認（媒体は先頭から順に割当）
import { readFile, writeFile, mkdir } from "node:fs/promises";

const { sources: SOURCES } = JSON.parse(await readFile("news/sources.json", "utf8"));
const HOURS = 48;          // これより古い記事は捨てる
const PER_SOURCE = 60;     // 1媒体あたりの上限（多い媒体に埋もれないように）

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&amp;/g, "&").trim();
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? decode(m[1]) : ""; };

function parseRss(xml, source) {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map(([item]) => {
    let title = tag(item, "title");
    // Google ニュースは「見出し - 媒体名」の形なので媒体名を落とす
    const pub = tag(item, "source");
    if (pub && title.endsWith(" - " + pub)) title = title.slice(0, -(pub.length + 3));
    else title = title.replace(/\s+-\s+[^-]{1,20}$/, "");
    title = title.trim();
    const date = new Date(tag(item, "pubDate") || tag(item, "dc:date"));
    return { s: source.id, t: title, u: tag(item, "link"), d: isNaN(date) ? null : date.toISOString() };
  }).filter((a) => a.t && a.u);
}

async function fetchSource(src) {
  const q = `site:${src.site} when:2d`;
  const url = "https://news.google.com/rss/search?" + new URLSearchParams({ q, hl: "ja", gl: "JP", ceid: "JP:ja" });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (news-balance bot)" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return parseRss(await res.text(), src);
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

// ---- 話題のまとまり（同じ出来事を別々の媒体が報じたもの）を作る ----
// 日本語は単語区切りがないので、漢字・カタカナ・英数字の連なり（≒内容語）から文字2-gramを作り、
// その重なりで見出しの近さを測る。ひらがな（助詞など）は「の財」のような雑音になるので使わない
const CONTENT = /[^\p{Script=Han}\p{Script=Katakana}ー々A-Za-z0-9０-９Ａ-Ｚａ-ｚ]+/u;
function grams(title) {
  const g = new Set();
  for (const run of title.replace(/^【[^】]*】/, "").split(CONTENT)) {
    if (run.length === 1) g.add(run);
    for (let i = 0; i < run.length - 1; i++) g.add(run.slice(i, i + 2));
  }
  return g;
}
function sameStory(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  if (inter < 4) return false;
  // 全体の重なり（Jaccard）か、短い方の見出しがほぼ含まれているか
  return inter / (a.size + b.size - inter) >= 0.28 || inter / Math.min(a.size, b.size) >= 0.5;
}
export function cluster(articles) {
  const g = articles.map((a) => grams(a.t));
  const parent = articles.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let i = 0; i < articles.length; i++) {
    for (let j = i + 1; j < articles.length; j++) {
      if (articles[i].s === articles[j].s) continue; // 同じ媒体の続報同士はつながない
      if (sameStory(g[i], g[j])) parent[find(i)] = find(j);
    }
  }
  const groups = new Map();
  articles.forEach((a, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(a); });
  return [...groups.values()]
    .filter((list) => new Set(list.map((a) => a.s)).size >= 2)
    .map((list, k) => ({ id: "t" + k, a: list.map((a) => a.id) }));
}

// ---- メイン ----
const files = process.argv.slice(2);
const all = [];
const status = [];
for (const [i, src] of SOURCES.entries()) {
  try {
    let list;
    if (files.length) list = files[i] ? parseRss(await readFile(files[i], "utf8"), src) : [];
    else list = await fetchSource(src);
    const cutoff = Date.now() - HOURS * 3600e3;
    list = list.filter((a) => !a.d || Date.parse(a.d) >= cutoff || files.length)
      .sort((a, b) => (b.d || "").localeCompare(a.d || "")).slice(0, PER_SOURCE);
    all.push(...list);
    status.push({ ok: true, count: list.length });
    console.log(`${src.name}: ${list.length}件`);
  } catch (e) {
    status.push({ ok: false, count: 0 });
    console.warn(`${src.name}: 取得失敗 (${e.message})`);
  }
  if (!files.length) await new Promise((r) => setTimeout(r, 800)); // 取得先への負荷を抑える
}

// 同じ見出し・同じURLの重複を除く
const seen = new Set();
const articles = all.filter((a) => { const k = a.s + "|" + a.t; if (seen.has(k) || seen.has(a.u)) return false; seen.add(k); seen.add(a.u); return true; })
  .map((a, i) => ({ id: "a" + i, ...a }));
const topics = cluster(articles);

if (!articles.length) { console.error("記事を1件も取得できませんでした。既存データは上書きしません。"); process.exit(1); }
await mkdir("news/data", { recursive: true });
await writeFile("news/data/news.json", JSON.stringify({ updated_at: new Date().toISOString(), sources: SOURCES.map(({ id, name, score, note }, i) => ({ id, name, score, note, ...status[i] })), articles, topics }));
console.log(`合計: ${articles.length}件 / 複数媒体が報じた話題: ${topics.length}件`);
