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

  return (
    <article className="lesson">
      <header className="lesson__header">
        <p className="lesson__stage">
          Stage {lesson.stage} {stage?.title} ・ {lesson.days[0]}〜{lesson.days[1]}日目
        </p>
        <h1>
          Lesson {String(lesson.number).padStart(2, "0")} {lesson.title}
        </h1>
        <p className="lesson__goal">このレッスンの到達点：{lesson.goal}</p>
      </header>
      <div className="lesson__body">
        {Body ? (
          <MDXProvider components={instrument.mdxComponents}>
            <Body />
          </MDXProvider>
        ) : (
          <p>このレッスンは準備中です。</p>
        )}
      </div>
    </article>
  );
}
