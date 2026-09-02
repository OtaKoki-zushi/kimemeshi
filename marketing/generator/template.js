// スライド1枚ぶんのHTMLを組み立てる。render.mjs から呼ばれる。
// 1080x1350（Instagramフィードで最も面積が取れる 4:5）。
// レイアウトは 上部 / 中央（上下中央寄せ）/ 下部フッター の3段固定。

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// **強調** は黄色マーカー。サムネイルで最初に目が行く場所を1枚に1つだけ作る。
const mark = (s) => esc(s).replace(/\*\*([\s\S]+?)\*\*/g, '<span class="mk">$1</span>');
const br = (s) => mark(s).replace(/\n/g, "<br>");

const SITE = "otakoki-zushi.github.io\n/kimemeshi";

/* 参照の順位バッジ配色（1位から順に 金・銀・橙・緑・青・紫・桃） */
const RANKC = ["#F0B429", "#A6AEB4", "#E8853C", "#5FBF7E", "#4FA3D9", "#9B7BD4", "#E8709F", "#8FA0A8"];
/* 説明文の **強調** は、参照にならって黄色マーカーではなく赤文字にする */
const red = (t) => esc(t).replace(/\*\*([\s\S]+?)\*\*/g, '<span class="rd">$1</span>').replace(/\n/g, "<br>");
/* 見出しの **強調** はオレンジの文字色（縁取りは残す） */
const headline = (t) => esc(t).replace(/\*\*([\s\S]+?)\*\*/g, '<span class="o">$1</span>').replace(/\n/g, "<br>");

/* マスコット「キメどん」。参照のタコの位置にあたる固定要素。
   写真が使えないぶん、毎回同じ絵が出ることでアカウントの見分けがつくようにする。 */
const MASCOT = `<svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#33261A" stroke-width="7" stroke-linecap="round">
    <path d="M74 34c-7-9 5-14-2-23" opacity=".55"/>
    <path d="M100 28c-7-9 5-14-2-23" opacity=".55"/>
    <path d="M126 34c-7-9 5-14-2-23" opacity=".55"/>
  </g>
  <g transform="rotate(-16 150 60)">
    <rect x="146" y="10" width="9" height="86" rx="4" fill="#E8C79A" stroke="#33261A" stroke-width="6"/>
    <rect x="162" y="10" width="9" height="86" rx="4" fill="#E8C79A" stroke="#33261A" stroke-width="6"/>
  </g>
  <path d="M42 92c14-26 102-26 116 0z" fill="#FFF8EE" stroke="#33261A" stroke-width="7" stroke-linejoin="round"/>
  <ellipse cx="100" cy="95" rx="72" ry="15" fill="#FFF8EE" stroke="#33261A" stroke-width="7"/>
  <path d="M30 96c0 62 30 92 70 92s70-30 70-92z" fill="#F5892B" stroke="#33261A" stroke-width="7" stroke-linejoin="round"/>
  <path d="M40 120c8 6 22 9 60 9s52-3 60-9" stroke="#FFD23F" stroke-width="9" fill="none" stroke-linecap="round" opacity=".85"/>
  <ellipse cx="72" cy="150" rx="11" ry="14" fill="#33261A"/>
  <ellipse cx="128" cy="150" rx="11" ry="14" fill="#33261A"/>
  <circle cx="76" cy="145" r="4" fill="#FFF8EE"/>
  <circle cx="132" cy="145" r="4" fill="#FFF8EE"/>
  <ellipse cx="52" cy="163" rx="12" ry="8" fill="#E23B3B" opacity=".35"/>
  <ellipse cx="148" cy="163" rx="12" ry="8" fill="#E23B3B" opacity=".35"/>
  <path d="M90 165c4 6 16 6 20 0" stroke="#33261A" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>`;

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

/* ================= 参照型（順位カード＋1位を隠す） =================
   参照/ のランキング投稿の構造を移植したもの。
   ヘッダー帯 / 順位カード7枚 / コメント誘導フッター の3段で1枚に収める。
   参照は右側に料理写真を置いているが、ホットペッパーの写真は使えないので
   そこを「数値タイル」に置き換えている。数字がこのアカウントの絵になる。 */
.ref{background:#FBEBD2;color:#33261A}
/* 参照型のクリーム面では、縁取り白抜きだと沈むので濃い文字＋黄色い影にする */
.ref .out{color:#33261A;-webkit-text-stroke:0;text-shadow:9px 10px 0 #FFD23F}
.ref .out .mk{background:#E23B3B;color:#FFF8EE;box-shadow:none}
.ref .stat .big{color:#E23B3B;-webkit-text-stroke:0;text-shadow:7px 8px 0 rgba(51,38,26,.13)}
.ref .eyebrow{background:#33261A;color:#FFD23F}
.ref .foot .brand{background:#33261A;color:#FFD23F}
.ref .swipe{background:#33261A;color:#FFF3E2}
.ref::before{content:"";position:absolute;inset:0;opacity:.5;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cpath d='M30 8c2 12 8 18 20 20-12 2-18 8-20 20-2-12-8-18-20-20 12-2 18-8 20-20z' fill='%23F5C77E' opacity='.55'/%3E%3Cpath d='M112 78c1.4 8 5.6 12 14 14-8.4 1.4-12.6 5.6-14 14-1.4-8-5.6-12-14-14 8.4-1.4 12.6-5.6 14-14z' fill='%23F0B429' opacity='.4'/%3E%3Ccircle cx='128' cy='24' r='4' fill='%23F5C77E' opacity='.5'/%3E%3Ccircle cx='58' cy='120' r='3' fill='%23F0B429' opacity='.45'/%3E%3C/svg%3E")}
.slide.r7{padding:40px 38px 34px}

/* ---- ヘッダー帯 ---- */
.r7head{display:grid;grid-template-columns:236px 1fr;align-items:center;gap:8px;min-height:296px}
.r7mascot{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px}
.r7mascot svg{width:196px;height:196px;overflow:visible}
.bubble{position:relative;background:#FFF;border:6px solid #33261A;border-radius:26px;
  padding:11px 18px;font-family:"Round";font-weight:900;font-size:25px;line-height:1.25;
  text-align:center;color:#33261A;box-shadow:5px 6px 0 rgba(51,38,26,.18)}
.bubble::after{content:"";position:absolute;left:36px;bottom:-19px;width:0;height:0;
  border:14px solid transparent;border-top-color:#33261A;border-bottom:0}
.r7title{display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.ribbon{position:relative;background:#E23B3B;color:#FFF;font-family:"Round";font-weight:900;
  font-size:36px;letter-spacing:.02em;padding:12px 46px;
  clip-path:polygon(0 0,100% 0,calc(100% - 22px) 50%,100% 100%,0 100%,22px 50%);
  box-shadow:0 6px 0 rgba(51,38,26,.18)}
.r7h{font-family:"Round";font-weight:900;line-height:1.16;letter-spacing:-.01em;
  color:#FFF8EE;-webkit-text-stroke:11px #33261A;paint-order:stroke fill;
  text-shadow:8px 9px 0 rgba(51,38,26,.22)}
.r7h .o{color:#F5892B}
.crown{font-size:52px;margin-left:10px;-webkit-text-stroke:0;text-shadow:none}

/* ---- 順位カード ---- */
.r7rows{flex:1;display:flex;flex-direction:column;gap:9px;min-height:0;margin-top:6px}
.r7row{flex:1;display:grid;grid-template-columns:132px 1fr 218px;align-items:stretch;gap:0;
  background:#FFFDF8;border:5px solid #33261A;border-radius:20px;overflow:hidden;
  box-shadow:0 6px 0 rgba(51,38,26,.16)}
.r7row .bd{background:var(--c);display:flex;flex-direction:column;align-items:center;
  justify-content:center;color:#FFF;border-right:5px solid #33261A;gap:0}
.r7row .bd b{font-family:"Dela";font-size:46px;line-height:.98;
  text-shadow:0 4px 0 rgba(51,38,26,.35)}
.r7row .bd i{font-style:normal;font-family:"Round";font-weight:900;font-size:21px;opacity:.95}
.r7row .tx{display:flex;flex-direction:column;justify-content:center;gap:5px;padding:0 22px;min-width:0}
.r7row .nm{font-family:"Round";font-weight:900;font-size:46px;line-height:1.1;color:#33261A;
  letter-spacing:-.02em;white-space:nowrap}
.r7row .ds{font-family:"Noto";font-weight:700;font-size:23px;line-height:1.42;color:#6B5847}
.r7row .ds .rd{color:#E23B3B}
.r7row .vt{display:flex;flex-direction:column;align-items:center;justify-content:center;
  border-left:5px solid #33261A;background:var(--vc,#FFF3DF);gap:6px;padding:0 8px}
.r7row .vt b{font-family:"Dela";font-size:44px;line-height:1;color:#33261A;letter-spacing:-.03em}
.r7row .vt b em{font-style:normal;font-family:"Round";font-weight:900;font-size:24px;margin-left:2px}
.r7row .vt .mini{width:132px;height:9px;border-radius:99px;background:rgba(51,38,26,.16)}
.r7row .vt .mini i{display:block;height:100%;border-radius:99px;background:var(--c)}
/* 1位を隠す */
.r7row.q .nm{background:#1C140D;color:#1C140D;border-radius:9px;padding:2px 26px;
  display:inline-flex;align-items:center;justify-content:center;min-width:340px}
.r7row.q .nm::after{content:"？";color:#FFF;font-size:44px}
.r7row.q .vt{background:#1C140D}
.r7row.q .vt b{color:#FFD23F}
.r7row.q .ds{color:#8A7563}

/* ---- コメント誘導フッター ---- */
.r7src{font-family:"Noto";font-weight:700;font-size:19px;color:#8A7563;text-align:right;
  margin-top:8px;letter-spacing:.01em}
.r7foot{display:flex;align-items:center;gap:14px;margin-top:8px}
.ask{flex:1;background:#33261A;color:#FFF3E2;border-radius:99px;padding:16px 30px;
  font-family:"Round";font-weight:900;font-size:31px;text-align:center;letter-spacing:-.01em}
.ask b{color:#FFD23F}
.r7foot .bm{font-family:"Round";font-weight:900;font-size:26px;background:#FFD23F;color:#33261A;
  border:5px solid #33261A;border-radius:99px;padding:11px 24px;white-space:nowrap}

/* ---- 1位の発表（参照の“めくり”に相当する1枚） ---- */
.rv{height:100%;display:flex}
.rvcard{flex:1;position:relative;overflow:hidden;background:#FFFDF8;border:7px solid #33261A;
  border-radius:44px;box-shadow:0 12px 0 rgba(51,38,26,.18);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:48px 46px}
.rvcard::before{content:"";position:absolute;top:0;left:0;right:0;height:22px;background:#F0B429}
.rv .crownbig{font-size:98px;line-height:1;margin-top:-6px}
.rv .badge{font-family:"Round";font-weight:900;font-size:44px;color:#FFF;background:#F0B429;
  border:6px solid #33261A;border-radius:99px;padding:6px 42px;box-shadow:0 7px 0 rgba(51,38,26,.2);
  margin-top:-10px}
.rv .nm{font-family:"Round";font-weight:900;font-size:136px;line-height:1.12;color:#33261A;
  letter-spacing:.005em;text-shadow:9px 10px 0 #FFD23F;margin-top:10px}
.rv .val{font-family:"Dela";font-size:172px;line-height:1;color:#E23B3B;letter-spacing:-.03em;
  text-shadow:7px 8px 0 rgba(51,38,26,.13);margin-top:2px}
.rv .val em{font-style:normal;font-size:64px;font-family:"Round";font-weight:900}
.rv .ds{font-family:"Noto";font-weight:700;font-size:33px;line-height:1.72;color:#5B4636;
  margin-top:10px;text-align:center;max-width:820px}
.rv .rvmascot{position:absolute;right:-4px;bottom:-18px}
.rv .rvmascot svg{width:186px;height:186px;overflow:visible}
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
const BG = { dark: "ink", light: "cream", accent: "sun", ink: "ink", cream: "cream", sun: "sun", ref: "ref" };
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
    const vals = s.rows.map(r => Math.abs(parseFloat(String(r.v).replace(/,/g, ""))));
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

  // 参照型ランキング。1枚に7位まで入れ、1位だけ黒塗りにしてコメントを取りに行く。
  // rows: [{ n:"街名", v:"38.6", u:"%", d:"説明。**ここは赤**", q:true で1位を隠す }]
  rank7(s, p, i, n) {
    const vals = s.rows.map(r => Math.abs(parseFloat(String(r.v).replace(/,/g, ""))) || 0);
    const max = Math.max(...vals, 1);
    const rows = s.rows.map((r, k) => {
      const rank = r.rk != null ? r.rk : k + 1;
      const c = RANKC[Math.min(rank, RANKC.length) - 1];
      const nm = r.q ? `<div class="nm"></div>` : `<div class="nm">${esc(r.n)}</div>`;
      const vb = r.q ? `<b>？</b>` : `<b>${esc(r.v)}${r.u ? `<em>${esc(r.u)}</em>` : ""}</b>`;
      const bar = r.q ? "" : `<span class="mini"><i style="width:${Math.max(6, Math.round(vals[k] / max * 100))}%"></i></span>`;
      return `<div class="r7row${r.q ? " q" : ""}" style="--c:${c}">
        <div class="bd"><b>${rank}</b><i>位</i></div>
        <div class="tx">${nm}${r.d ? `<div class="ds">${red(r.d)}</div>` : ""}</div>
        <div class="vt">${vb}${bar}</div>
      </div>`;
    }).join("");
    return `<div class="slide ref r7">
      <div class="r7head">
        <div class="r7mascot">${MASCOT}<div class="bubble">${br(s.bubble || "2,459軒\n数えた")}</div></div>
        <div class="r7title">
          ${s.eyebrow ? `<div class="ribbon">${esc(s.eyebrow)}</div>` : ""}
          <div class="r7h" style="font-size:${s.size || 76}px">${headline(s.title)}</div>
        </div>
      </div>
      <div class="r7rows">${rows}</div>
      <div class="r7src">${esc(s.src || (p.foot ? p.foot.replace(/\n/g, " ") : "n=2,459 / 2026年9月"))}・データ：ホットペッパーグルメ Webサービス</div>
      <div class="r7foot">
        <div class="ask">${br(s.ask || "1位はどこだと思う？ **コメントで教えて**").replace(/<span class="mk">/g, "<b>").replace(/<\/span>/g, "</b>")}</div>
        <div class="bm">キメメシ</div>
      </div>
    </div>`;
  },

  // 1位の発表。参照でいう“めくった先”。カルーセルのピークに置く。
  reveal: (s, p, i, n) => wrap(s, p, i, n, `
    <div class="rv"><div class="rvcard">
      <div class="crownbig">👑</div>
      <div class="badge">第1位</div>
      <div class="nm">${br(s.name)}</div>
      ${s.value ? `<div class="val">${esc(s.value)}${s.unit ? `<em>${esc(s.unit)}</em>` : ""}</div>` : ""}
      ${s.sub ? `<div class="ds">${br(s.sub)}</div>` : ""}
      <div class="rvmascot">${MASCOT}</div>
    </div></div>
  `, "ref"),
};

export function slideHtml(slide, post, i, n) {
  const fn = TYPES[slide.type];
  if (!fn) throw new Error("unknown slide type: " + slide.type);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
    <body>${fn(slide, post, i, n)}</body></html>`;
}
