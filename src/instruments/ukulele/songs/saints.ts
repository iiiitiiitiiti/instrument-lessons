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
[C]Oh Lord I want to be [F]in that number
[C]When the saints [G7]go [C]marching in
`,
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
