import { describe, expect, it } from "vitest";
import { TIME_LIMIT_MS, current, isOver, points, remainingSeconds, start, submit } from "../src/game";

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

// 正解を n 回続けた状態を作る
function streak(n: number) {
  let s = start();
  for (let i = 0; i < n; i++) s = submit(words, s, current(words, s));
  return s;
}

describe("combo", () => {
  it("連続で正解するとコンボが増える", () => {
    expect(streak(3).combo).toBe(3);
  });
  it("ミスするとコンボが 0 に戻るが、問題とスコアはそのまま", () => {
    const before = streak(3);
    const after = submit(words, before, "x");
    expect(after.combo).toBe(0);
    expect(after.score).toBe(before.score);
    expect(after.index).toBe(before.index);
  });
  it("ミスしても最大コンボは残る", () => {
    const s = submit(words, streak(4), "x");
    expect(s.maxCombo).toBe(4);
  });
  it("5 連続ごとに 1 問の得点が 1 点増える", () => {
    expect(points(1)).toBe(1);
    expect(points(4)).toBe(1);
    expect(points(5)).toBe(2);
    expect(points(9)).toBe(2);
    expect(points(10)).toBe(3);
  });
  it("5 連続正解でスコアは 1+1+1+1+2 = 6", () => {
    expect(streak(5).score).toBe(6);
  });
});

describe("timer", () => {
  it("開始前は 60 秒のまま止まっていて、終了しない", () => {
    expect(remainingSeconds(null, 999_999)).toBe(60);
    expect(isOver(null, 999_999)).toBe(false);
  });
  it("経過時間に応じて残り秒数が減る", () => {
    expect(remainingSeconds(1000, 1000)).toBe(60);
    expect(remainingSeconds(1000, 1000 + 30_000)).toBe(30);
  });
  it("60 秒で終了し、残り時間はマイナスにならない", () => {
    expect(isOver(0, TIME_LIMIT_MS - 1)).toBe(false);
    expect(isOver(0, TIME_LIMIT_MS)).toBe(true);
    expect(remainingSeconds(0, TIME_LIMIT_MS + 5000)).toBe(0);
  });
});
