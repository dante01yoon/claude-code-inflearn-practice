# 📏 하네스 있음 vs 없음 — 같은 부탁 비교 · 실제로 쓴 프롬프트

수업 영상에서 그대로 입력한 원문입니다. 순서대로 입력했어요.

## 1
```text
experiment 폴더의 두 실행을 다시 재서 비교표를 RESULTS.md로 만들어줘. 하네스에 불리한 것도 그대로 적어
```

## 직접 실행한 명령
```bash
cd harness && npm run compare -- --run A=../experiment/run-a --run B=../experiment/run-b --required ../experiment/required-states.json
node ../experiment/session-stats.mjs /tmp/a.json ../experiment/run-a/session.jsonl
node ../experiment/session-stats.mjs /tmp/b.json ../experiment/run-b/session-*.jsonl
```
