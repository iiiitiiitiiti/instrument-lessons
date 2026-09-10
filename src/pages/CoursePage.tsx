import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { findInstrument } from "../instruments/registry";
import { NotFoundPage } from "./NotFoundPage";
import { useProgress } from "../core/progress/useProgress";
import { currentStreak, todayString } from "../core/progress/store";

export function CoursePage() {
  const { instrumentSlug = "" } = useParams();
  const instrument = findInstrument(instrumentSlug);
  const { progress } = useProgress(instrument?.id ?? "");

  if (!instrument) return <NotFoundPage />;

  const { stages, lessons } = instrument.curriculum;
  const completed = new Set(progress.completedLessonIds);
  // toISOString は UTC を返すため使わない。記録側と同じローカル日付で数える。
  const streak = currentStreak(progress.practiceDates, todayString());
  const percent = Math.round((completed.size / lessons.length) * 100);
  const lastDay = lessons[lessons.length - 1].days[1];
  const next = lessons.find((lesson) => !completed.has(lesson.id));
  const toPath = (n: number) => `/${instrument.slug}/lesson-${String(n).padStart(2, "0")}`;

  return (
    <main className="course" style={{ "--instrument-accent": instrument.accent } as CSSProperties}>
      <Link className="crumb" to="/">
        楽器のはじめかた
      </Link>

      <header className="hero hero--tight">
        {/* 等幅が効くのは数字。ラベルには件数と日数という実質のある値を置く */}
        <p className="eyebrow">
          {lessons.length} lessons · {lastDay} days
        </p>
        <h1 className="hero__title">{instrument.name}</h1>
        <p className="hero__lede">{instrument.tagline}。読んで、その場で音を出しながら進みます。</p>
      </header>

      <section className="statusboard">
        <div className="statusboard__figures">
          <p className="stat">
            <span className="stat__value">
              {completed.size}
              <span className="stat__of">/ {lessons.length}</span>
            </span>
            <span className="stat__label">レッスン完了</span>
          </p>
          <p className="stat stat--streak">
            <span className="stat__value">
              {streak}
              <span className="stat__of">日</span>
            </span>
            <span className="stat__label">連続で練習中</span>
          </p>
        </div>

        <div
          className="meter"
          role="progressbar"
          aria-valuenow={completed.size}
          aria-valuemin={0}
          aria-valuemax={lessons.length}
          aria-label={`${lessons.length} レッスンのうち ${completed.size} 完了`}
        >
          <span className="meter__fill" style={{ inlineSize: `${percent}%` }} />
        </div>

        {/* ボタンの文言に「Lesson NN」を入れない。レッスン一覧の件数を数えるテストと衝突する */}
        {next ? (
          <div className="statusboard__cta">
            <Link className="btn btn--primary" to={toPath(next.number)}>
              {completed.size === 0 ? "はじめる" : "つづける"}
            </Link>
            <p className="statusboard__next">
              次は <b>{next.title}</b>
            </p>
          </div>
        ) : (
          <p className="statusboard__done">全レッスン完了。あとは弾き続けるだけです。</p>
        )}
      </section>

      {stages.map((stage) => (
        <section className="section stage" key={stage.number}>
          <h2 className="section__title">
            <span className="stage__no">Stage {stage.number}</span>
            {stage.title}
            {stage.comingSoon && <span className="badge">準備中</span>}
          </h2>
          {stage.comingSoon ? (
            <ul className="planned">
              {(stage.plannedTopics ?? []).map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          ) : (
            <ol className="lessonlist">
              {lessons
                .filter((lesson) => lesson.stage === stage.number)
                .map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      className={`lessonrow${completed.has(lesson.id) ? " is-done" : ""}`}
                      to={toPath(lesson.number)}
                    >
                      <span className="lessonrow__no" aria-hidden="true">
                        {String(lesson.number).padStart(2, "0")}
                      </span>
                      <span className="lessonrow__text">
                        <span className="lessonrow__title">
                          Lesson {String(lesson.number).padStart(2, "0")} {lesson.title}
                        </span>
                        {/* 課題曲名はタイトルに入っているため、ここでは繰り返さない */}
                        <span className="lessonrow__meta">
                          {lesson.days[0] === lesson.days[1]
                            ? `${lesson.days[0]}日目`
                            : `${lesson.days[0]}〜${lesson.days[1]}日目`}
                          {lesson.newChords.length > 0 &&
                            `・${lesson.newChords.join(" ")} を覚える`}
                        </span>
                      </span>
                      {/* 完了印は有無で行の高さと文字位置が動かないよう、枠を常に置く */}
                      <span className="lessonrow__check">
                        {completed.has(lesson.id) && <span aria-label="完了">✓</span>}
                      </span>
                    </Link>
                  </li>
                ))}
            </ol>
          )}
        </section>
      ))}

      {/* 曲を持つ楽器だけ入口を出す。持たない楽器では /songs が 404 になる */}
      {instrument.songLibrary ? (
        <section className="section">
          <h2 className="section__title">楽譜ライブラリ</h2>
          <p className="section__lede">
            著作権の保護期間が満了した曲を集めています。習ったコードだけで弾ける曲に絞れます。
          </p>
          <Link className="btn" to={`/${instrument.slug}/songs`}>
            曲をさがす
          </Link>
        </section>
      ) : null}
    </main>
  );
}
