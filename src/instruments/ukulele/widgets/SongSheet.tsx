import { useMemo, useState } from "react";
import { playNotes } from "../../../core/audio/output/play";
import { TempoControl } from "../../../core/widgets/TempoControl";
import { UKULELE_CHORDS, chordNotes } from "../chords";
import { parseSongSheet, songSheetChords } from "../songSheet";
import type { SongPerformance } from "../songs/types";
import { ChordDiagram } from "./ChordDiagram";
import { useSongPlayer } from "./useSongPlayer";
import "./SongSheet.css";

export type SongSheetProps = {
  /** 歌詞コード譜。`[C]Oh when the saints` の形で書く。 */
  source: string;
  /** 曲名など、譜面の見出し。 */
  title?: string;
  /** 譜面の下に置く短い説明。 */
  caption?: string;
  /** お手本の再生。渡したときだけ再生の操作を出す。 */
  performance?: SongPerformance;
};

/**
 * 歌詞の上にコードを乗せた譜面を出す。コード名を押すと押さえ方と音が出る。
 *
 * 歌詞とコードを別々の行として組まない。コードは「その歌詞の塊」と同じ箱に入れ、
 * 箱ごと折り返す。幅の狭い画面で桁がずれないのはこのためで、Lesson 12 で
 * 「角かっこの形ならスマートフォンでも位置関係が崩れません」と説明した根拠にあたる。
 *
 * この記法はコードの替わる場所しか持たないので、お手本の再生に要る拍の長さとメロディは
 * performance に別に持つ（DDR 017）。再生中に光らせるのは、コード名ではなく譜面上の位置で
 * 引いた1つの塊。同じ C が何度出ても、今鳴っている箇所だけが光る。
 */
export function SongSheet({ source, title, caption, performance }: SongSheetProps) {
  const lines = useMemo(() => parseSongSheet(source), [source]);
  const chords = useMemo(() => songSheetChords(lines), [lines]);
  const [picked, setPicked] = useState<string | null>(null);
  const player = useSongPlayer(performance);

  // 綴りを間違えたコードは音も図も出せない。レッスンを描画するテストで拾うため投げる
  for (const name of chords) {
    if (!UKULELE_CHORDS[name]) throw new Error(`未定義のコードです: ${name}`);
  }

  // 再生のコード番号は、譜面にコードが出てくる順と一致する（tests/ukulele/songs.test.ts が突き合わせる）
  const order = useMemo(
    () => lines.flatMap((segments) => segments.flatMap((segment) => segment.chord ?? [])),
    [lines],
  );

  const play = (name: string) => {
    setPicked(name);
    playNotes(chordNotes(UKULELE_CHORDS[name]), { spreadMs: 22, seconds: 2.2 });
  };

  const playing = player.running && player.activeChord !== -1;
  const shown = playing ? order[player.activeChord] : picked;
  let chordNumber = -1;

  return (
    <figure className="songsheet">
      {title ? <p className="songsheet__title">{title}</p> : null}

      {performance ? (
        <div className="songsheet__player">
          <div className="songsheet__playrow">
            <button type="button" className="btn btn--primary" onClick={player.toggle}>
              {player.running ? "止める" : "お手本を再生"}
            </button>
            <label className="songsheet__melody">
              <input
                type="checkbox"
                checked={player.melody}
                onChange={(event) => player.setMelody(event.target.checked)}
              />
              メロディも鳴らす
            </label>
          </div>
          <TempoControl bpm={player.bpm} onChange={player.setBpm} />
          {performance.note ? <p className="songsheet__playnote">{performance.note}</p> : null}
        </div>
      ) : null}

      <div className="songsheet__lines">
        {lines.map((segments, lineIndex) => {
          if (segments.length === 0) {
            return <p className="songsheet__line songsheet__line--gap" key={lineIndex} />;
          }
          return (
            <p className="songsheet__line" key={lineIndex}>
              {segments.map((segment, index) => {
                if (segment.chord) chordNumber += 1;
                const isPlaying = playing && segment.chord !== null && chordNumber === player.activeChord;
                return (
                  <span className="songsheet__seg" key={index}>
                    <span className="songsheet__chord">
                      {segment.chord ? (
                        <button
                          type="button"
                          className={[
                            "songsheet__chordbtn",
                            !playing && segment.chord === picked ? "is-picked" : "",
                            isPlaying ? "is-playing" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          aria-label={`${segment.chord} の押さえ方と音`}
                          aria-current={isPlaying ? "true" : undefined}
                          onClick={() => play(segment.chord as string)}
                        >
                          {segment.chord}
                        </button>
                      ) : null}
                    </span>
                    {/* 歌詞が無い塊にも、コードを乗せる幅を持たせる */}
                    <span className="songsheet__text">{segment.text || " "}</span>
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>

      {/* 図は歌詞より下に置く。ここが伸びても、読んでいる歌詞の行は動かない */}
      <div className="songsheet__picked">
        {shown ? (
          <ChordDiagram name={shown} size="sm" />
        ) : (
          <p className="songsheet__hint">コード名を押すと、押さえ方と音が出ます。</p>
        )}
      </div>

      {caption ? <figcaption className="songsheet__caption">{caption}</figcaption> : null}
    </figure>
  );
}
