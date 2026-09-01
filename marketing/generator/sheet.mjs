import pw from "/opt/node22/lib/node_modules/playwright/index.js";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve("../posts");
const files = [];
for (const d of readdirSync(root).filter(x=>!x.endsWith(".json")).sort())
  for (const f of readdirSync(resolve(root,d)).filter(x=>x.endsWith(".png")).sort())
    files.push({p:resolve(root,d,f), l:d.replace(/^\d+-/,"")+"/"+f.replace(".png","")});
const cols=10, w=190;
const html=`<html><body style="margin:0;background:#666;display:grid;
 grid-template-columns:repeat(${cols},${w}px);gap:6px;padding:6px;font-family:sans-serif">
 ${files.map(f=>`<div><div style="color:#fff;font-size:9px;padding:1px">${f.l}</div>
 <img src="data:image/png;base64,${readFileSync(f.p).toString("base64")}" style="width:${w}px;display:block"></div>`).join("")}</body></html>`;
const b=await pw.chromium.launch();
const p=await b.newPage({viewport:{width:cols*(w+6)+6,height:900}});
await p.setContent(html,{waitUntil:"load"});
await p.screenshot({path:"sheet.png",fullPage:true});
await b.close(); console.log("slides:",files.length);
