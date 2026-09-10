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

  return (
    <main className="course">
      <h1>{instrument.name}</h1>
      <p>{instrument.tagline}</p>
      <p className="course__progress">
        {completed.size} / {lessons.length} レッスン完了・連続 {streak} 日練習中
      </p>
      <progress value={completed.size} max={lessons.length} />

      {stages.map((stage) => (
        <section key={stage.number}>
          <h2>
            Stage {stage.number} {stage.title}
            {stage.comingSoon && <span className="course__coming-soon">準備中</span>}
          </h2>
          {stage.comingSoon ? (
            <ul>
              {(stage.plannedTopics ?? []).map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          ) : (
            <ol className="course__lessons">
              {lessons
                .filter((lesson) => lesson.stage === stage.number)
                .map((lesson) => (
                  <li key={lesson.id}>
                    <Link to={`/${instrument.slug}/lesson-${String(lesson.number).padStart(2, "0")}`}>
                      Lesson {String(lesson.number).padStart(2, "0")} {lesson.title}
                    </Link>
                    {completed.has(lesson.id) && <span aria-label="完了"> ✓</span>}
                  </li>
                ))}
            </ol>
          )}
        </section>
      ))}
    </main>
  );
}
