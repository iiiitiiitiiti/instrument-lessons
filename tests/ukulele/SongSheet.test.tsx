import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { SchedulerOptions } from "../../src/core/audio/output/scheduler";
import { SongSheet } from "../../src/instruments/ukulele/widgets/SongSheet";

// jsdom には Web Audio が無いので、鳴らす呼び出しだけ差し替える
const playNotes = vi.hoisted(() => vi.fn());
vi.mock("../../src/core/audio/output/play", () => ({ playNotes }));
const playVoice = vi.hoisted(() => vi.fn());
vi.mock("../../src/core/audio/output/voice", () => ({ playVoice }));
const playClick = vi.hoisted(() => vi.fn());
vi.mock("../../src/core/audio/output/click", () => ({ playClick }));
vi.mock("../../src/core/audio/output/context", () => ({
  getAudioContext: () => ({ currentTime: 0 }),
}));

// 時計を持たないスケジューラに差し替え、予約と通知をテストから直接呼ぶ
const scheduler = vi.hoisted(() => ({ options: null as SchedulerOptions | null, running: false }));
vi.mock("../../src/core/audio/output/scheduler", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/core/audio/output/scheduler")>();
  return {
    ...actual,
    createScheduler: (options: SchedulerOptions) => {
      scheduler.options = options;
      return {
        start: () => {
          scheduler.running = true;
        },
        stop: () => {
          scheduler.running = false;
        },
        isRunning: () => scheduler.running,
      };
    },
  };
});

const SAMPLE = "[C]Oh when the saints [F]go marching [C]in";

describe("SongSheet", () => {
  beforeEach(() => {
    playNotes.mockClear();
    playVoice.mockClear();
    scheduler.running = false;
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

describe("SongSheet: 歌詞の意味", () => {
  const MEANING = [
    { line: "Oh when the saints ", meaning: "聖者たちが行進してゆくとき" },
    { line: "go marching in", meaning: "その列に加わりたい" },
  ];

  test("渡さなければ意味を出さない", () => {
    const { container } = render(<SongSheet source={"[C]Oh when the saints \n[F]go marching in"} />);
    expect(container.querySelector(".songsheet__meaning")).toBeNull();
  });

  test("各行のすぐ下に、その行の意味を出す", () => {
    const { container } = render(
      <SongSheet source={"[C]Oh when the saints \n[F]go marching in"} meaning={MEANING} />,
    );
    const rows = [...container.querySelectorAll(".songsheet__row")];
    expect(rows).toHaveLength(2);
    // 2行目の意味が2行目の直後にある
    expect(rows[1].querySelector(".songsheet__meaning")?.textContent).toBe("その列に加わりたい");
    expect(rows[0].querySelector(".songsheet__meaning")?.textContent).toBe(
      "聖者たちが行進してゆくとき",
    );
  });

  test("空行のある譜面でも、意味は歌詞の行だけに付く", () => {
    const { container } = render(
      <SongSheet source={"[C]Oh when the saints \n\n[F]go marching in"} meaning={MEANING} />,
    );
    const meanings = [...container.querySelectorAll(".songsheet__meaning")].map(
      (node) => node.textContent,
    );
    expect(meanings).toEqual(["聖者たちが行進してゆくとき", "その列に加わりたい"]);
  });
});

const PERFORMANCE = {
  abc: 'M:4/4\nL:1/16\nK:C\n"C"C8 "F"D8 | "C"E16 |\nw: Oh saints in',
  bpm: 60,
  strum: "down" as const,
};

describe("SongSheet: お手本の再生", () => {
  const renderPlayer = (performance = PERFORMANCE) =>
    render(<SongSheet source={SAMPLE} performance={performance} />);
  const options = () => scheduler.options as SchedulerOptions;

  beforeEach(() => {
    playNotes.mockClear();
    playVoice.mockClear();
    playClick.mockClear();
    scheduler.running = false;
  });

  // 最初の小節は満ちているので、カウントインは16ステップ（1小節）。曲のステップはその後ろに並ぶ
  const LEAD = 16;

  test("performance が無ければ再生の操作を出さない", () => {
    render(<SongSheet source={SAMPLE} />);
    expect(screen.queryByRole("button", { name: "お手本を再生" })).not.toBeInTheDocument();
  });

  test("再生を押すと始まり、ボタンが「止める」に変わる", () => {
    renderPlayer();
    fireEvent.click(screen.getByRole("button", { name: "お手本を再生" }));
    expect(scheduler.running).toBe(true);
    expect(screen.getByRole("button", { name: "止める" })).toBeInTheDocument();
  });

  test("最初の1小節は拍の合図だけを鳴らし、1拍目を強くする", () => {
    renderPlayer();
    fireEvent.click(screen.getByRole("button", { name: "お手本を再生" }));
    act(() => options().schedule(0, 1));
    act(() => options().schedule(4, 2));

    expect(playClick).toHaveBeenNthCalledWith(1, { accent: true, at: 1 });
    expect(playClick).toHaveBeenNthCalledWith(2, { accent: false, at: 2 });
    expect(playNotes).not.toHaveBeenCalled();
    expect(playVoice).not.toHaveBeenCalled();
  });

  test("カウントインの間は何も光らせず、最初のコードの図を出す", () => {
    renderPlayer();
    fireEvent.click(screen.getByRole("button", { name: "F の押さえ方と音" }));
    fireEvent.click(screen.getByRole("button", { name: "お手本を再生" }));
    act(() => options().onBeat?.(0));

    expect(document.querySelector(".is-playing")).toBeNull();
    expect(document.querySelector(".is-picked")).toBeNull();
    expect(screen.getByRole("img", { name: /^C コードの押さえ方。/ })).toBeInTheDocument();
  });

  test("予約されたステップで、コードのストロークとメロディを鳴らす", () => {
    renderPlayer();
    fireEvent.click(screen.getByRole("button", { name: "お手本を再生" }));
    act(() => options().schedule(LEAD, 1));

    // C は 4弦から G4・C4・E4・C5
    expect(playNotes).toHaveBeenCalledWith(["G4", "C4", "E4", "C5"], expect.objectContaining({ at: 1 }));
    // BPM 60 で16分音符8つ分は2秒
    expect(playVoice).toHaveBeenCalledWith("C4", { seconds: 2, at: 1 });
  });

  test("メロディを外すと、ストロークだけを鳴らす", () => {
    renderPlayer();
    fireEvent.click(screen.getByRole("checkbox", { name: "メロディも鳴らす" }));
    fireEvent.click(screen.getByRole("button", { name: "お手本を再生" }));
    act(() => options().schedule(LEAD, 1));

    expect(playNotes).toHaveBeenCalled();
    expect(playVoice).not.toHaveBeenCalled();
  });

  test("鳴っている箇所のコードだけを光らせ、下の図もそのコードにする", () => {
    renderPlayer();
    fireEvent.click(screen.getByRole("button", { name: "お手本を再生" }));

    act(() => options().onBeat?.(LEAD + 16));
    const cs = screen.getAllByRole("button", { name: "C の押さえ方と音" });
    // 同じ C が2か所あっても、光るのは今鳴っている2つ目だけ
    expect(cs[0]).not.toHaveClass("is-playing");
    expect(cs[1]).toHaveClass("is-playing");
    expect(screen.getByRole("img", { name: /^C コードの押さえ方。/ })).toBeInTheDocument();

    act(() => options().onBeat?.(LEAD + 8));
    expect(screen.getByRole("button", { name: "F の押さえ方と音" })).toHaveClass("is-playing");
    expect(screen.getByRole("img", { name: /^F コードの押さえ方。/ })).toBeInTheDocument();
  });

  test("最後のステップの次を予約しに来たら、その時刻に止まる", () => {
    vi.useFakeTimers();
    try {
      renderPlayer();
      fireEvent.click(screen.getByRole("button", { name: "お手本を再生" }));
      act(() => options().schedule(LEAD + 32, 0));
      act(() => {
        vi.runAllTimers();
      });

      expect(scheduler.running).toBe(false);
      expect(screen.getByRole("button", { name: "お手本を再生" })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  test("タブが裏に回ったら止まる", () => {
    renderPlayer();
    fireEvent.click(screen.getByRole("button", { name: "お手本を再生" }));

    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    try {
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
      });
    } finally {
      delete (document as { hidden?: boolean }).hidden;
    }

    expect(scheduler.running).toBe(false);
    expect(screen.getByRole("button", { name: "お手本を再生" })).toBeInTheDocument();
  });

  test("再生で原譜と変えた点を、操作の下に出す", () => {
    renderPlayer({ ...PERFORMANCE, note: "フェルマータは伸ばしません。" } as typeof PERFORMANCE);
    expect(screen.getByText("フェルマータは伸ばしません。")).toBeInTheDocument();
  });
});
