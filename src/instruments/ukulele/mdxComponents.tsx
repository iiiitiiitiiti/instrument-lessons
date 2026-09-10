import type { MDXComponents } from "mdx/types";
import { TonePlayer } from "../../core/widgets/TonePlayer";
import { UKULELE_TUNING } from "./tuning";
import { ChordDiagram } from "./widgets/ChordDiagram";

/** ウクレレの4本の弦の基準音を鳴らす。 */
function UkuleleTuner() {
  return <TonePlayer tones={UKULELE_TUNING.strings} />;
}

export const ukuleleMdxComponents: MDXComponents = {
  ChordDiagram,
  TonePlayer: UkuleleTuner,
};
