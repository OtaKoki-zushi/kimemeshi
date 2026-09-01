// スライド1枚ぶんのHTMLを組み立てる。render.mjs から呼ばれる。
// 1080x1350（Instagramフィードで最も面積が取れる 4:5）。
// レイアウトは 上部 / 中央（上下中央寄せ）/ 下部フッター の3段固定。

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// **強調** は黄色マーカー。サムネイルで最初に目が行く場所を1枚に1つだけ作る。
const mark = (s) => esc(s).replace(/\*\*([\s\S]+?)\*\*/g, '<span class="mk">$1</span>');
const br = (s) => mark(s).replace(/\n/g, "<br>");

const SITE = "otakoki-zushi.github.io\n/kimemeshi";

/* 色は3色＋インクに絞る（増やすと途端に素人っぽくなる）
   メイン=サンセットオレンジ / サブ=クリーム / アクセント=イエロー */
const CSS = `
@font-face{font-family:"Dela";src:url("fonts/DelaGothicOne-Regular.ttf")}
@font-face{font-family:"Round";src:url("fonts/MPLUSRounded1c-Black.ttf");font-weight:900}
@font-face{font-family:"Round";src:url("fonts/MPLUSRounded1c-Bold.ttf");font-weight:700}
@font-face{font-family:"Noto";src:url("fonts/NotoSansJP.ttf");font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
body{font-family:"Noto",sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden}

.slide{width:1080px;height:1350px;display:flex;flex-direction:column;
  padding:70px 64px 62px;overflow:hidden;position:relative}

/* ---- 背景 ---- */
.cream{background:#FFF3E2;color:#2B1D12}
.cream::before{content:"";position:absolute;inset:0;
  background-image:radial-gradient(#2B1D12 3px, transparent 3px);
  background-size:44px 44px;opacity:.05}
.sun{background:linear-gradient(152deg,#FF9A3C 0%,#FF6B35 46%,#F5355F 100%);color:#FFF8EE}
.ink{background:#2B1D12;color:#FFF3E2}
.ink::before{content:"";position:absolute;inset:0;
  background-image:radial-gradient(#FFF3E2 3px, transparent 3px);
  background-size:44px 44px;opacity:.05}
.slide > *{position:relative;z-index:1}

/* ---- 3段構成 ---- */
.top{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:56px}
.mid{flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;padding:26px 0}

.eyebrow{align-self:flex-start;font-family:"Round";font-weight:900;font-size:27px;letter-spacing:.06em;
  background:#2B1D12;color:#FFD23F;padding:11px 26px;border-radius:999px}
.sun .eyebrow{background:#FFF8EE;color:#F5355F}
.ink .eyebrow{background:#FFD23F;color:#2B1D12}
.pager{font-family:"Dela";font-size:26px;opacity:.4;margin-left:auto}

/* ---- 見出し ---- */
.h1{font-family:"Dela";line-height:1.46;letter-spacing:.004em}
.h2{font-family:"Round";font-weight:900;line-height:1.44;letter-spacing:-.01em}

/* 縁取り文字：サムネイルでも輪郭が飛ばない */
.out{color:#FFF8EE;-webkit-text-stroke:8px #2B1D12;paint-order:stroke fill;
  text-shadow:9px 10px 0 #FFD23F}
.cream .out{color:#FFF8EE}
.sun .out{-webkit-text-stroke-color:#2B1D12;text-shadow:10px 11px 0 #FFD23F}

/* 黄色マーカー */
.mk{background:#FFD23F;color:#2B1D12;padding:.04em .16em;border-radius:10px;
  box-shadow:6px 6px 0 rgba(43,29,18,.18)}
.sun .mk{background:#FFF8EE;color:#F5355F;box-shadow:6px 6px 0 rgba(43,29,18,.2)}
.out .mk{background:#FFD23F;color:#2B1D12;-webkit-text-stroke:0;text-shadow:none;box-shadow:none}

.sub{font-size:31px;line-height:1.8;font-weight:700;opacity:.86;margin-top:38px;max-width:880px}
.note{font-size:25px;line-height:1.7;font-weight:700;opacity:.58;margin-top:16px}

/* ---- フッター ---- */
.foot{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:24px}
.foot .brand{font-family:"Round";font-weight:900;font-size:30px;
  background:#2B1D12;color:#FFD23F;padding:12px 28px;border-radius:999px;white-space:nowrap}
.sun .foot .brand{background:#FFF8EE;color:#F5355F}
.ink .foot .brand{background:#FFD23F;color:#2B1D12}
.foot .meta{font-size:21px;font-weight:700;opacity:.6;text-align:right;line-height:1.55}

/* ---- ステッカー（回転させて貼った感じにする） ---- */
.sticker{position:absolute;top:210px;right:52px;z-index:3;transform:rotate(9deg);
  font-family:"Round";font-weight:900;font-size:30px;line-height:1.35;text-align:center;
  background:#FFD23F;color:#2B1D12;padding:24px 26px;border-radius:26px;
  border:6px solid #2B1D12;box-shadow:9px 9px 0 rgba(43,29,18,.22)}

.swipe{display:inline-flex;align-self:flex-start;align-items:center;gap:14px;font-family:"Round";font-weight:900;
  font-size:28px;margin-top:44px;background:#2B1D12;color:#FFF3E2;padding:15px 32px;border-radius:999px}
.sun .swipe{background:#FFF8EE;color:#F5355F}
.ink .swipe{background:#FFD23F;color:#2B1D12}

/* ---- カード ---- */
.card{background:#FFF8EE;border:6px solid #2B1D12;border-radius:38px;
  box-shadow:14px 15px 0 rgba(43,29,18,.2)}
.ink .card{background:#FFF8EE;color:#2B1D12}

/* ---- 数字ドン ---- */
.statwrap{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.statlabel{font-family:"Round";font-weight:900;font-size:44px;line-height:1.45}
.stat{display:flex;align-items:baseline;gap:24px;margin-top:16px}
.stat .big{font-family:"Dela";font-size:268px;line-height:1.02;letter-spacing:-.03em;
  color:#FFF8EE;-webkit-text-stroke:9px #2B1D12;paint-order:stroke fill;
  text-shadow:11px 12px 0 #FF6B35}
.ink .stat .big{text-shadow:12px 13px 0 #FFD23F}
.sun .stat .big{text-shadow:12px 13px 0 #FFD23F}
.stat .unit{font-family:"Round";font-weight:900;font-size:70px;opacity:.8}

/* ---- ランキング ---- */
.rank{display:flex;flex-direction:column;gap:var(--gap,18px);margin-top:44px}
.rk-row{display:grid;grid-template-columns:74px 1fr 152px;align-items:center;gap:22px;
  background:#FFF8EE;border:5px solid #2B1D12;border-radius:26px;padding:18px 26px;
  box-shadow:8px 8px 0 rgba(43,29,18,.14)}
.rk-row .medal{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;
  justify-content:center;font-family:"Dela";font-size:30px;color:#2B1D12;
  background:#E6DCCB;border:4px solid #2B1D12}
.rk-row .nm{font-family:"Round";font-weight:900;font-size:var(--nm,38px);color:#2B1D12;
  letter-spacing:-.015em;display:flex;flex-direction:column;gap:9px}
.rk-row .bar{height:14px;background:#E6DCCB;border-radius:999px;max-width:430px}
.rk-row .bar i{display:block;height:100%;border-radius:999px;background:#FF6B35}
.rk-row .vl{font-family:"Dela";font-size:42px;text-align:right;color:#2B1D12;letter-spacing:-.02em}
.rk-row.hi{background:#FFD23F}
.rk-row.hi .medal{background:#FF6B35;color:#FFF8EE}
.rk-row.hi .bar{background:rgba(43,29,18,.16)}
.rk-row.hi .bar i{background:#2B1D12}

/* ---- 箇条書き（1項目=1カード） ---- */
.list{display:flex;flex-direction:column;gap:var(--gap,26px);margin-top:46px}
.li{display:flex;gap:24px;align-items:center;background:#FFF8EE;border:5px solid #2B1D12;
  border-radius:30px;padding:26px 30px;box-shadow:9px 9px 0 rgba(43,29,18,.16)}
.li .no{flex:none;width:66px;height:66px;border-radius:50%;background:#FF6B35;color:#FFF8EE;
  font-family:"Dela";font-size:29px;display:flex;align-items:center;justify-content:center;
  border:5px solid #2B1D12}
.li .tx{font-family:"Round";font-weight:900;font-size:var(--tx,38px);line-height:1.48;
  color:#2B1D12;letter-spacing:-.012em}
.li .tx small{display:block;font-family:"Noto";font-weight:700;font-size:25px;line-height:1.6;
  opacity:.6;margin-top:9px;letter-spacing:0}

/* ---- 4択 ---- */
.choices{display:flex;flex-direction:column;gap:22px;margin-top:48px}
.ch{border:5px solid #2B1D12;border-radius:30px;padding:30px 34px;background:#FFF8EE;color:#2B1D12;
  font-family:"Round";font-weight:900;font-size:41px;display:flex;align-items:center;gap:26px;
  box-shadow:8px 8px 0 rgba(43,29,18,.14)}
.ch .em{font-size:47px}
.ch.on{background:#FFD23F;box-shadow:8px 8px 0 #FF6B35}

/* ---- 二択 ---- */
.ab{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:50px}
.ab .side{border-radius:38px;border:6px solid #2B1D12;padding:44px 32px;display:flex;
  flex-direction:column;gap:18px;min-height:470px;justify-content:center;text-align:center;
  box-shadow:12px 13px 0 rgba(43,29,18,.2)}
.ab .a{background:#FF6B35;color:#FFF8EE}
.ab .b{background:#FFF8EE;color:#2B1D12}
.ab .k{font-family:"Dela";font-size:52px;opacity:.85}
.ab .t{font-family:"Round";font-weight:900;font-size:45px;line-height:1.4}
.ab .d{font-size:26px;line-height:1.7;opacity:.85;font-weight:700}
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
const BG = { dark: "ink", light: "cream", accent: "sun", ink: "ink", cream: "cream", sun: "sun" };
const wrap = (s, p, i, n, body, cls) =>
  `<div class="slide ${BG[s.bg] || cls}">
     ${s.sticker ? `<div class="sticker">${br(s.sticker)}</div>` : ""}
     ${top(s, i, n)}<div class="mid">${body}</div>${foot(s, p)}</div>`;

const TYPES = {
  cover: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="h1 out" style="font-size:${s.size || 88}px">${br(s.title)}</div>
    ${s.sub ? `<div class="sub">${br(s.sub)}</div>` : ""}
    ${s.swipe === false ? "" : `<div class="swipe">${esc(s.swipe || "スワイプ")} →</div>`}
  `, "sun"),

  stat: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="statwrap">
      <div class="statlabel">${br(s.label)}</div>
      <div class="stat"><div class="big">${esc(s.value)}</div><div class="unit">${esc(s.unit || "")}</div></div>
    </div>
    ${s.sub ? `<div class="sub">${br(s.sub)}</div>` : ""}
  `, "cream"),

  rank(s, p, i, n) {
    const vals = s.rows.map(r => Math.abs(parseFloat(r.v)));
    const max = Math.max(...vals);
    const gap = s.rows.length <= 4 ? 30 : s.rows.length <= 5 ? 22 : 15;
    const nm = s.rows.length <= 5 ? 40 : 35;
    const rows = s.rows.map((r, k) => {
      const rank = r.rk != null ? r.rk : k + 1;
      const medal = rank === 1 ? "1" : rank === 2 ? "2" : rank === 3 ? "3" : String(rank);
      return `<div class="rk-row${r.hi ? " hi" : ""}">
        <div class="medal">${esc(medal)}</div>
        <div class="nm">${esc(r.n)}
          <span class="bar"><i style="width:${Math.max(4, Math.round(vals[k] / max * 100))}%"></i></span></div>
        <div class="vl">${esc(r.v)}</div>
      </div>`;
    }).join("");
    return wrap(s, p, i, n, `
      <div class="h2" style="font-size:${s.size || 52}px;max-width:860px">${br(s.title)}</div>
      ${s.sub ? `<div class="note">${br(s.sub)}</div>` : ""}
      <div class="rank" style="--gap:${gap}px;--nm:${nm}px">${rows}</div>
    `, "cream");
  },

  list(s, p, i, n) {
    const gap = s.items.length <= 2 ? 40 : s.items.length <= 3 ? 30 : 22;
    const tx = s.items.length <= 2 ? 44 : s.items.length <= 3 ? 40 : 36;
    const items = s.items.map((t, k) => {
      const [head, ...rest] = String(t).split("｜");
      const no = s.bullet
        ? (/^\d+$/.test(s.bullet) ? String(Number(s.bullet) + k).padStart(2, "0") : s.bullet)
        : String(k + 1).padStart(2, "0");
      return `<div class="li"><div class="no">${esc(no)}</div>
        <div class="tx">${br(head)}${rest.length ? `<small>${br(rest.join("｜"))}</small>` : ""}</div></div>`;
    }).join("");
    return wrap(s, p, i, n, `
      <div class="h2" style="font-size:${s.size || 52}px;max-width:880px">${br(s.title)}</div>
      <div class="list" style="--gap:${gap}px;--tx:${tx}px">${items}</div>
    `, "cream");
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
      <div class="h2" style="font-size:${s.size || 58}px">${br(s.title)}</div>
      <div class="choices">${ch}</div>
    `, "ink");
  },

  ab: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="h2" style="font-size:${s.size || 58}px">${br(s.title)}</div>
    <div class="ab">
      <div class="side a"><div class="k">A</div><div class="t">${br(s.a.t)}</div><div class="d">${br(s.a.d || "")}</div></div>
      <div class="side b"><div class="k">B</div><div class="t">${br(s.b.t)}</div><div class="d">${br(s.b.d || "")}</div></div>
    </div>
    ${s.sub ? `<div class="sub" style="font-size:27px;margin-top:30px">${br(s.sub)}</div>` : ""}
  `, "cream"),

  point: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="h2" style="font-size:${s.size || 64}px">${br(s.title)}</div>
    ${s.sub ? `<div class="sub">${br(s.sub)}</div>` : ""}
  `, "ink"),

  cta: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="h1 out" style="font-size:${s.size || 74}px">${br(s.title)}</div>
    ${s.sub ? `<div class="sub" style="opacity:.95">${br(s.sub)}</div>` : ""}
  `, "sun"),
};

export function slideHtml(slide, post, i, n) {
  const fn = TYPES[slide.type];
  if (!fn) throw new Error("unknown slide type: " + slide.type);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
    <body>${fn(slide, post, i, n)}</body></html>`;
}
