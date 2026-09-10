import { type CSSProperties, useState } from "react";
import { Link } from "react-router-dom";
import type { SongLibraryPageProps } from "../../../core/lesson/types";
import { learnedChords } from "../../../core/progress/learnedChords";
import { useProgress } from "../../../core/progress/useProgress";
import { UKULELE_SONGS } from "../songs";
import { type ChordCountBucket, chordCountBucket, isPlayable, usesBarre } from "../songs/filters";

const COUNT_OPTIONS: { value: ChordCountBucket | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "3", label: "3コード" },
  { value: "4", label: "4コード" },
  { value: "5+", label: "5コード以上" },
];

/**
 * 楽譜ライブラリの一覧。
 *
 * 絞り込みの状態は URL にも localStorage にも置かない。1画面で完結する道具で、
 * 別の端末や別の日へ持ち回る動機が薄い。
 */
export function SongsPage({ instrument }: SongLibraryPageProps) {
  const { progress } = useProgress(instrument.id);
  const learned = learnedChords(instrument.curriculum, progress.completedLessonIds);

  const [playableOnly, setPlayableOnly] = useState(false);
  const [count, setCount] = useState<ChordCountBucket | "all">("all");
  const [hideBarre, setHideBarre] = useState(false);

  const songs = UKULELE_SONGS.filter((song) => {
    if (playableOnly && !isPlayable(song, learned)) return false;
    if (count !== "all" && chordCountBucket(song) !== count) return false;
    if (hideBarre && usesBarre(song)) return false;
    return true;
  });

  return (
    <main className="songs" style={{ "--instrument-accent": instrument.accent } as CSSProperties}>
      <Link className="crumb" to={`/${instrument.slug}`}>
        {instrument.name}のコース
      </Link>

      <header className="hero hero--tight">
        <p className="eyebrow">{UKULELE_SONGS.length} songs</p>
        <h1 className="hero__title">楽譜ライブラリ</h1>
        <p className="hero__lede">
          日本と米国の両方で著作権の保護期間が満了した曲だけを載せています。掲載の根拠は曲ごとのページに書いてあります。
        </p>
      </header>

      <section className="songfilter" aria-label="曲の絞り込み">
        <label className="songfilter__check">
          <input
            type="checkbox"
            checked={playableOnly}
            onChange={(event) => setPlayableOnly(event.target.checked)}
          />
          今の自分が弾ける曲だけ
          <span className="songfilter__hint">
            {learned.length === 0
              ? "（まだコードを習っていません）"
              : `（習得済み: ${learned.join("・")}）`}
          </span>
        </label>

        <div className="songfilter__group" role="group" aria-label="コード数">
          {COUNT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`songfilter__chip${count === option.value ? " is-on" : ""}`}
              aria-pressed={count === option.value}
              onClick={() => setCount(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="songfilter__check">
          <input
            type="checkbox"
            checked={hideBarre}
            onChange={(event) => setHideBarre(event.target.checked)}
          />
          セーハを含む曲を隠す
        </label>
      </section>

      {songs.length === 0 ? (
        <p className="songs__empty">
          条件に合う曲がありません。絞り込みを緩めるか、レッスンを進めてコードを増やしてください。
        </p>
      ) : (
        <ul className="songlist">
          {songs.map((song) => (
            <li key={song.id}>
              <Link className="songrow" to={`/${instrument.slug}/songs/${song.id}`}>
                <span className="songrow__main">
                  <span className="songrow__title">{song.title}</span>
                  {song.altTitle ? (
                    <span className="songrow__alt">{song.altTitle}</span>
                  ) : null}
                </span>
                <span className="songrow__meta">
                  <span className="songrow__chords">{song.chords.join(" · ")}</span>
                  {song.progression ? (
                    <span className="songrow__bars">{song.progression.length}小節</span>
                  ) : null}
                  {song.lessonId ? <span className="badge">課題曲</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
