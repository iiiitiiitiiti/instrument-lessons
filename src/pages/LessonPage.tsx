import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { LessonLayout } from "../core/lesson/LessonLayout";
import { findInstrument } from "../instruments/registry";
import { NotFoundPage } from "./NotFoundPage";
import { useProgress } from "../core/progress/useProgress";

const LESSON_SLUG_PATTERN = /^lesson-(\d{2})$/;

export function LessonPage() {
  const { instrumentSlug = "", lessonSlug = "" } = useParams();
  const instrument = findInstrument(instrumentSlug);
  const matched = LESSON_SLUG_PATTERN.exec(lessonSlug);
  const lesson = matched
    ? instrument?.curriculum.lessons.find((item) => item.number === Number(matched[1]))
    : undefined;
  const { progress, toggleCompleted } = useProgress(instrument?.id ?? "");

  if (!instrument || !lesson) return <NotFoundPage />;

  const isCompleted = progress.completedLessonIds.includes(lesson.id);
  const lessons = instrument.curriculum.lessons;
  const previous = lessons[lesson.number - 2];
  const next = lessons[lesson.number];
  const toPath = (n: number) => `/${instrument.slug}/lesson-${String(n).padStart(2, "0")}`;

  return (
    <main className="lessonpage" style={{ "--instrument-accent": instrument.accent } as CSSProperties}>
      <Link className="crumb" to={`/${instrument.slug}`}>
        {instrument.name}のレッスン一覧
      </Link>

      <LessonLayout instrument={instrument} lesson={lesson} />

      <div className="lesson__footer">
        <button
          type="button"
          className={`btn done-toggle${isCompleted ? " is-done" : ""}`}
          onClick={() => toggleCompleted(lesson.id)}
        >
          <span className="done-toggle__mark" aria-hidden="true">
            ✓
          </span>
          {isCompleted ? "完了を取り消す" : "完了にする"}
        </button>

        {/* 前後リンクは片方が無くても位置が動かないよう、3枠を常に確保する */}
        <nav className="lesson__nav" aria-label="レッスンの移動">
          <span className="lesson__nav-slot lesson__nav-slot--prev">
            {previous && (
              <Link to={toPath(previous.number)}>
                <span className="lesson__nav-dir">前のレッスン</span>
                <span className="lesson__nav-name">{previous.title}</span>
              </Link>
            )}
          </span>
          <span className="lesson__nav-slot lesson__nav-slot--next">
            {next && (
              <Link to={toPath(next.number)}>
                <span className="lesson__nav-dir">次のレッスン</span>
                <span className="lesson__nav-name">{next.title}</span>
              </Link>
            )}
          </span>
        </nav>
      </div>
    </main>
  );
}
