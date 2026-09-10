import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { Metronome } from "../../core/widgets/Metronome";
import { TonePlayer } from "../../core/widgets/TonePlayer";
import { UKULELE_TUNING } from "./tuning";
import { ChordDiagram } from "./widgets/ChordDiagram";
import { ChordPlayer } from "./widgets/ChordPlayer";
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
  ChordDiagram,
  ChordPlayer,
  ChordRow,
  FretPosition,
  Metronome,
  PitchMap,
  RhythmPattern,
  StringNumbers,
  StrumPattern,
  StrumSpot,
  TonePlayer: UkuleleTuner,
  UkuleleParts,
};
