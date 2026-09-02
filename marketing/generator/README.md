# 投稿画像ジェネレータ

`posts.js` に投稿を書くと、Instagram用のPNG（1080×1350）が `marketing/posts/` に書き出されます。
Chromiumで実際にレンダリングしているので、出てくるのはそのまま投稿できる画像です。

## 使い方

```
cd marketing/generator
node render.mjs          # 全投稿を書き出す
node sheet.mjs           # 全スライドを1枚のコンタクトシートにして確認する
```

必要なもの：Node 20以上と Playwright（`npm i -g playwright` 済みの環境なら追加インストール不要。
入っていなければこのフォルダで `npm i && npx playwright install chromium`）。
日本語フォントは `fonts/` に同梱しているので、環境にフォントが入っていなくても同じ見た目で出ます。

## 投稿の書き方

`posts.js` の `POSTS` 配列に追記するだけです。

```js
{
  id: "19-example",           // 出力先フォルダ名。並び順にもなる
  kind: "ranking",            // 分類（ranking / empathy / debate / quiz / cheatsheet / stats）
  title: "投稿の名前",
  foot: "n=2,459 / 2026年9月", // 全スライド共通のフッター右側
  slides: [ /* 下記のスライド型 */ ],
  caption: `キャプション本文`,
  tags: ["#タグ1", "#タグ2"],
}
```

書き出し時に `caption.txt` も同じフォルダに置かれるので、投稿するときは
画像を選んでキャプションを貼るだけで終わります。

## 使えるスライド型

| type | 用途 | 主なキー |
|---|---|---|
| `cover` | 1枚目の表紙 | `eyebrow` `title` `sub` `swipe` `size` |
| `stat` | 数字ドン | `label` `value` `unit` `sub` |
| `rank` | ランキング（棒つき） | `title` `rows:[{n,v,hi,rk}]` `sub` |
| `list` | 箇条書き | `title` `items:[]` `bullet` |
| `choices` | アプリの4択画面 | `title` `options:[]`（先頭に `*` で選択状態） |
| `ab` | 二択 | `title` `a:{t,d}` `b:{t,d}` `sub` |
| `point` | 主張を1行で | `title` `sub` `eyebrow` |
| `cta` | 最後の誘導 | `title` `sub` `foot` |

共通で使える記法：

- `**強調**` … ベタ塗りのハイライトになる（サムネイルで最初に目に入る場所を1枚に1つだけ作る）
- `\n` … 改行。表紙は自分で改行位置を決めたほうがきれいに収まる
- `list` の `items` は `本文｜補足` と書くと補足が小さい文字で下につく
- `bg` … `"dark"` `"light"` `"accent"` で背景を上書きできる

## 設計の決めごと

- **1枚に強調は1つ。** 全部を目立たせると何も目立たない
- **フィードでは4:5（1080×1350）が最大面積。** 正方形にしない
- **写真は使わない。** ホットペッパーの画像は転載できないため、文字とグラフだけで成立させている
- 数字を出すスライドには必ず `n=2,459` と出典をフッターに入れる
