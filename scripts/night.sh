#!/usr/bin/env bash
# ai-ok ラベルの Issue を順に AI に実装させ、検証を通ったものだけ PR にする。マージは人間。
# 使い方: scripts/night.sh [最大件数=3] [1件あたりの予算USD=2] [1件あたりの制限秒=1800]
set -euo pipefail
MAX=${1:-3}; BUDGET=${2:-2}; LIMIT=${3:-1800}
BASE=$(git branch --show-current)
mkdir -p .night
[ -z "$(git status --porcelain)" ] || { echo "作業ツリーが汚れているので中止"; exit 1; }

for n in $(gh issue list --label ai-ok --state open --limit "${MAX}" --json number --jq '.[].number'); do
  title=$(gh issue view "${n}" --json title --jq .title)
  body=$(gh issue view "${n}" --json body --jq .body)
  br="ai/issue-${n}"
  echo "== #${n} ${title}"
  git checkout -q -B "${br}" "${BASE}"

  # 時間制限: perl の alarm は macOS と Linux の両方にある
  set +e
  perl -e 'alarm shift; exec @ARGV' "${LIMIT}" claude -p "Issue #${n}「${title}」を実装してください。

${body}

CLAUDE.md のルールに従い、npm run check が通るまで直してください。コミットまでしてよいですが、push と PR 作成はしないでください。最後の行に STATUS: DONE か STATUS: BLOCKED <理由> を書いてください。" \
    --model sonnet --permission-mode acceptEdits \
    --allowedTools "Bash(npm *)" "Bash(npx *)" "Bash(git add *)" "Bash(git commit *)" "Bash(git status*)" "Bash(git diff*)" \
    --max-budget-usd "${BUDGET}" --output-format json > ".night/issue-${n}.json"
  code=$?
  set -e

  # AI の申告ではなく、自分で確かめる
  if [ ${code} -eq 0 ] && [ -z "$(git status --porcelain)" ] && [ "$(git rev-list --count "${BASE}..${br}")" -gt 0 ] && npm run check > ".night/issue-${n}.check.log" 2>&1; then
    git push -q -u origin "${br}"
    gh pr create --base "${BASE}" --head "${br}" --title "${title}" \
      --body "Closes #${n}

夜間スクリプトが作成しました。npm run check はスクリプト側でも通過済みです。マージ前に差分を確認してください。"
  else
    gh issue comment "${n}" --body "夜間スクリプト: 完了できませんでした（終了コード ${code}）。ログ: .night/issue-${n}.*"
    gh issue edit "${n}" --remove-label ai-ok --add-label ai-failed
  fi
  git checkout -q "${BASE}"
done
echo "== 終了"
