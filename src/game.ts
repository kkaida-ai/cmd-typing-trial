// 画面に依存しないゲームのルール。ここはユニットテストで守る
export type State = { index: number; score: number };

export function start(): State {
  return { index: 0, score: 0 };
}

export function current(words: string[], s: State): string {
  return words[s.index % words.length];
}

export function submit(words: string[], s: State, typed: string): State {
  if (typed !== current(words, s)) return s;
  return { index: s.index + 1, score: s.score + 1 };
}
