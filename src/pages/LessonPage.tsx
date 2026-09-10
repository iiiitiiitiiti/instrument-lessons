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
    <>
      <LessonLayout instrument={instrument} lesson={lesson} />
      <div className="lesson__footer">
        <button type="button" onClick={() => toggleCompleted(lesson.id)}>
          {isCompleted ? "完了を取り消す" : "完了にする"}
        </button>
        <nav className="lesson__nav">
          {previous && <Link to={toPath(previous.number)}>前のレッスン</Link>}
          <Link to={`/${instrument.slug}`}>レッスン一覧</Link>
          {next && <Link to={toPath(next.number)}>次のレッスン</Link>}
        </nav>
      </div>
    </>
  );
}
