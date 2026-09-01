// スライド1枚ぶんのHTMLを組み立てる。render.mjs から呼ばれる。
// 出力は 1080x1350（Instagramフィードで最も面積が取れる 4:5）。
// レイアウトは 上部(eyebrow/ページ番号) / 中央(本体・上下中央寄せ) / 下部(フッター) の3段固定。

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// **強調** をベタ塗りのハイライトにする。サムネイルでも読めるよう半透明にはしない。
const mark = (s) => esc(s).replace(/\*\*([\s\S]+?)\*\*/g, '<span class="mk">$1</span>');
const br = (s) => mark(s).replace(/\n/g, "<br>");

const SITE = "otakoki-zushi.github.io\n/kimemeshi";

const CSS = `
@font-face{font-family:"DelaJP";src:url("fonts/DelaGothicOne-Regular.ttf");font-weight:400}
@font-face{font-family:"ZenJP";src:url("fonts/ZenKakuGothicNew-Black.ttf");font-weight:900}
@font-face{font-family:"ZenJP";src:url("fonts/ZenKakuGothicNew-Bold.ttf");font-weight:700}
@font-face{font-family:"NotoJP";src:url("fonts/NotoSansJP.ttf");font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
body{font-family:"NotoJP",sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}

.slide{width:1080px;height:1350px;display:flex;flex-direction:column;
  padding:80px 78px 70px;overflow:hidden}
.dark{background:#0E1217;color:#F5EFE9}
.light{background:#F4F6F8;color:#131820}
.accent{background:#D9482A;color:#FFF6F2}

.top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;min-height:44px}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;padding:36px 0}
.mid.top-align{justify-content:flex-start}

.eyebrow{font-weight:700;font-size:26px;letter-spacing:.2em;text-transform:uppercase;opacity:.6}
.pager{font-weight:700;font-size:24px;letter-spacing:.14em;opacity:.4;white-space:nowrap;margin-left:auto}
.rule{height:6px;width:104px;background:#FF7A59;border-radius:3px;margin-bottom:38px}
.light .rule{background:#D9482A}
.accent .rule{background:rgba(255,255,255,.9)}

.h-dela{font-family:"DelaJP";line-height:1.44;letter-spacing:.005em}
.h-zen{font-family:"ZenJP";font-weight:900;line-height:1.42;letter-spacing:-.012em}

/* ベタ塗りハイライト：サムネイルで最初に目に入る場所を作る */
.mk{padding:.02em .12em;border-radius:6px}
.dark .mk{background:#FF7A59;color:#0E1217}
.light .mk{background:#D9482A;color:#FFF6F2}
.accent .mk{background:#FFF6F2;color:#C13A1C}

.sub{font-size:31px;line-height:1.82;font-weight:500;opacity:.8;margin-top:36px;max-width:880px}
.note{font-size:24px;line-height:1.7;opacity:.52;font-weight:500;margin-top:18px}

.foot{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;
  padding-top:28px;border-top:2px solid currentColor;opacity:.8}
.foot .brand{font-family:"ZenJP";font-weight:900;font-size:28px;letter-spacing:.02em;white-space:nowrap}
.foot .meta{font-size:21px;font-weight:500;opacity:.75;text-align:right;line-height:1.55}

.swipe{display:inline-flex;align-items:center;gap:16px;font-size:26px;font-weight:700;
  margin-top:44px;opacity:.85}
.swipe .arw{font-family:"DelaJP";font-size:30px}

/* stat */
.stat{display:flex;align-items:baseline;gap:22px;margin-top:20px}
.stat .big{font-family:"DelaJP";font-size:250px;line-height:.9;letter-spacing:-.025em}
.stat .unit{font-family:"ZenJP";font-weight:900;font-size:66px;opacity:.7}
.statlabel{font-family:"ZenJP";font-weight:900;font-size:44px;line-height:1.5}

/* ranking */
.rank{display:flex;flex-direction:column;gap:var(--gap,20px);margin-top:52px}
.row{display:grid;grid-template-columns:62px 268px 1fr 158px;align-items:center;gap:22px}
.row .rk{font-family:"DelaJP";font-size:32px;opacity:.34}
.row .nm{font-family:"ZenJP";font-weight:700;font-size:var(--nm,35px);letter-spacing:-.015em}
.row .track{height:26px;background:rgba(19,24,32,.09);border-radius:0 13px 13px 0}
.dark .row .track{background:rgba(245,239,233,.10)}
.row .track i{display:block;height:100%;border-radius:0 13px 13px 0;background:rgba(217,72,42,.3)}
.dark .row .track i{background:rgba(255,122,89,.28)}
.row .vl{font-family:"DelaJP";font-size:38px;text-align:right;letter-spacing:-.02em;opacity:.85}
.row.hi .rk{opacity:.8}
.row.hi .nm{font-weight:900}
.row.hi .track i{background:#D9482A}
.dark .row.hi .track i{background:#FF7A59}
.row.hi .vl{color:#BC3A1E;opacity:1}
.dark .row.hi .vl{color:#FF7A59}

/* list */
.list{display:flex;flex-direction:column;gap:var(--gap,34px);margin-top:54px}
.li{display:flex;gap:28px;align-items:flex-start}
.li .no{font-family:"DelaJP";font-size:34px;flex:none;min-width:62px;line-height:1.45;opacity:.38}
.li .tx{font-family:"ZenJP";font-weight:700;font-size:var(--tx,40px);line-height:1.55;letter-spacing:-.012em}
.li .tx small{display:block;font-family:"NotoJP";font-weight:500;font-size:26px;line-height:1.7;
  opacity:.6;margin-top:11px;letter-spacing:0}

/* 4択（アプリのUIを模す） */
.choices{display:flex;flex-direction:column;gap:24px;margin-top:56px}
.ch{border:3px solid rgba(245,239,233,.20);border-radius:28px;padding:36px 40px;
  font-family:"ZenJP";font-weight:700;font-size:41px;display:flex;align-items:center;gap:28px}
.light .ch{border-color:rgba(19,24,32,.14)}
.ch .em{font-size:47px}
.ch.on{border-color:#FF7A59;background:rgba(255,122,89,.16)}
.light .ch.on{border-color:#D9482A;background:rgba(217,72,42,.10)}

/* 二択 */
.ab{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:56px}
.ab .side{border-radius:32px;padding:60px 40px;display:flex;flex-direction:column;gap:22px;
  min-height:460px;justify-content:center;text-align:center}
.ab .a{background:rgba(255,122,89,.16);border:3px solid rgba(255,122,89,.42)}
.ab .b{background:rgba(245,239,233,.07);border:3px solid rgba(245,239,233,.2)}
.light .ab .a{background:rgba(217,72,42,.12);border-color:rgba(217,72,42,.36)}
.light .ab .b{background:rgba(19,24,32,.05);border-color:rgba(19,24,32,.13)}
.ab .k{font-family:"DelaJP";font-size:42px;opacity:.45}
.ab .t{font-family:"ZenJP";font-weight:900;font-size:44px;line-height:1.42}
.ab .d{font-size:26px;line-height:1.7;opacity:.72;font-weight:500}
`;

function top(slide, i, n) {
  const eb = slide.eyebrow ? `<div class="eyebrow">${esc(slide.eyebrow)}</div>` : "<div></div>";
  const pg = (i > 0 && n > 1) ? `<div class="pager">${i + 1} / ${n}</div>` : "";
  return `<div class="top">${eb}${pg}</div>`;
}
function foot(slide, post) {
  const meta = slide.foot != null ? slide.foot : (post.foot && post.foot !== "キメメシ" ? post.foot : SITE);
  return `<div class="foot"><div class="brand">キメメシ</div>
    <div class="meta">${br(meta)}</div></div>`;
}
const wrap = (slide, post, i, n, body, cls) =>
  `<div class="slide ${slide.bg || cls}">${top(slide, i, n)}
     <div class="mid${slide.align === "top" ? " top-align" : ""}">${body}</div>
   ${foot(slide, post)}</div>`;

const TYPES = {
  cover: (s, p, i, n) => wrap(s, p, i, n, `
    ${s.eyebrow ? '<div class="rule"></div>' : ""}
    <div class="h-dela" style="font-size:${s.size || 92}px">${br(s.title)}</div>
    ${s.sub ? `<div class="sub">${br(s.sub)}</div>` : ""}
    ${s.swipe === false ? "" : `<div class="swipe"><span class="arw">→</span>${esc(s.swipe || "スワイプ")}</div>`}
  `, "dark"),

  stat: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="statlabel">${br(s.label)}</div>
    <div class="stat"><div class="big">${esc(s.value)}</div><div class="unit">${esc(s.unit || "")}</div></div>
    ${s.sub ? `<div class="sub">${br(s.sub)}</div>` : ""}
  `, "light"),

  rank(s, p, i, n) {
    const vals = s.rows.map(r => Math.abs(parseFloat(r.v)));
    const max = Math.max(...vals);
    // 行数が少ないときは行間と文字を広げて、下に余白が余らないようにする
    const gap = s.rows.length <= 4 ? 40 : s.rows.length <= 5 ? 32 : 22;
    const nm = s.rows.length <= 5 ? 40 : 35;
    const rows = s.rows.map((r, k) => `
      <div class="row${r.hi ? " hi" : ""}">
        <div class="rk">${r.rk != null ? r.rk : k + 1}</div>
        <div class="nm">${esc(r.n)}</div>
        <div class="track"><i style="width:${Math.max(3, Math.round(vals[k] / max * 100))}%"></i></div>
        <div class="vl">${esc(r.v)}</div>
      </div>`).join("");
    return wrap(s, p, i, n, `
      <div class="h-zen" style="font-size:${s.size || 52}px;max-width:840px">${br(s.title)}</div>
      ${s.sub ? `<div class="note">${br(s.sub)}</div>` : ""}
      <div class="rank" style="--gap:${gap}px;--nm:${nm}px">${rows}</div>
    `, "light");
  },

  list(s, p, i, n) {
    const gap = s.items.length <= 2 ? 56 : s.items.length <= 3 ? 42 : 30;
    const tx = s.items.length <= 2 ? 46 : s.items.length <= 3 ? 42 : 37;
    const items = s.items.map((t, k) => {
      const [head, ...rest] = String(t).split("｜");
      const no = s.bullet ? (s.bullet.length <= 2 && /^\d+$/.test(s.bullet)
        ? String(Number(s.bullet) + k).padStart(2, "0") : s.bullet)
        : String(k + 1).padStart(2, "0");
      return `<div class="li"><div class="no">${esc(no)}</div>
        <div class="tx">${br(head)}${rest.length ? `<small>${br(rest.join("｜"))}</small>` : ""}</div></div>`;
    }).join("");
    return wrap(s, p, i, n, `
      <div class="h-zen" style="font-size:${s.size || 52}px;max-width:860px">${br(s.title)}</div>
      <div class="list" style="--gap:${gap}px;--tx:${tx}px">${items}</div>
    `, "light");
  },

  choices(s, p, i, n) {
    const ch = s.options.map(o => {
      const on = String(o).startsWith("*");
      const t = String(o).replace(/^\*/, "");
      const m = t.match(/^(\S+?)\s+(.+)$/);
      return `<div class="ch${on ? " on" : ""}">${m
        ? `<span class="em">${esc(m[1])}</span><span>${esc(m[2])}</span>`
        : `<span>${esc(t)}</span>`}</div>`;
    }).join("");
    return wrap(s, p, i, n, `
      <div class="h-zen" style="font-size:${s.size || 58}px">${br(s.title)}</div>
      <div class="choices">${ch}</div>
    `, "dark");
  },

  ab: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="h-zen" style="font-size:${s.size || 58}px">${br(s.title)}</div>
    <div class="ab">
      <div class="side a"><div class="k">A</div><div class="t">${br(s.a.t)}</div><div class="d">${br(s.a.d || "")}</div></div>
      <div class="side b"><div class="k">B</div><div class="t">${br(s.b.t)}</div><div class="d">${br(s.b.d || "")}</div></div>
    </div>
    ${s.sub ? `<div class="sub" style="font-size:27px">${br(s.sub)}</div>` : ""}
  `, "dark"),

  point: (s, p, i, n) => wrap(s, p, i, n, `
    ${s.eyebrow ? '<div class="rule"></div>' : ""}
    <div class="h-zen" style="font-size:${s.size || 66}px">${br(s.title)}</div>
    ${s.sub ? `<div class="sub">${br(s.sub)}</div>` : ""}
  `, "light"),

  cta: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="h-dela" style="font-size:${s.size || 76}px">${br(s.title)}</div>
    ${s.sub ? `<div class="sub" style="opacity:.92">${br(s.sub)}</div>` : ""}
  `, "accent"),
};

export function slideHtml(slide, post, i, n) {
  const fn = TYPES[slide.type];
  if (!fn) throw new Error("unknown slide type: " + slide.type);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
    <body>${fn(slide, post, i, n)}</body></html>`;
}
