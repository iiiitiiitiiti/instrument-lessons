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
Pua [F]ʻāhihi le[G7]hua o [C]uka

A[F]loha ʻoe, a[C]loha ʻoe
E ke [G7]onaona noho i ka [C]lipo
One [F]fond embrace, a [C]hoʻi aʻe au
Un[G7]til we meet a[C]gain
`,
  performance: {
    /*
     * 同じ130〜131ページの歌の段から、上の声部を旋律として読んだ（二重唱の箇所がある）。
     * A♭ 長調を長3度上げて C へ移した。音の読みが割れた2か所（サビ1行目末の「a」、
     * 2行目頭の「o」）は、Wikimedia Commons の MIDI（File:Aloha oe song midi.mid、PD-US）で決めた。
     * この MIDI は別の版に拠っていて細部が違うので、それ以外の音は原譜の読みを優先している。
     */
    abc: `
M:4/4
L:1/16
K:C
"C"G2 c2 | e6 d1 d1 "F"c3 B1 c2 A2 | "C"G8 G4 e4 | "G7"d2 d4 ^c2 d2 e1 e1 f2 e2 | d8 d4 G2 c2 |
w: Ha-ʻa-heo e ka u-a i nā pa-li Ke ni-hi a-ʻe-la i ka na-he-le E u-
"C"e6 d1 d1 "F"c3 B1 c2 A2 | "C"G8 G4 c2 B2 | "F"A4 d2 c1 c1 "G7"B4 e2 d2 | "C"c8 c6 G2 |
w: hai a-na pa-ha i ka li-ko Pu-a ʻā-hi-hi le-hu-a o u-ka A-
"F"A4 c4 f6 A2 | "C"G4 c4 e6 c1 c1 | "G7"B3 A1 B2 c2 d3 d1 e2 f2 | "C"e8 c6 G2 |
w: lo-ha ʻoe, a-lo-ha ʻoe E ke o-na-o-na no-ho i ka li-po One
"F"A4 c4 f6 A2 | "C"G3 G1 c3 d1 e2 e4 c2 | "G7"B6 c2 e2 d4 B2 | "C"c12 |]
w: fond em-brace, a ho-ʻi a-ʻe a-u Un-til we meet _ a-gain
`,
    bpm: 66,
    strum: "d-du-udu",
    note: "サビの終わりにあるフェルマータ（音を伸ばす記号）は、伸ばさずにテンポどおり鳴らしています。",
  },
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
