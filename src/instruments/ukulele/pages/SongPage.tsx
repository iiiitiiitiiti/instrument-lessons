import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import type { SongLibraryPageProps } from "../../../core/lesson/types";
import { NotFoundPage } from "../../../pages/NotFoundPage";
import { findSong } from "../songs";
import type { SongAuthor } from "../songs";
import { ChordDiagram } from "../widgets/ChordDiagram";
import { SongSheet } from "../widgets/SongSheet";

const ROLE_LABELS: Record<SongAuthor["role"], string> = {
  lyrics: "作詞",
  music: "作曲",
  both: "作詞・作曲",
};

/** 4小節ずつ区切って表にする。1行が4小節なのはレッスン本文の表と同じ。 */
function toBars(progression: string[]): { label: string; chords: string[] }[] {
  const rows: { label: string; chords: string[] }[] = [];
  for (let index = 0; index < progression.length; index += 4) {
    const chords = progression.slice(index, index + 4);
    rows.push({ label: `${index + 1}〜${index + chords.length}`, chords });
  }
  return rows;
}

export function SongPage({ instrument }: SongLibraryPageProps) {
  const { songId = "" } = useParams();
  const song = findSong(songId);
  if (!song) return <NotFoundPage />;

  const { licensing } = song;

  return (
    <main className="song" style={{ "--instrument-accent": instrument.accent } as CSSProperties}>
      <Link className="crumb" to={`/${instrument.slug}/songs`}>
        楽譜ライブラリ
      </Link>

      <header className="hero hero--tight">
        {song.altTitle ? <p className="eyebrow">{song.altTitle}</p> : null}
        <h1 className="hero__title">{song.title}</h1>
        {song.note ? <p className="hero__lede">{song.note}</p> : null}
      </header>

      <section className="song__section">
        <h2>使うコード</h2>
        <div className="chord-row">
          {song.chords.map((name) => (
            <ChordDiagram key={name} name={name} size="sm" />
          ))}
        </div>
      </section>

      {song.sheet ? (
        <section className="song__section">
          <h2>歌詞コード譜</h2>
          <SongSheet
            source={song.sheet}
            caption="コードが替わる場所だけを書いています。"
            performance={song.performance}
          />
          {song.arrangement ? <p className="song__caveat">{song.arrangement}</p> : null}
        </section>
      ) : null}

      {song.progression ? (
        <section className="song__section">
          <h2>この教材の進行</h2>
          <table>
            <thead>
              <tr>
                <th>小節</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
              </tr>
            </thead>
            <tbody>
              {toBars(song.progression).map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {row.chords.map((chord, index) => (
                    <td key={index}>{chord}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="song__caveat">
            伴奏の型です。歌に合わせてコードの変わり目がずれると感じたら、歌が変わるところで替えてかまいません。
          </p>
        </section>
      ) : null}

      {!song.sheet && !song.progression ? (
        <p className="song__caveat">
          この曲の譜面はまだ載せていません。小節ごとのコードの割り振りを出典付きで確かめてから追加します。
        </p>
      ) : null}

      {/* 掲載の根拠を読み手が確かめられるようにする。既定は畳んでおく */}
      <details className="song__license">
        <summary>掲載の根拠（著作権）</summary>
        <dl>
          <dt>作者</dt>
          <dd>
            {licensing.authors
              .map(
                (author) =>
                  `${author.name}（${ROLE_LABELS[author.role]}・${
                    author.died === "traditional" ? "伝承" : `${author.died}年没`
                  }）`,
              )
              .join("、")}
          </dd>
          <dt>出版</dt>
          <dd>
            {licensing.earliestPublication === "traditional"
              ? (licensing.usBasis ?? "特定できない")
              : `確認できた最古は${licensing.earliestPublication}年`}
          </dd>
          <dt>判定</dt>
          <dd>
            日本は作詞者・作曲者の全員が1967年までに没していること、米国は1929年より前の出版であることの両方を満たす曲だけを掲載しています。
          </dd>
          {licensing.caveat ? (
            <>
              <dt>残る疑義</dt>
              <dd>{licensing.caveat}</dd>
            </>
          ) : null}
          <dt>出典</dt>
          <dd>
            <ul>
              {licensing.sources.map((source) => (
                <li key={source}>
                  <a href={source} target="_blank" rel="noreferrer">
                    {source}
                  </a>
                </li>
              ))}
            </ul>
          </dd>
          <dt>検証日</dt>
          <dd>{licensing.verifiedOn}</dd>
        </dl>
      </details>
    </main>
  );
}
