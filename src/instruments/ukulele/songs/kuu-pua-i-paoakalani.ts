import type { Song } from "./types";

export const kuuPuaIPaoakalani: Song = {
  id: "kuu-pua-i-paoakalani",
  title: "Kuʻu Pua i Paoakalani",
  altTitle: "My Flower at Paoakalani",
  chords: ["C", "C7", "D7", "F", "G7"],
  note: "リリウオカラニ女王がワイキキの屋敷パオアカラニで作った曲。歌詞に英語の言葉が混ざるのが特徴。",
  /*
   * 1923年版 King's Book of Hawaiian Melodies の50〜51ページから起こした（記号の読み方は aloha-oe.ts）。
   * 原典も C 長調・4/4。Aメロは C C7 / F D7 / G7 / C / C C7 / F ③ / C G7 / C、
   * サビは G7 / C / D7 / G7 / C C7 / F E7 D7 / G7 / C。
   * ③（丸囲み）は読み方が確定していないので外した。
   */
  sheet: `
[C]E ka gentle breeze e [C7]pa mai [F]nei
[D7]Hoʻohāliʻa[G7]liʻa mai ana [C]iaʻu
E kuʻu sweet never fad[C7]ing flow[F]er
I pua i ka [C]uka [G7]o Paoakala[C]ni

ʻIke [G7]mau i ka nani o nā [C]pua
O ka [D7]uka o Uluhaimala[G7]ma
ʻAʻole [C]naʻe hoʻi [C7]e [F]like
[D7]Me kuʻu pua [G7]i ka laʻi o Paoaka[C]lani
`,
  arrangement:
    "コードは1923年版『King's Book of Hawaiian Melodies』50〜51ページの Ernest K. Kaʻai によるコード記号から起こしました。原典もキーは C です。2か所を変えています。4行目「I pua i ka」に2拍出る丸囲みの記号（③）は読み方が確かめられていないため外し、直前の F を伸ばしました。サビ4行目の手前、「like」を伸ばしている途中に1拍だけ出る E7 は、置ける音節が無いため外しました。コードの位置は、替わる拍にいちばん近い音節に合わせています（半拍ずれる箇所があります）。歌詞は1番とサビを載せています。",
  licensing: {
    // 原譜の作者表記は "QUEEN LILIUOKALANI"。huapala.org も "Words & Music by Queen Liliʻuokalani"
    authors: [{ name: "Queen Liliʻuokalani", role: "both", died: 1917 }],
    // 原譜（1923年版50ページ）に "Copyright, 1917, by Chas. E. King" と印刷されている（King の編曲版）
    earliestPublication: 1917,
    verifiedOn: "2026-09-11",
    sources: [
      "https://archive.org/details/kingsbookofhawai00king",
      "https://www.huapala.org/Pa/Paoakalani.html",
      "https://en.wikipedia.org/wiki/Liliuokalani",
    ],
  },
};
