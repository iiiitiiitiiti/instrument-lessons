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

  /*
   * CommonMark では、閉じの ** の直前が句読点で直後が文字だと閉じ記号として働かない。
   * 「**大事です。**続き」と書くと太字にならず、記号がそのまま本文に出る。
   * 日本語では踏みやすく、実際に24箇所で踏んだ。書式が壊れたら本文に ** が残るので、
   * 描画結果を見れば機械的に見つかる。
   */
  test.each(written)("Lesson %i の本文に Markdown の記号が残っていない", (number) => {
    const { container } = render(
      <LessonLayout instrument={UKULELE} lesson={lessonByNumber(number)} />,
    );
    const body = container.querySelector(".lesson__body");
    expect(body?.textContent).not.toContain("**");
  });

  test("すべてのレッスンで太字が使われている", () => {
    for (const number of written) {
      const { container, unmount } = render(
        <LessonLayout instrument={UKULELE} lesson={lessonByNumber(number)} />,
      );
      const strong = container.querySelectorAll(".lesson__body strong");
      expect(strong.length, `Lesson ${number} の太字`).toBeGreaterThan(0);
      unmount();
    }
  });

  test("図はすべて読み上げ用の説明を持つ", () => {
    for (const number of written) {
      const { unmount } = render(
        <LessonLayout instrument={UKULELE} lesson={lessonByNumber(number)} />,
      );
      for (const figure of screen.queryAllByRole("img")) {
        const label = figure.getAttribute("aria-label");
        expect(label, `Lesson ${number} の図に aria-label が無い`).toBeTruthy();
        // 「C コードの押さえ方」程度では、読めない人に中身が伝わらない。
        // 一文で内容が分かる長さを要求する
        expect(label!.length, `Lesson ${number} の図の説明が短すぎる`).toBeGreaterThan(20);
      }
      unmount();
    }
  });

  test("カリキュラムの全レッスンに本文がある", () => {
    const missing = UKULELE.curriculum.lessons
      .filter((lesson) => !written.includes(lesson.number))
      .map((lesson) => lesson.id);
    expect(missing, "本文ファイルが無いレッスン").toEqual([]);
  });

  test("本文が無いレッスンは準備中と出る", () => {
    // 実在しない番号を渡す。全レッスンの本文が揃っても検査が空回りしないようにする
    render(
      <LessonLayout
        instrument={UKULELE}
        lesson={{ ...UKULELE.curriculum.lessons[0], number: 99, id: "uk-99" }}
      />,
    );
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
