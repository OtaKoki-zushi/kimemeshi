// エリアごとの店舗データをホットペッパーAPIから取得し data/<area>.json に保存する。
// GitHub Actions（サーバー側）で実行するため、ブラウザのCORS制約を受けない。
// APIキーはリポジトリのSecrets（HOTPEPPER_KEY）から渡す＝公開されない。
import { writeFile, mkdir } from "node:fs/promises";

const KEY = process.env.HOTPEPPER_KEY;
if (!KEY) { console.error("HOTPEPPER_KEY が未設定です"); process.exit(1); }

const EP = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/";
const AREAS = [
  { id: "shibuya",   name: "渋谷",           lat: 35.658034, lng: 139.701636 },
  { id: "shinjuku",  name: "新宿",           lat: 35.690921, lng: 139.700258 },
  { id: "ikebukuro", name: "池袋",           lat: 35.728926, lng: 139.710380 },
  { id: "ginza",     name: "銀座・有楽町",   lat: 35.671989, lng: 139.763965 },
  { id: "ebisu",     name: "恵比寿・中目黒", lat: 35.646691, lng: 139.710106 },
  { id: "kichijoji", name: "吉祥寺",         lat: 35.703325, lng: 139.579712 },
  { id: "yokohama",  name: "横浜",           lat: 35.466188, lng: 139.622715 },
  { id: "kawasaki",  name: "川崎",           lat: 35.531967, lng: 139.696888 },
  { id: "fujisawa",  name: "藤沢",           lat: 35.338989, lng: 139.487095 },
  { id: "kamakura",  name: "鎌倉",           lat: 35.319065, lng: 139.550178 },
  { id: "zushi",     name: "逗子・葉山",     lat: 35.295645, lng: 139.580633 },
];
// アプリの質問が使うジャンルを網羅的に集める（1ジャンルに偏らせない）
const GENRES = ["G001","G002","G003","G004","G005","G006","G007","G008","G009","G011","G012","G013","G014","G015","G016","G017"];
const PER_GENRE = 20;
const MAX_PER_AREA = 260;

const yes = (v) => typeof v === "string" && (v.includes("あり") || v.includes("OK") || (v.includes("営業") && !v.includes("していない")));
// 予算コードの目安（円）。average文字列が取れない店の代替値に使う
const BUDGET_MID = { B009:600, B010:900, B011:1200, B001:1800, B002:2500, B003:3500, B008:4500, B004:6000, B005:9000, B006:15000, B012:22000, B013:32000, B014:45000 };

function priceOf(shop) {
  const avg = shop?.budget?.average || "";
  const nums = (avg.match(/\d[\d,]*/g) || []).map((n) => parseInt(n.replace(/,/g, ""), 10));
  if (nums.length) return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  return BUDGET_MID[shop?.budget?.code] || 0;
}

async function get(params) {
  const url = EP + "?" + new URLSearchParams({ key: KEY, format: "json", ...params });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const err = data?.results?.error;
      if (err?.length) throw new Error(err[0].message || "APIエラー");
      return data.results.shop || [];
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

function slim(s) {
  // 設備フラグが未登録でも、キャッチコピーに明記されていれば拾う
  // （例:「【個室】2名～40名様迄可」なのに private_room が未設定の店が実在する）
  const text = [s.name, s.catch, s.genre?.catch].filter(Boolean).join(" ");
  const mentions = (re) => re.test(text);
  return {
    id: s.id,
    name: s.name,
    catch: [s.catch, s.genre?.catch].filter(Boolean).join(" ").slice(0, 120),
    genres: [s.genre?.code, s.sub_genre?.code].filter(Boolean),
    genreName: s.genre?.name || "",
    price: priceOf(s),
    budgetText: s.budget?.average || "",
    partyCap: parseInt(s.party_capacity, 10) || 0,
    access: (s.mobile_access || s.access || "").replace(/<[^>]*>/g, "").slice(0, 60),
    photo: s.photo?.pc?.l || s.photo?.mobile?.l || "",
    url: s.urls?.pc || "",
    lat: Number(s.lat), lng: Number(s.lng),
    flags: {
      private_room: yes(s.private_room) || mentions(/個室|完全個室|掘りごたつ個室/),
      free_drink: yes(s.free_drink) || mentions(/飲み放題|のみ放題|飲放/),
      night_view: yes(s.night_view) || mentions(/夜景/),
      midnight: yes(s.midnight), course: yes(s.course) || mentions(/コース/), wifi: yes(s.wifi),
      open_air: yes(s.open_air), charter: yes(s.charter), lunch: yes(s.lunch), card: yes(s.card),
    },
  };
}

await mkdir("data", { recursive: true });
const summary = [];

for (const area of AREAS) {
  const found = new Map();
  const base = { lat: area.lat, lng: area.lng, range: "5", order: "4" };
  // 全体のおすすめ順 + ジャンル別に集めて偏りをなくす
  for (const shop of await get({ ...base, count: "60" })) found.set(shop.id, shop);
  for (const g of GENRES) {
    try {
      for (const shop of await get({ ...base, genre: g, count: String(PER_GENRE) })) found.set(shop.id, shop);
    } catch (e) {
      console.warn(`  ${area.name}/${g}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 120)); // APIへの負荷を抑える
  }
  const shops = [...found.values()].map(slim).filter((s) => s.name && s.lat && s.lng).slice(0, MAX_PER_AREA);
  await writeFile(`data/${area.id}.json`, JSON.stringify(shops));
  console.log(`${area.name}: ${shops.length}件`);
  summary.push({ id: area.id, name: area.name, lat: area.lat, lng: area.lng, count: shops.length });
}

await writeFile("data/index.json", JSON.stringify({ updated_at: new Date().toISOString(), areas: summary }, null, 2));
console.log("合計:", summary.reduce((a, b) => a + b.count, 0), "件");
