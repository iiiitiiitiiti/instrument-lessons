import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import App from "../src/App";

test("トップに見出しが出る", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "楽器のはじめかた" })).toBeInTheDocument();
});
