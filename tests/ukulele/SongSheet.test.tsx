import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SongSheet } from "../../src/instruments/ukulele/widgets/SongSheet";

// jsdom には Web Audio が無いので、鳴らす呼び出しだけ差し替える
const playNotes = vi.hoisted(() => vi.fn());
vi.mock("../../src/core/audio/output/play", () => ({ playNotes }));

const SAMPLE = "[C]Oh when the saints [F]go marching [C]in";

describe("SongSheet", () => {
  beforeEach(() => {
    playNotes.mockClear();
  });

  test("歌詞を1文字も落とさずに表示する", () => {
    const { container } = render(<SongSheet source={SAMPLE} />);
    const lyrics = Array.from(container.querySelectorAll(".songsheet__text"))
      .map((node) => node.textContent)
      .join("");
    expect(lyrics).toBe("Oh when the saints go marching in");
  });

  test("コード名を押せるボタンとして出す", () => {
    render(<SongSheet source={SAMPLE} />);
    expect(screen.getAllByRole("button", { name: "C の押さえ方と音" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "F の押さえ方と音" })).toBeInTheDocument();
  });

  test("コードの付かない歌詞にはボタンを作らない", () => {
    render(<SongSheet source="Oh when the [F]saints" />);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  test("押す前はコード図を出さない", () => {
    render(<SongSheet source={SAMPLE} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/コード名を押すと/)).toBeInTheDocument();
  });

  test("コード名を押すと、そのコードの図と音が出る", () => {
    render(<SongSheet source={SAMPLE} />);

    fireEvent.click(screen.getByRole("button", { name: "F の押さえ方と音" }));

    expect(screen.getByRole("img", { name: /^F コードの押さえ方。/ })).toBeInTheDocument();
    expect(playNotes).toHaveBeenCalledTimes(1);
    // F は 4弦2フレット・3弦開放・2弦1フレット・1弦開放
    expect(playNotes.mock.calls[0][0]).toEqual(["A4", "C4", "F4", "A4"]);
  });

  test("別のコードを押すと図が入れ替わる", () => {
    render(<SongSheet source={SAMPLE} />);

    fireEvent.click(screen.getByRole("button", { name: "F の押さえ方と音" }));
    fireEvent.click(screen.getAllByRole("button", { name: "C の押さえ方と音" })[0]);

    expect(screen.getByRole("img", { name: /^C コードの押さえ方。/ })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /^F コードの押さえ方。/ })).not.toBeInTheDocument();
  });

  test("題と説明を出す", () => {
    render(<SongSheet source={SAMPLE} title="聖者の行進" caption="1行が4小節です。" />);
    expect(screen.getByText("聖者の行進")).toBeInTheDocument();
    expect(screen.getByText("1行が4小節です。")).toBeInTheDocument();
  });

  /*
   * 綴りを間違えたコードは音も図も出せない。本文で使ったまま気づかないほうが害なので、
   * 描画時に投げる。tests/ukulele/lessonRender.test.tsx が全レッスンを描画して拾う。
   */
  test("定義していないコード名は投げる", () => {
    expect(() => render(<SongSheet source="[Xyz]oops" />)).toThrow(/未定義のコードです: Xyz/);
  });
});
