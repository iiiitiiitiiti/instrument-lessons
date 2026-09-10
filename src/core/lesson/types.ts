import type { MDXComponents } from "mdx/types";

export type SongRef = {
  id: string;
  title: string;
  chords: string[];
};

export type Lesson = {
  id: string;
  number: number;
  title: string;
  stage: number;
  /** コース開始からの練習日の範囲（開始日, 終了日）。 */
  days: [number, number];
  /** このレッスンで新しく導入するコード。 */
  newChords: string[];
  goal: string;
  song?: SongRef;
};

export type Stage = {
  number: number;
  title: string;
  /** 枠だけ置いて内容は準備中のステージ。 */
  comingSoon?: boolean;
  /** 準備中のステージで予告として並べる項目。 */
  plannedTopics?: string[];
};

export type Curriculum = {
  stages: Stage[];
  lessons: Lesson[];
};

/**
 * 楽器の共通契約。弦・チューニング・コードはここに含めない。
 * 非弦楽器（オタマトーンなど）を後から追加できるようにするため。
 */
export type Instrument = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  curriculum: Curriculum;
  /** レッスン本文（MDX）から使えるコンポーネント。中身は楽器ごとに違う。 */
  mdxComponents: MDXComponents;
};
