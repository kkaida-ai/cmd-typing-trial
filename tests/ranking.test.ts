import { describe, expect, it } from "vitest";
import { format, load, rank, record, STORAGE_KEY } from "../src/ranking";

function fakeStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(STORAGE_KEY, initial);
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

describe("rank", () => {
  it("スコアの高い順に並べる", () => {
    const r = rank([{ score: 3, at: 1 }, { score: 9, at: 2 }, { score: 5, at: 3 }]);
    expect(r.map((e) => e.score)).toEqual([9, 5, 3]);
  });

  it("同点は新しい順", () => {
    const r = rank([{ score: 4, at: 1 }, { score: 4, at: 3 }, { score: 4, at: 2 }]);
    expect(r.map((e) => e.at)).toEqual([3, 2, 1]);
  });

  it("上位5件だけ残す", () => {
    const r = rank([1, 2, 3, 4, 5, 6, 7].map((n) => ({ score: n, at: n })));
    expect(r.map((e) => e.score)).toEqual([7, 6, 5, 4, 3]);
  });
});

describe("load / record", () => {
  it("空なら空配列", () => {
    expect(load(fakeStorage())).toEqual([]);
  });

  it("壊れたデータは無視する", () => {
    expect(load(fakeStorage("not json"))).toEqual([]);
    expect(load(fakeStorage("42"))).toEqual([]);
    expect(load(fakeStorage(JSON.stringify([{ score: "x" }, null, { score: 2, at: 1 }])))).toEqual([
      { score: 2, at: 1 },
    ]);
  });

  it("記録すると保存され、次回 load で読める", () => {
    const s = fakeStorage();
    record(s, 3, 1);
    const r = record(s, 8, 2);
    expect(r.map((e) => e.score)).toEqual([8, 3]);
    expect(load(s)).toEqual(r);
  });

  it("保存に失敗しても結果を返す", () => {
    const s = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(record(s, 1, 1)).toEqual([{ score: 1, at: 1 }]);
  });
});

describe("format", () => {
  it("「順位. スコア」の形式にする", () => {
    expect(format([{ score: 9, at: 2 }, { score: 5, at: 1 }])).toEqual(["1. 9", "2. 5"]);
  });
});
