import type { Song } from "./types";

export const alohaOe: Song = {
  id: "aloha-oe",
  title: "Aloha ʻOe",
  altTitle: "Farewell to Thee",
  chords: ["C", "F", "G7"],
  lessonId: "uk-11",
  note: "ハワイ王国最後の君主リリウオカラニ女王の作。別れの歌として世界で歌われている。",
  /*
   * 1923年版 King's Book of Hawaiian Melodies の130〜131ページから起こした。
   * 譜面上のウクレレ用コード記号（Ernest K. Kaʻai）は「数字＝そのキーでの役割、文字＝キー」で、
   * 1 は主和音、2 は属七。例えば 2A♭ は E♭7。ピアノ譜の臨時記号と突き合わせて確かめた。
   * 原典の A♭ 長調から C へ移すと、Aメロは C F / C / G7 / G7 / C F / C / F D7 G7 / C、
   * サビは F / C / G7 / C / F / C / G7 / C になる。
   */
  sheet: `
[C]Haʻaheo e ka [F]ua i nā [C]pali
Ke [G7]nihi aʻela i ka nahele
E u[C]hai ana [F]paha i ka [C]liko
Pua [F]ʻāhihi [G7]lehua o [C]uka

A[F]loha ʻoe, a[C]loha ʻoe
E ke [G7]onaona noho i ka [C]lipo
[F]One fond embrace, a [C]hoʻi aʻe au
[G7]Until we meet a[C]gain
`,
  arrangement:
    "コードは1923年版『King's Book of Hawaiian Melodies』（Charles E. King 編曲、ウクレレ用コード記号は Ernest K. Kaʻai）から起こし、原典の A♭ 長調を C へ移しました。初心者向けに1か所だけ変えています。4行目「ʻāhihi」の「hi」に1拍だけ出る D7 は、この曲を弾く時点ではまだ習っていないため外しました。歌詞は1番とサビだけを載せています。",
  licensing: {
    // 詞も曲も女王ひとりの作。huapala.org が "Words and music by Queen Liliʻuokalani" と記録している
    authors: [{ name: "Queen Liliʻuokalani", role: "both", died: 1917 }],
    /*
     * 1884年の出版が広く言われているが、こちらで確認できたのはジョンズ・ホプキンス大学
     * Levy Music Collection の1915年版（Century Music Pub. Co., Philadelphia）。
     * より古い出版がありうるが、米国側の判定にはこの年で足りる。
     */
    earliestPublication: 1915,
    verifiedOn: "2026-09-11",
    sources: [
      "https://www.huapala.org/Aloha/Aloha_Oe.html",
      "https://levysheetmusic.mse.jhu.edu/collection/151/020",
      "https://archive.org/details/kingsbookofhawai00king",
      "https://en.wikipedia.org/wiki/Liliuokalani",
    ],
  },
};
