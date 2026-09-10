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
