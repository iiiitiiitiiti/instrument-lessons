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
  performance: {
    /*
     * 同じ50〜51ページの歌の段から読んだ。原典もキーは C なので移していない。
     * 1番の最後の「ni」は原譜では4拍いっぱい伸ばすが、次のサビの弱起「ʻI-ke」（1拍）を
     * その小節の4拍目に入れるため、3拍で切った。
     * 歌詞の割り方は原譜のとおりで、「Ulu」「lani」は1つの音に付いているので1音節として扱う。
     * 1番とサビで「Paoakalani」の割り方が違う（Pa-o-a-ka-la-ni／Pa-oa-ka-lani）のも原譜のまま。
     */
    abc: `
M:4/4
L:1/16
K:C
"C"G3 G1 | e6 B2 d2 c2 "C7"G2 G2 | "F"A8- "D7"A2 c1- c1 B2 A2 | "G7"G8- G2 A2 G2 F2 | "C"E8- E2 G2 G2 G2 |
w: E ka gen-tle breeze e pa mai nei _ Hoʻo _ hā-liʻa liʻa _ mai a-na iaʻu _ E ku-ʻu
e6 B2 d2 c2 "C7"G2 E2 | "F"A8- A2 c2 B2 A1 A1 | "C"G6 ^F1 G1 "G7"A1 G1 c1 B1 d3 c1 | "C"c12 G2 G2 |
w: sweet nev-er fad-ing flow-er _ I pua i ka u-ka _ o Pa-o-a-ka-la-ni ʻI-ke
"G7"d6 B1 B1 G2 A2 F2 A2 | "C"G8- G4 c2 c2 | "D7"c2 c4 A2 A2 d2 d2 e2 | "G7"d8- d2 ^F1 G1 A1 B1 c1 d1 |
w: mau i ka na-ni o nā pua _ O ka u-ka o Ulu-hai-ma-la ma _ ʻA _ ʻo _ le _
"C"e6 B2 d2 c2 "C7"G2 G2 | "F"A8- "D7"A2 c1 c1 B1 B1 A1 A1 | "G7"G6 ^F1 G1 A1 G1 c1 B1 d3 c1 | "C"c16 |]
w: na-ʻe ho-ʻi e _ like _ Me _ ku-ʻu pu-a i ka _ la-ʻi o Pa-oa-ka-lani
`,
    bpm: 72,
    strum: "d-du-udu",
    note: "フェルマータ（音を伸ばす記号）は、伸ばさずにテンポどおり鳴らしています。1番の最後の「ni」は、サビの歌い出しに入るため少し短くしています。",
  },
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
