// 画面に依存しないランキングのロジック。保存先の Storage は引数で受け取る
export type Entry = { score: number; at: number };

export const STORAGE_KEY = "cmd-typing:ranking";
export const MAX_ENTRIES = 5;

// スコアの高い順、同点は新しい順
export function rank(entries: Entry[]): Entry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score || b.at - a.at)
    .slice(0, MAX_ENTRIES);
}

export function load(storage: Pick<Storage, "getItem">): Entry[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is Entry => typeof e?.score === "number" && typeof e?.at === "number",
    );
  } catch {
    return [];
  }
}

export function record(storage: Pick<Storage, "getItem" | "setItem">, score: number, at: number): Entry[] {
  const next = rank([...load(storage), { score, at }]);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 保存できなくてもゲームは続ける
  }
  return next;
}

export function format(entries: Entry[]): string[] {
  return entries.map((e, i) => `${i + 1}. ${e.score}`);
}
