import type { Song } from "./types";

export const saints: Song = {
  id: "saints",
  title: "聖者の行進",
  altTitle: "When the Saints Go Marching In",
  chords: ["C", "F", "G7"],
  lessonId: "uk-08",
  note: "アメリカの黒人霊歌から生まれ、ニューオーリンズのジャズで世界に広まった曲。3つのコードだけで通せる。",
  progression: [
    "C", "C", "C", "C",
    "C", "C", "G7", "G7",
    "C", "C", "F", "F",
    "C", "G7", "C", "C",
  ],
  sheet: `
[C]Oh when the saints go marching in
[C]Oh when the saints go [G7]marching in
[C]Oh Lord I want to [F]be in that number
[C]When the [G7]saints go [C]marching in
`,
  performance: {
    /*
     * 旋律は Carnegie Hall の教材譜（Link Up「The Orchestra Swings」の When the Saints Go Marching In、
     * C 長調・歌詞とコード付き）に拠る。Wikimedia Commons の CC0 の MIDI（File:When The Saints.mid、
     * Peter Gerloff）で、1・2・4節の音と小節の区切りを確かめた。3節目「Oh Lord I」の音は版で違い
     * （E E D と D E D）、Carnegie Hall の E E D を採った。
     *
     * 「Oh when the」を1小節目の2〜4拍目に置く区切りで数える。これで1行が4小節になり、
     * 11小節目の頭が「be」、14小節目の頭が「saints」になる（MIDI の音の時刻とも合う）。
     */
    abc: `
M:4/4
L:1/16
K:C
"C"z4 C4 E4 F4 | G16 | z4 C4 E4 F4 | G16 |
w: Oh when the saints go march-ing in
"C"z4 C4 E4 F4 | G8 E8 | "G7"C8 E8 | D16 |
w: Oh when the saints go march-ing in
"C"z4 E4 E4 D4 | C12 C4 | "F"E8 G4 G4 | G4 F12 |
w: Oh Lord I want to be in that num-ber
"C"z8 E4 F4 | "G7"G8 E8 | "C"C8 D8 | C16 |]
w: When the saints go march-ing in
`,
    bpm: 60,
    strum: "down",
  },
  licensing: {
    authors: [{ name: "作者不詳（黒人霊歌）", role: "both", died: "traditional" }],
    earliestPublication: "traditional",
    /*
     * 単一の初出版を特定できない。現行の歌は1900年代初頭に、同じ題を持つ複数の
     * ゴスペル曲（1896年の "When the Saints Are Marching In"、1908年の
     * "When the Saints March In for Crowning"）から派生したもので、1923年に
     * Paramount Jubilee Singers による録音があり、1928年までに商業録音が続いている。
     * いずれの経路でも1929年より前に世に出ている。
     */
    usBasis:
      "1900年代初頭に同名の複数のゴスペル曲から派生した伝承曲。1923年に Paramount Jubilee Singers が録音し、1928年までに複数の商業録音がある。派生元とされる曲の出版は1896年と1908年で、いずれも1929年より前。",
    verifiedOn: "2026-09-11",
    sources: [
      "https://en.wikipedia.org/wiki/When_the_Saints_Go_Marching_In",
      "https://www.umcdiscipleship.org/articles/history-of-hymns-when-the-saints-go-marching-in",
    ],
  },
};
