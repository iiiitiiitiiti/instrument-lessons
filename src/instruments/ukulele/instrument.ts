import type { Instrument } from "../../core/lesson/types";
import { UKULELE_CURRICULUM } from "./curriculum";
import { ukuleleMdxComponents } from "./mdxComponents";
import { SongPage } from "./pages/SongPage";
import { SongsPage } from "./pages/SongsPage";

export const UKULELE: Instrument = {
  id: "ukulele",
  slug: "ukulele",
  name: "ウクレレ",
  tagline: "5週間で弾き語り3曲",
  // 深いティール。ハワイの海を配色でほのかに漂わせる程度に留める（仕様 §13）
  accent: "#1d6f6a",
  curriculum: UKULELE_CURRICULUM,
  mdxComponents: ukuleleMdxComponents,
  songLibrary: { ListPage: SongsPage, DetailPage: SongPage },
};
