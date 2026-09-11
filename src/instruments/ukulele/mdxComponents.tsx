import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { Metronome } from "../../core/widgets/Metronome";
import { TonePlayer } from "../../core/widgets/TonePlayer";
import { findSong } from "./songs";
import { UKULELE_TUNING } from "./tuning";
import { ChordDiagram } from "./widgets/ChordDiagram";
import { ChordChangeTrainer } from "./widgets/ChordChangeTrainer";
import { ChordPlayer } from "./widgets/ChordPlayer";
import { SongSheet } from "./widgets/SongSheet";
import { StrumPattern } from "./widgets/StrumPattern";
import { FretPosition } from "./widgets/figures/FretPosition";
import { PitchMap } from "./widgets/figures/PitchMap";
import { RhythmPattern } from "./widgets/figures/RhythmPattern";
import { StringNumbers } from "./widgets/figures/StringNumbers";
import { StrumSpot } from "./widgets/figures/StrumSpot";
import { UkuleleParts } from "./widgets/figures/UkuleleParts";

/** ウクレレの4本の弦の基準音を鳴らす。 */
function UkuleleTuner() {
  return <TonePlayer tones={UKULELE_TUNING.strings} />;
}

/**
 * 楽譜ライブラリの曲データから歌詞コード譜を出す。
 *
 * レッスン本文へ譜面を書き写すと、ライブラリ側を直したときに食い違う。
 * 曲データを正本にし、譜面の出どころと簡略化した点も一緒に出す。
 */
function LibrarySongSheet({ id, caption }: { id: string; caption?: string }) {
  const song = findSong(id);
  if (!song?.sheet) throw new Error(`歌詞コード譜のない曲です: ${id}`);
  return (
    <SongSheet
      title={song.title}
      source={song.sheet}
      caption={caption ?? song.arrangement}
      performance={song.performance}
      meaning={song.meaning}
    />
  );
}

/** コード図を横に並べる。 */
function ChordRow({ children }: { children: ReactNode }) {
  return <div className="chord-row">{children}</div>;
}

/**
 * レッスン本文（MDX）から使えるコンポーネント。
 *
 * ここに登録し忘れたまま本文で使うと、そのレッスンを開いた時点で
 * MDX が例外を投げる。tests/ukulele/lessonRender.test.tsx が実際に描画して検査する。
 */
export const ukuleleMdxComponents: MDXComponents = {
  ChordChangeTrainer,
  ChordDiagram,
  ChordPlayer,
  ChordRow,
  FretPosition,
  LibrarySongSheet,
  Metronome,
  PitchMap,
  RhythmPattern,
  SongSheet,
  StringNumbers,
  StrumPattern,
  StrumSpot,
  TonePlayer: UkuleleTuner,
  UkuleleParts,
};
