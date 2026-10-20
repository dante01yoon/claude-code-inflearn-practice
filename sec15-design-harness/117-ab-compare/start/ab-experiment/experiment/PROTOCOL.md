# 전후 비교 실험 절차 (2026-10-18)

## 조건
| | A: 하네스 없음 | B: 디자인 하네스 |
|---|---|---|
| 작업 폴더 | 빈 폴더 + `PRD.md` + `data/stations.json` | `harness/` 사본 + 같은 PRD·데이터 (`work/ttareungyi/`) |
| 입력 | `run-a/prompt.txt` (평소 말투) | `run-b/prompt-1.txt` (`/design-flow`) |
| Figma 파일 | 따릉이 실험 A (하네스 없음) `<파일키>` | 따릉이 실험 B (디자인 하네스) `<파일키>` |
| 모델·실행 | `claude -p --model opus --output-format stream-json --verbose` | 같음. 사람 승인 단계에서 멈추면 운영자가 승인 기록 후 `--resume`으로 이어감 |

두 폴더 모두 저장소 밖 임시 폴더에서 실행해 상위 CLAUDE.md·AGENTS.md·프로젝트 메모리가 섞이지 않게 했다. 사용자 전역 설정(~/.claude)은 두 조건에 똑같이 적용된다.
두 파일 모두 단테 개인 계정 「toy project」 팀(team::<팀>)에 있다.

## 로그 (영상 재촬영용, 손대지 않음)
- `run-a/session.jsonl`, `run-b/session-<n>.jsonl`: 입력·도구 호출·출력 전체(stream-json)
- `run-*/started_at.txt`, `finished_at.txt`, `stderr*.txt`
- `run-b/approvals.log`: 운영자가 대신 기록한 승인과 그때 본 것

## 측정
1. 같은 읽기 전용 스크립트(`harness/scripts/figma/export-nodes.js`, `ONLY_SCREEN_FRAMES=false`)로 두 파일의 모든 최상위 프레임을 내보내 `run-*/nodes.json`에 저장.
2. 프레임을 화면·상태에 대응시키는 `run-*/frame-map.json`은 프레임 이름과 화면 이미지를 보고 운영자가 작성(근거 메모 포함).
3. `node harness/scripts/compare-runs.mjs --run A=run-a --run B=run-b --out RESULTS.md`
4. 같은 비평 지시로 새 맥락 비평 에이전트가 두 파일을 채점(`run-*/review.json`의 suggested). 사람 점수(score)는 단테가 채운다.

하네스가 불리하게 나온 지표도 그대로 기록한다.
