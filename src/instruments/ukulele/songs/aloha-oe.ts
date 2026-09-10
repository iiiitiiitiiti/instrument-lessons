import type { Song } from "./types";

export const alohaOe: Song = {
  id: "aloha-oe",
  title: "Aloha ʻOe",
  altTitle: "Farewell to Thee",
  chords: ["C", "C7", "F", "G7"],
  lessonId: "uk-11",
  note: "ハワイ王国最後の君主リリウオカラニ女王の作。別れの歌として世界で歌われている。",
  licensing: {
    // 詞も曲も女王ひとりの作。huapala.org が "Words and music by Queen Liliʻuokalani" と記録している
    authors: [{ name: "Queen Liliʻuokalani", role: "both", died: 1917 }],
    /*
     * 1884年の出版が広く言われているが、こちらで確認できたのはジョンズ・ホプキンス大学
     * Levy Music Collection の1915年版（Century Music Pub. Co., Philadelphia）。
     * より古い出版がありうるが、米国側の判定にはこの年で足りる。
     */
    earliestPublication: 1915,
    verifiedOn: "2026-09-11",
    sources: [
      "https://www.huapala.org/Aloha/Aloha_Oe.html",
      "https://levysheetmusic.mse.jhu.edu/collection/151/020",
      "https://en.wikipedia.org/wiki/Liliuokalani",
    ],
  },
};
