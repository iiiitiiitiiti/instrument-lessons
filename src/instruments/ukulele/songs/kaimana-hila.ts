import type { Song } from "./types";

export const kaimanaHila: Song = {
  id: "kaimana-hila",
  title: "Kaimana Hila",
  altTitle: "Diamond Head",
  chords: ["C", "C7", "D7", "F", "G7"],
  lessonId: "uk-14",
  note: "ワイキキから見えるダイヤモンドヘッドと、その周りを巡る一日を歌ったハワイ語の曲。",
  licensing: {
    authors: [{ name: "Charles E. King", role: "both", died: 1950 }],
    /*
     * ウィスコンシン大学マディソン校の目録にある `King's Book of Hawaiian Melodies`
     * 第8版（Honolulu: C.E. King, ©1928）の内容細目に "Kaimana hila = Diamond head" がある。
     * 1916年の初版に収録されていたとする記述もあるが、こちらで確認できたのは1928年版。
     */
    earliestPublication: 1928,
    verifiedOn: "2026-09-11",
    sources: [
      "https://www.huapala.org/Kai/Kaimana_Hila.html",
      "https://search.library.wisc.edu/catalog/9910067489802121",
      "https://digital.library.manoa.hawaii.edu/items/show/37997",
    ],
    caveat:
      "英語版 Wikipedia は Andrew Cummings の補作としているが、その記述に典拠がなく、同記事が挙げる参考文献（huapala の作曲者索引）は King 単独と記録している。UH Mānoa 図書館の録音目録も作曲者を King 単独としている。補作者として名の挙がる Andy Cummings は1913年生まれで、1916年の曲を共作できない（1947年の録音者）。以上から King 単独として扱う。補作が裏付けられた場合は再検討する。",
  },
};
