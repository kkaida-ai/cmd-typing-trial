import { describe, expect, it } from "vitest";
import { current, start, submit } from "../src/game";

const words = ["a", "b"];

describe("game", () => {
  it("正しく打つと次の問題に進み、スコアが増える", () => {
    const s = submit(words, start(), "a");
    expect(s.score).toBe(1);
    expect(current(words, s)).toBe("b");
  });
  it("間違えると何も変わらない", () => {
    expect(submit(words, start(), "x")).toEqual(start());
  });
});
