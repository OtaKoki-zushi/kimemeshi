// キメメシ用 ホットペッパーAPIプロキシ（Google Apps Script）
//
// なぜ必要？:
//   ホットペッパーAPIはブラウザからの直接呼び出し(CORS)に対応していないため、
//   端末や回線によっては検索が失敗します。このプロキシを自分のGoogleアカウントで
//   公開しておくと、確実に検索できるようになり、APIキーも外部に見えなくなります。
//
// 設置手順（5分・無料）:
//   1. https://script.google.com/ を開いて「新しいプロジェクト」
//   2. 最初からあるコードを全部消して、このファイルの中身を貼り付ける
//   3. 下の KEY をあなたのホットペッパーAPIキーに書き換えて保存
//   4. 右上「デプロイ」→「新しいデプロイ」→ 種類:「ウェブアプリ」
//      - 次のユーザーとして実行: 自分
//      - アクセスできるユーザー: 全員
//      → デプロイ（初回はアクセス許可の確認画面が出るので許可する）
//   5. 発行された「ウェブアプリのURL」（https://script.google.com/macros/s/〜/exec）をコピーし、
//      キメメシのホーム画面下のバッジをタップして貼り付ける
var KEY = "ここにあなたのAPIキー";

function doGet(e) {
  var params = [];
  var p = (e && e.parameter) ? e.parameter : {};
  for (var k in p) {
    if (k === "key" || k === "format" || k === "callback") continue;
    params.push(k + "=" + encodeURIComponent(p[k]));
  }
  var url = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/?key=" + KEY +
            "&format=json&" + params.join("&");
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  return ContentService.createTextOutput(res.getContentText())
    .setMimeType(ContentService.MimeType.JSON);
}
