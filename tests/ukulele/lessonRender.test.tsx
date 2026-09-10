import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { LessonLayout } from "../../src/core/lesson/LessonLayout";
import { listLessonNumbers } from "../../src/core/lesson/lessonModules";
import { UKULELE } from "../../src/instruments/ukulele/instrument";
import { PitchMap } from "../../src/instruments/ukulele/widgets/figures/PitchMap";

const written = listLessonNumbers(UKULELE.slug);

function lessonByNumber(number: number) {
  const lesson = UKULELE.curriculum.lessons.find((item) => item.number === number);
  if (!lesson) throw new Error(`カリキュラムに Lesson ${number} がありません`);
  return lesson;
}

describe("レッスン本文の描画", () => {
  /*
   * MDX は本文で使われた大文字始まりのタグを mdxComponents から解決する。
   * 登録し忘れると、そのレッスンを開いた瞬間に例外になって画面が真っ白になる。
   * 本文を読み込むだけのテストでは通ってしまうため、実際に描画して確かめる。
   */
  test.each(written)("Lesson %i が例外なく描画できる", (number) => {
    expect(() =>
      render(<LessonLayout instrument={UKULELE} lesson={lessonByNumber(number)} />),
    ).not.toThrow();
  });

  test("図はすべて読み上げ用の説明を持つ", () => {
    for (const number of written) {
      const { unmount } = render(
        <LessonLayout instrument={UKULELE} lesson={lessonByNumber(number)} />,
      );
      for (const figure of screen.queryAllByRole("img")) {
        const label = figure.getAttribute("aria-label");
        expect(label, `Lesson ${number} の図に aria-label が無い`).toBeTruthy();
        // 「図」「画像」だけの説明では、読めない人に何も伝わらない
        expect(label!.length, `Lesson ${number} の図の説明が短すぎる`).toBeGreaterThan(10);
      }
      unmount();
    }
  });

  test("本文が未執筆のレッスンは準備中と出る", () => {
    const missing = UKULELE.curriculum.lessons.find((lesson) => !written.includes(lesson.number));
    if (!missing) return; // 全レッスンの本文が揃ったらこの検査は不要になる
    render(<LessonLayout instrument={UKULELE} lesson={missing} />);
    expect(screen.getByText(/まだ書かれていません/)).toBeInTheDocument();
  });
});

describe("PitchMap", () => {
  test("High-G では4弦が3弦より高い", () => {
    render(<PitchMap />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/1弦が一番高く、3弦が一番低い/);
  });

  test("Low-G では4弦が一番低い", () => {
    render(<PitchMap lowG />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toMatch(/4弦が一番低い/);
  });

  test("Low-G の4弦は High-G の1オクターブ下", () => {
    const { unmount } = render(<PitchMap />);
    const high = screen.getByRole("img").getAttribute("aria-label")!;
    unmount();
    render(<PitchMap lowG />);
    const low = screen.getByRole("img").getAttribute("aria-label")!;
    expect(high).toMatch(/4弦がG4/);
    expect(low).toMatch(/4弦がG3/);
  });
});
