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
  /*
   * 訳の根拠。辞書は wehe.hilo.hawaii.edu（Pukui-Elbert 1986）で引いた。
   * hoʻi = to leave, go or come back（帰る・戻る）／aloha = to love, affection（愛しむ・愛）／
   * ua = rain（雨）／kilihune = fine, light rain, drizzle（細かい霧雨）／nei = 近接を示す指示語（いま・ここ）。
   *
   * 地名と雨の名は辞書で引けなかった。Pālolo は同綴りの一般語（粘る泥）しか無く、Līlīlehua は植物名しか出ない。
   * パーロロがオアフ島の谷、リーリーレフアがその谷に降る雨の名であることは、原譜79ページの英語詞
   * "Where gentle rains are ever descending softly" と huapala.org の解説で確かめた。
   */
  meaning: [
    {
      line: "Hoʻi ke aloha ai Pālolo",
      meaning: "愛しい思いは、パーロロ（オアフ島の谷）へ帰ってゆく",
    },
    {
      line: "I ka ua Līlīlehua e kilihune nei",
      meaning: "リーリーレフア（この谷に降る雨の名）が、こまやかに降りしきるいま",
    },
  ],
  performance: {
    /*
     * 同じ79ページの歌の段から読んだ。F 長調を完全4度下げて C へ移した。
     * 原譜は 2/4 で、Kaimana Hila と同じく音の長さを倍にして 4/4 で書いている。
     * 1小節目は原譜の「1F」の小節（4分休符＋「Ho-ʻi」）で、休符の間も C を鳴らす。
     * 「Līlī」は原譜で1つの付点8分音符に2音節が付いているので、1つの音節として扱った。
     * 歌詞コード譜の終わり（「nei」）までで止める。原譜はその後に G7 の小節と C の小節が続く。
     */
    abc: `
M:4/4
L:1/16
K:C
"C"z8 G4 G4 | "A7"A6 A2 A4 A4- | A4 A2 A2 A4- A4 | "D7"A8 D8- |
w: Ho-ʻi ke a-lo-ha _ a-i Pā _ lo-lo
D4 A2 A2 A4 A4 | "G7"B6 A2 A4 G4- | G2 F2 F2 F2 E4 D4 | "C"C8 C8 |]
w: _ I ka u-a Līlī-le-hu-a _ e ki-li-hu-ne ne-i
`,
    bpm: 66,
    strum: "d-du-udu",
    note: "原譜は2拍子です。音の長さを倍にして4拍で数えているので、テンポの数字は原譜の半分の速さにあたります。",
  },
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
