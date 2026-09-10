import { MDXProvider } from "@mdx-js/react";
import type { Instrument, Lesson } from "./types";
import { getLessonComponent } from "./lessonModules";

export type LessonLayoutProps = {
  instrument: Instrument;
  lesson: Lesson;
};

export function LessonLayout({ instrument, lesson }: LessonLayoutProps) {
  const Body = getLessonComponent(instrument.slug, lesson.number);
  const stage = instrument.curriculum.stages.find((item) => item.number === lesson.stage);

  const days =
    lesson.days[0] === lesson.days[1]
      ? `${lesson.days[0]}日目`
      : `${lesson.days[0]}〜${lesson.days[1]}日目`;

  return (
    <article className="lesson">
      <header className="lesson__header">
        <p className="lesson__stage">
          Stage {lesson.stage} {stage?.title} ・ {days}
        </p>
        {/* 見出しの読み上げ名に「Lesson NN」を残したまま、番号だけ字面を変える */}
        <h1 className="lesson__title">
          <span className="lesson__no">Lesson {String(lesson.number).padStart(2, "0")}</span>
          {lesson.title}
        </h1>
        <p className="lesson__goal">
          <span className="lesson__goal-label">このレッスンの到達点</span>
          {lesson.goal}
        </p>
      </header>
      <div className="lesson__body">
        {Body ? (
          <MDXProvider components={instrument.mdxComponents}>
            <Body />
          </MDXProvider>
        ) : (
          <p className="lesson__pending">
            このレッスンの本文はまだ書かれていません。順に書き足していきます。
          </p>
        )}
      </div>
    </article>
  );
}
