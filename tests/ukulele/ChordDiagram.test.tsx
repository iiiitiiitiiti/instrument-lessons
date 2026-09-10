import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ChordDiagram } from "../../src/instruments/ukulele/widgets/ChordDiagram";

describe("ChordDiagram", () => {
  test("コード名を表示する", () => {
    render(<ChordDiagram name="C" />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  test("押さえる位置に指番号を出す", () => {
    render(<ChordDiagram name="G7" />);
    expect(screen.getAllByTestId("finger-dot")).toHaveLength(3);
  });

  test("開放弦に印を出す", () => {
    render(<ChordDiagram name="C" />);
    expect(screen.getAllByTestId("open-string")).toHaveLength(3);
  });

  test("セーハを横棒で描く", () => {
    render(<ChordDiagram name="Bb" />);
    expect(screen.getByTestId("barre")).toBeInTheDocument();
  });

  test("セーハのないコードには横棒を描かない", () => {
    render(<ChordDiagram name="D7" />);
    expect(screen.queryByTestId("barre")).not.toBeInTheDocument();
  });

  test("未定義のコードは例外を投げる", () => {
    expect(() => render(<ChordDiagram name="Xmaj9" />)).toThrow();
  });

  test("読み上げ用の説明を持つ", () => {
    render(<ChordDiagram name="C" />);
    expect(screen.getByRole("img", { name: /C コード/ })).toBeInTheDocument();
  });
});
