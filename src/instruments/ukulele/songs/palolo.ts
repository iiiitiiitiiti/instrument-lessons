import type { Song } from "./types";

export const palolo: Song = {
  id: "palolo",
  title: "Pālolo",
  chords: ["A7", "C", "D7", "G7"],
  note: "オアフ島のパーロロ渓谷と、そこに降る細かな雨「リーリーレフア」を歌ったフラの曲。",
  /*
   * 1923年版 King's Book of Hawaiian Melodies の79ページから起こした（記号の読み方は aloha-oe.ts）。
   * 原典の F 長調・2/4 から C へ移すと A7 / A7 / D7 / D7 / G7 / G7 / C。
   * VI7–II7–V7–I と5度ずつ下がる、ハワイアンのヴァンプを伸ばした形。
   */
  sheet: `
[C]Hoʻi [A7]ke aloha ai Pā[D7]lolo
I ka ua [G7]Līlīlehua e kilihune [C]nei
`,
  arrangement:
    "コードは1923年版『King's Book of Hawaiian Melodies』79ページの Ernest K. Kaʻai によるコード記号から起こし、原典の F 長調を C へ移しました。コードは変えていません。歌詞は1番だけを載せています。2番以降も同じ節で歌います。",
  licensing: {
    authors: [{ name: "Charles E. King", role: "both", died: 1950 }],
    // 原譜（1923年版79ページ）に "Copyright, 1917, by Chas. E. King" と印刷されている
    earliestPublication: 1917,
    verifiedOn: "2026-09-11",
    sources: [
      "https://archive.org/details/kingsbookofhawai00king",
      "https://www.huapala.org/Pa/Palolo.html",
      "https://en.wikipedia.org/wiki/Charles_E._King",
    ],
  },
};
