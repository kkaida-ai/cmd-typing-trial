import { WORDS } from "./words";
import { format, record } from "./ranking";
import { current, isOver, remainingSeconds, start, submit } from "./game";

const prompt = document.querySelector<HTMLParagraphElement>("#prompt")!;
const answer = document.querySelector<HTMLInputElement>("#answer")!;
const score = document.querySelector<HTMLSpanElement>("#score")!;
const time = document.querySelector<HTMLSpanElement>("#time")!;
const combo = document.querySelector<HTMLSpanElement>("#combo")!;
const result = document.querySelector<HTMLDivElement>("#result")!;
const resultText = document.querySelector<HTMLParagraphElement>("#result-text")!;
const ranking = document.querySelector<HTMLOListElement>("#ranking")!;
const retry = document.querySelector<HTMLButtonElement>("#retry")!;

let state = start();
// 最初の1文字を打った時刻。null の間はタイマーが止まっている
let startedAt: number | null = null;
let timer: number | undefined;

function render() {
  prompt.textContent = current(WORDS, state);
  score.textContent = String(state.score);
  combo.textContent = String(state.combo);
  combo.classList.toggle("hot", state.combo >= 5);
  time.textContent = String(remainingSeconds(startedAt, Date.now()));
}

function tick() {
  if (isOver(startedAt, Date.now())) finish();
  render();
}

function finish() {
  clearInterval(timer);
  answer.disabled = true;
  resultText.textContent = `終了！ スコア ${state.score} / 最大コンボ ${state.maxCombo}`;
  // 「順位. スコア」を自前で書くので、ol の番号は出さない
  ranking.replaceChildren(
    ...format(record(localStorage, state.score, Date.now())).map((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      return li;
    }),
  );
  result.hidden = false;
  retry.focus();
}

function reset() {
  clearInterval(timer);
  state = start();
  startedAt = null;
  answer.value = "";
  answer.disabled = false;
  result.hidden = true;
  render();
  answer.focus();
}

answer.addEventListener("input", () => {
  if (startedAt !== null) return;
  startedAt = Date.now();
  timer = setInterval(tick, 200);
});

answer.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (isOver(startedAt, Date.now())) return finish();
  state = submit(WORDS, state, answer.value);
  answer.value = "";
  render();
});

retry.addEventListener("click", reset);
reset();
