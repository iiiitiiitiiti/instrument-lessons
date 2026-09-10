import type { ComponentType } from "react";

type MdxModule = { default: ComponentType };

const modules = import.meta.glob<MdxModule>("../../../content/*/lesson-*.mdx", { eager: true });

function pathFor(instrumentSlug: string, lessonNumber: number): string {
  return `../../../content/${instrumentSlug}/lesson-${String(lessonNumber).padStart(2, "0")}.mdx`;
}

/** レッスン本文の MDX コンポーネントを返す。本文が未執筆なら undefined。 */
export function getLessonComponent(
  instrumentSlug: string,
  lessonNumber: number,
): ComponentType | undefined {
  return modules[pathFor(instrumentSlug, lessonNumber)]?.default;
}

/** 本文ファイルが存在するレッスン番号を返す。カリキュラムに無い本文の検出に使う。 */
export function listLessonNumbers(instrumentSlug: string): number[] {
  const prefix = `../../../content/${instrumentSlug}/lesson-`;
  return Object.keys(modules)
    .filter((path) => path.startsWith(prefix))
    .map((path) => Number(path.slice(prefix.length, prefix.length + 2)))
    .sort((a, b) => a - b);
}
