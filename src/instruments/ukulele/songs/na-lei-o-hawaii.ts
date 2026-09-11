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
[C]Nani Hawa[G7]iʻi ka moku o [D7]Ke[G7]a[C]we
Lei haʻaheo i [A7]ka le[D7]hua a me ka ma[G7]ile aʻo Pana[C]ewa
`,
  arrangement:
    "コードは1923年版『King's Book of Hawaiian Melodies』6ページの Ernest K. Kaʻai によるコード記号から起こし、原典の F 長調を C へ移しました。1か所だけ変えています。1行目「Hawaiʻi」の「Ha」から2拍出る丸囲みの記号（②）は読み方が確かめられていないため外し、C を伸ばしました。コードの位置は、替わる拍にいちばん近い音節に合わせています（「Keawe」の G7 は半拍早めています）。歌詞は1番だけを載せています。",
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
