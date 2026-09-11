import type { Song } from "./types";

export const naLeiOHawaii: Song = {
  id: "na-lei-o-hawaii",
  title: "Nā Lei o Hawaiʻi",
  altTitle: "Song of the Islands",
  chords: ["A7", "C", "D7", "G7"],
  note: "ハワイの島々を、それぞれの島の花のレイになぞらえて歌う曲。1番はハワイ島を歌う。",
  /*
   * 1923年版 King's Book of Hawaiian Melodies の6〜7ページから起こした（記号の読み方は aloha-oe.ts）。
   * 原典の F 長調・4/4 から C へ移すと C ② / G7 / D7 G7 / C / C A7 / D7 / G7 / C。
   * ②（丸囲み）は読み方が確定していないので外した。
   */
  sheet: `
[C]Nani Hawa[G7]iʻi ka moku [D7]o Ke[G7]a[C]we
Lei haʻaheo i [A7]ka le[D7]hua a me ka ma[G7]ile aʻo Pana[C]ewa
`,
  performance: {
    /*
     * 同じ6ページの歌の段から読んだ。F 長調を完全4度下げて C へ移した。
     * 最後の「wa」は2つの音が重ねて書かれている。二重唱の上の声部を旋律とする決まりに従い、上の音を採った。
     * 「o Keawe」は、2C₂ の括弧が「o」から「Ke」まで、2F₂ の括弧が「a」から始まる。
     * そのため D7 は「o」、G7 は「a」の頭で替わる（どちらも拍の頭）。
     */
    abc: `
M:4/4
L:1/16
K:C
"C"G6 G2 G6 G2 | "G7"G4 G4- G2 F2 E2 D2 | "D7"A,6 A,2 "G7"B,8 | "C"C8- C2 G,2 C2 E2 |
w: Na-ni Ha-wa-i-ʻi _ ka mo-ku o Ke-a-we _ Lei ha-ʻa-
G6 G2 "A7"A6 A2 | "D7"A4 A4- A2 A2 A1 A1 _B1 A1 | "G7"=B2 A2 G2 E2 F4 B,4 | "C"C8 c8 |]
w: heo i ka le-hu-a _ a me ka ma _ i-le a-ʻo Pa-na-e-wa
`,
    bpm: 72,
    strum: "d-du-udu",
  },
  arrangement:
    "コードは1923年版『King's Book of Hawaiian Melodies』6ページの Ernest K. Kaʻai によるコード記号から起こし、原典の F 長調を C へ移しました。1か所だけ変えています。1行目「Hawaiʻi」の「Ha」から2拍出る丸囲みの記号（②）は読み方が確かめられていないため外し、C を伸ばしました。歌詞は1番だけを載せています。",
  licensing: {
    // 原譜の作者表記は "CHAS. E. KING"。huapala.org も "Words & music by Charles E. King"
    authors: [{ name: "Charles E. King", role: "both", died: 1950 }],
    // 原譜（1923年版6ページ）に "Copyright 1915 by Bergstrom Music Co. / Copyright transferred to Charles E. King 1917"
    earliestPublication: 1915,
    verifiedOn: "2026-09-11",
    sources: [
      "https://archive.org/details/kingsbookofhawai00king",
      "https://www.huapala.org/NA/Na_Lei_Hawaii_King.html",
      "https://en.wikipedia.org/wiki/Charles_E._King",
    ],
  },
};
