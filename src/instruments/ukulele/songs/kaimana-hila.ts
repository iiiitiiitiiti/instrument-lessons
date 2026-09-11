import type { Song } from "./types";

export const kaimanaHila: Song = {
  id: "kaimana-hila",
  title: "Kaimana Hila",
  altTitle: "Diamond Head",
  chords: ["C", "D7", "F", "G7"],
  note: "ワイキキから見えるダイヤモンドヘッドと、その周りを巡る一日を歌ったハワイ語の曲。",
  /*
   * 1923年版 King's Book of Hawaiian Melodies の88ページから起こした（記号の読み方は aloha-oe.ts）。
   * 原典の G 長調・2/4 から C へ移すと
   * C E / F / F A7 / D7 / D7 G7 / G7 / G7 C / C（2/8 の短い小節）/ D7 G7 / C。
   * 最後の D7 G7 / C が Lesson 13 のヴァンプにあたる。
   */
  sheet: `
[C]Iwaho mā[F]kou i Kaʻalawai [D7]lā
ʻIke [G7]i ka nani Kaimana [C]Hila lā
[D7]Kau [G7]mai i [C]luna
`,
  /*
   * 訳の根拠。辞書は wehe.hilo.hawaii.edu（Pukui-Elbert 1986 / Parker 1922）で引いた。
   * iwaho = from the inside or within; out（外へ）※Parker 1922／ʻike = to see, know, perceive（見る・知る）／
   * nani = beauty, glory, splendor（美しさ）／kau = to place, hang, suspend; to set, perch, rest（かかる・のぼる）／
   * luna = high, upper, above, over, up（上・高いところ）。
   *
   * 辞書で引けなかった語: mākou（私たち。同綴りの植物名しか出ない）・lā（文末を強める助詞）・
   * 地名の Kaʻalawai と Kaimana Hila。意味は原譜88ページの英語詞
   * "We all were there on Kaʻalawaiʻs shores / And gazed upon the grandeur of old Diamond Head" と
   * huapala.org の解説で確かめた。英語詞は歌うための意訳なので、訳の元にはしていない。
   *
   * これは1916年の原曲の歌詞に対する訳（DDR 019）。今よく歌われている版とは歌詞が違う。
   */
  meaning: [
    {
      line: "Iwaho mākou i Kaʻalawai lā",
      meaning: "私たちは外へ出て、カアラワイ（ダイヤモンドヘッドの下の海辺）へ行った",
    },
    {
      line: "ʻIke i ka nani Kaimana Hila lā",
      meaning: "そして見た、カイマナ・ヒラ（ダイヤモンドヘッド）の美しさを",
    },
    {
      line: "Kau mai i luna",
      meaning: "高くそびえて、そこにかかっている",
    },
  ],
  performance: {
    /*
     * 同じ88ページの歌の段から読んだ。G 長調を完全4度上げて C へ移した。
     * 原譜は 2/4 で、D-DU-UDU（4拍で1周）が1小節に収まるよう、音の長さを倍にして 4/4 で書いている。
     * 途中の 2/8 の小節は、倍にして [M:2/4] の小節になる。
     * 「lā」は原譜では4分音符に8分音符がタイでつながり、さらに同じ高さの8分音符が続く。
     * 後ろの8分音符は英語の歌詞「And」のための音で、ハワイ語では「lā」を伸ばすので1つの音にした。
     */
    abc: `
M:4/4
L:1/16
K:C
"C"c4 | c4 c4 B8 | "F"A12 d2 d2 | d4 e4 f4 e4 | "D7"d16 |
w: I-wa-ho mā-kou i Ka-ʻa-la-wa-i lā
d4 e4 "G7"f4 d4 | B4 G8 d4 | d4 ^d4 "C"e4 e4 | [M:2/4] c8 | [M:4/4] "D7"e8 "G7"d6 d2 | "C"c8 c8 |]
w: ʻI-ke i ka na-ni Kai-ma-na Hi-la lā Kau mai i-lu-na
`,
    bpm: 70,
    strum: "d-du-udu",
    note: "原譜は2拍子です。音の長さを倍にして4拍で数えているので、テンポの数字は原譜の半分の速さにあたります。",
  },
  arrangement:
    "コードは1923年版『King's Book of Hawaiian Melodies』88ページの Ernest K. Kaʻai によるコード記号から起こし、原典の G 長調を C へ移しました。2か所を変えています。「mākou」の「mā」に1拍だけ出る E は外し、直前の C を伸ばしました（この曲で使わないコードで、C7 に置き換えると旋律の B とぶつかります）。「Kaʻalawai」の「wa」に1拍だけ出る A7 も外しました。歌詞は1番だけを載せています。2番以降も同じ節で歌います。ここに載せているのは1916年に出版された原曲です。今よく歌われている Kaimana Hila は、のちに Andy Cummings が広めた版で、旋律も歌詞もこの原曲とは違います（huapala.org の記録による）。",
  licensing: {
    authors: [{ name: "Charles E. King", role: "both", died: 1950 }],
    /*
     * 原譜で確認した。`King's Book of Hawaiian Melodies` 第5版（Honolulu: Charles E. King,
     * 1923。MIT Libraries がデジタル化し、米国で著作権なしと判定）の88ページに本曲があり、
     * その譜面に "Copyright, 1916, by Chas. E. King" と印刷されている。
     * 作者の表記も "CHAS. E. KING" 単独で、補作者の名は無い。
     */
    earliestPublication: 1916,
    verifiedOn: "2026-09-11",
    sources: [
      "https://archive.org/details/kingsbookofhawai00king",
      "https://www.huapala.org/Kai/Kaimana_Hila.html",
      "https://digital.library.manoa.hawaii.edu/items/show/37997",
    ],
    caveat:
      "英語版 Wikipedia は Andrew Cummings の補作としているが、原譜（1923年版88ページ）の作者表記は Chas. E. King 単独で、補作者の名は無い。huapala.org と UH Mānoa 図書館の記録も King 単独。補作者として名の挙がる Andy Cummings は1913年生まれで、1916年の曲を共作できない（1947年の録音者）。原譜を根拠に King 単独として扱う。",
  },
};
