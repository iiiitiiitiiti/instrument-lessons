import type { Instrument } from "../../core/lesson/types";
import { UKULELE_CURRICULUM } from "./curriculum";

export const UKULELE: Instrument = {
  id: "ukulele",
  slug: "ukulele",
  name: "ウクレレ",
  tagline: "5週間で弾き語り3曲",
  curriculum: UKULELE_CURRICULUM,
  mdxComponents: {},
};
