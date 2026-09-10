import type { ReactNode } from "react";
import "./Figure.css";

export type FigureProps = {
  /** 読み上げ用の説明。図が読めない人にこの1文だけで意味が通るように書く。 */
  alt: string;
  /** 図の下に出す説明。図で示せないこと（理由・注意）を補う。 */
  caption?: ReactNode;
  children: ReactNode;
};

/**
 * 図版の枠。楽器に依存しないため core に置く。
 *
 * 図の中身は SVG で、色は currentColor と --accent を参照する。
 * role と aria-label はこの枠が持ち、中の SVG には持たせない。
 * 入れ子になると読み上げが二重になる。
 */
export function Figure({ alt, caption, children }: FigureProps) {
  return (
    <figure className="figure">
      <div className="figure__frame" role="img" aria-label={alt}>
        {children}
      </div>
      {caption && <figcaption className="figure__caption">{caption}</figcaption>}
    </figure>
  );
}
