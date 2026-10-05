import { WORDS } from "./words";
import { current, start, submit } from "./game";

const prompt = document.querySelector<HTMLParagraphElement>("#prompt")!;
const answer = document.querySelector<HTMLInputElement>("#answer")!;
const score = document.querySelector<HTMLSpanElement>("#score")!;
let state = start();

function render() {
  prompt.textContent = current(WORDS, state);
  score.textContent = String(state.score);
}

answer.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  state = submit(WORDS, state, answer.value);
  answer.value = "";
  render();
});
render();
answer.focus();
