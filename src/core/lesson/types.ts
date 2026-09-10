import type { ComponentType } from "react";
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
  /**
   * 画面のアクセント色（16進）。色は楽器の構造に依存しないため共通契約に置ける。
   * 楽器が増えてもコース概要とレッスンの見た目がこの1色で切り替わる。
   */
  accent: string;
  curriculum: Curriculum;
  /** レッスン本文（MDX）から使えるコンポーネント。中身は楽器ごとに違う。 */
  mdxComponents: MDXComponents;
  /**
   * 楽譜ライブラリの画面。曲の形（コード・進行・譜面）は楽器ごとに違うため、
   * 曲データではなく画面ごと楽器側が持つ。mdxComponents と同じ扱い。
   * ライブラリを持たない楽器では省略する。
   */
  songLibrary?: InstrumentSongLibrary;
};

/**
 * 楽譜ライブラリの画面が受け取るもの。
 *
 * 楽器そのものを渡す。画面側から `instruments/registry` を引くと、
 * 楽器定義が画面を持つため循環参照になる。
 */
export type SongLibraryPageProps = { instrument: Instrument };

export type InstrumentSongLibrary = {
  /** /:instrumentSlug/songs */
  ListPage: ComponentType<SongLibraryPageProps>;
  /** /:instrumentSlug/songs/:songId */
  DetailPage: ComponentType<SongLibraryPageProps>;
};
