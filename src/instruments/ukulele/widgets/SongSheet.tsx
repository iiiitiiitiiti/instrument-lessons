import { useMemo, useState } from "react";
import { playNotes } from "../../../core/audio/output/play";
import { UKULELE_CHORDS, chordNotes } from "../chords";
import { parseSongSheet, songSheetChords } from "../songSheet";
import { ChordDiagram } from "./ChordDiagram";
import "./SongSheet.css";

export type SongSheetProps = {
  /** 歌詞コード譜。`[C]Oh when the saints` の形で書く。 */
  source: string;
  /** 曲名など、譜面の見出し。 */
  title?: string;
  /** 譜面の下に置く短い説明。 */
  caption?: string;
};

/**
 * 歌詞の上にコードを乗せた譜面を出す。コード名を押すと押さえ方と音が出る。
 *
 * 歌詞とコードを別々の行として組まない。コードは「その歌詞の塊」と同じ箱に入れ、
 * 箱ごと折り返す。幅の狭い画面で桁がずれないのはこのためで、Lesson 12 で
 * 「角かっこの形ならスマートフォンでも位置関係が崩れません」と説明した根拠にあたる。
 *
 * 伴奏の再生は持たない。この記法はコードの替わる場所しか持たず、各コードの長さが
 * 書かれていないため、鳴らす長さを決められない。テンポに乗せる練習は
 * StrumPattern と Metronome が引き受ける。
 */
export function SongSheet({ source, title, caption }: SongSheetProps) {
  const lines = useMemo(() => parseSongSheet(source), [source]);
  const chords = useMemo(() => songSheetChords(lines), [lines]);
  const [picked, setPicked] = useState<string | null>(null);

  // 綴りを間違えたコードは音も図も出せない。レッスンを描画するテストで拾うため投げる
  for (const name of chords) {
    if (!UKULELE_CHORDS[name]) throw new Error(`未定義のコードです: ${name}`);
  }

  const play = (name: string) => {
    setPicked(name);
    playNotes(chordNotes(UKULELE_CHORDS[name]), { spreadMs: 22, seconds: 2.2 });
  };

  return (
    <figure className="songsheet">
      {title ? <p className="songsheet__title">{title}</p> : null}

      <div className="songsheet__lines">
        {lines.map((segments, lineIndex) => {
          if (segments.length === 0) {
            return <p className="songsheet__line songsheet__line--gap" key={lineIndex} />;
          }
          return (
            <p className="songsheet__line" key={lineIndex}>
              {segments.map((segment, index) => (
                <span className="songsheet__seg" key={index}>
                  <span className="songsheet__chord">
                    {segment.chord ? (
                      <button
                        type="button"
                        className={[
                          "songsheet__chordbtn",
                          segment.chord === picked ? "is-picked" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-label={`${segment.chord} の押さえ方と音`}
                        onClick={() => play(segment.chord as string)}
                      >
                        {segment.chord}
                      </button>
                    ) : null}
                  </span>
                  {/* 歌詞が無い塊にも、コードを乗せる幅を持たせる */}
                  <span className="songsheet__text">{segment.text || " "}</span>
                </span>
              ))}
            </p>
          );
        })}
      </div>

      {/* 図は歌詞より下に置く。ここが伸びても、読んでいる歌詞の行は動かない */}
      <div className="songsheet__picked">
        {picked ? (
          <ChordDiagram name={picked} size="sm" />
        ) : (
          <p className="songsheet__hint">コード名を押すと、押さえ方と音が出ます。</p>
        )}
      </div>

      {caption ? <figcaption className="songsheet__caption">{caption}</figcaption> : null}
    </figure>
  );
}
