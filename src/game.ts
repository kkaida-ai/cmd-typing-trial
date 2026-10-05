// 画面に依存しないゲームのルール。ここはユニットテストで守る
export type State = { index: number; score: number; combo: number; maxCombo: number };

export const TIME_LIMIT_MS = 60_000;

export function start(): State {
  return { index: 0, score: 0, combo: 0, maxCombo: 0 };
}

export function current(words: string[], s: State): string {
  return words[s.index % words.length];
}

// 正解後のコンボ数から、その1問の得点を決める。5連続ごとに +1 点
export function points(combo: number): number {
  return 1 + Math.floor(combo / 5);
}

export function submit(words: string[], s: State, typed: string): State {
  if (typed !== current(words, s)) return { ...s, combo: 0 };
  const combo = s.combo + 1;
  return {
    index: s.index + 1,
    score: s.score + points(combo),
    combo,
    maxCombo: Math.max(s.maxCombo, combo),
  };
}

// 時刻は引数で受け取る。startedAt が null ならまだ始まっていない
export function remainingSeconds(startedAt: number | null, now: number): number {
  if (startedAt === null) return TIME_LIMIT_MS / 1000;
  const left = TIME_LIMIT_MS - (now - startedAt);
  return Math.max(0, Math.ceil(left / 1000));
}

export function isOver(startedAt: number | null, now: number): boolean {
  return startedAt !== null && now - startedAt >= TIME_LIMIT_MS;
}
