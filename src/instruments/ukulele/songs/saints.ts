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
Oh when the saints go marching [G7]in
Oh Lord I [C]want to be in that [F]number
When the [C]saints go [G7]marching [C]in
`,
  /*
   * 英語詞をそのまま訳した。黒人霊歌で、「聖者が行進してゆく列に自分も加わりたい」と繰り返す歌。
   * 「that number」は「その一団・その数のうち」の意味で、天に召される聖者の列を指す。
   */
  meaning: [
    { line: "Oh when the saints go marching in", meaning: "聖者たちが行進してゆくとき" },
    { line: "Oh when the saints go marching in", meaning: "聖者たちが行進してゆくとき" },
    { line: "Oh Lord I want to be in that number", meaning: "主よ、私もその列に加わりたい" },
    { line: "When the saints go marching in", meaning: "聖者たちが行進してゆくときに" },
  ],
  performance: {
    /*
     * 旋律は Carnegie Hall の教材譜（Link Up「The Orchestra Swings」の When the Saints Go Marching In、
     * C 長調・歌詞とコード付き）に拠る。Wikimedia Commons の CC0 の MIDI（File:When The Saints.mid、
     * Peter Gerloff）で、1・2・4節の音を確かめた。3節目「Oh Lord I」の音は版で違い
     * （E E D と D E D）、Carnegie Hall の E E D を採った。
     *
     * 進行表（progression）の1小節目は「saints」。「Oh when the」はその前の弱起として書く。
     * 教材譜のコード記号も「saints」「in」「want」「number」の長い音の上で替わっており、この数え方と合う。
     * 最後の16小節目は「in」を伸ばしたあとの小節で、歌は無くストロークだけを鳴らす。
     */
    abc: `
M:4/4
L:1/16
K:C
"C"C4 E4 F4 | G16 | z4 C4 E4 F4 | G16 |
w: Oh when the saints go march-ing in
z4 C4 E4 F4 | G8 E8 | C8 E8 | "G7"D16 |
w: Oh when the saints go march-ing in
z4 E4 E4 D4 | "C"C12 C4 | E8 G4 G4 | "F"G4 F12 |
w: Oh Lord I want to be in that num-ber
z8 E4 F4 | "C"G8 E8 | "G7"C8 D8 | "C"C16 | z16 |]
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
