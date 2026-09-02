// 投稿定義（posts.js）から Instagram 用の PNG を書き出す。
// 使い方: node render.mjs [出力先ディレクトリ]
// playwright は環境によって置き場所が違うので、まずローカル解決を試す
let pw;
try { pw = (await import("playwright")).default; }
catch { pw = (await import("/opt/node22/lib/node_modules/playwright/index.js")).default; }
import { slideHtml } from "./template.js";
import { POSTS } from "./posts.js";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outRoot = resolve(here, process.argv[2] || "../posts");

const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });

await rm(outRoot, { recursive: true, force: true });
await mkdir(outRoot, { recursive: true });

let total = 0;
const index = [];
for (const post of POSTS) {
  const dir = resolve(outRoot, post.id);
  await mkdir(dir, { recursive: true });
  const n = post.slides.length;
  for (let i = 0; i < n; i++) {
    const html = slideHtml(post.slides[i], post, i, n);
    const tmp = resolve(here, ".slide.html");
    await writeFile(tmp, html, "utf8");
    await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(dir, `${String(i + 1).padStart(2, "0")}.png`) });
    total++;
  }
  // キャプションとタグを同じフォルダに置いておく（投稿時にコピペするだけにする）
  await writeFile(resolve(dir, "caption.txt"),
    `${post.caption.trim()}\n\n${post.tags.join(" ")}\n`, "utf8");
  index.push({ id: post.id, title: post.title, kind: post.kind, slides: n });
  console.log(`${post.id.padEnd(28)} ${String(n).padStart(2)}枚  ${post.title}`);
}
await rm(resolve(here, ".slide.html"), { force: true });
await writeFile(resolve(outRoot, "index.json"), JSON.stringify(index, null, 2) + "\n", "utf8");
await browser.close();
console.log(`\n${POSTS.length}投稿 / ${total}枚 を書き出しました → ${outRoot}`);
