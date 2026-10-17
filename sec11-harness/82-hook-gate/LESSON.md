# 섹션 11 · 82강 검증 하네스 ② — 훅 게이트: 성공은 조용히, 실패만 알리기

## 이번 수업에서 할 것
- 검사 훅의 모양: 통과하면 종료 코드 0·출력 없음(클로드 컨텍스트에 안 들어감), 실패하면 종료 코드 2·stderr로 클로드에게 알림.
- 짧은 부탁으로 문법·타입·테스트 검사 훅(`.claude/hooks/check.py`, PostToolUse `Edit|Write|MultiEdit`)을 만든다.
- 클로드가 `sed`로 고치면 PostToolUse 훅이 돌지 않는 빈틈을 실제로 보고, 답을 끝낼 때 git 기준 바뀐 파일을 다시 검사하는 Stop 훅을 더한다.
- Stop 훅이 실제 불일치를 막고, 클로드가 고친 뒤에야 끝나는 장면, 결과 화면(시청 답 카드 가까운 장소 300m·최대 5곳).

촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 오토 모드(기본), Opus 5.5 · medium, 2026-10-17. 앱: [dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) 브랜치 `sec11-harness`, 이 수업 커밋 `02ccc38`.

## 공식 문서로 확인한 것
| 내용 | 근거 |
|---|---|
| 편집 뒤 훅이 성공하면 클로드 코드는 대화에 아무것도 표시하지 않음 | [훅 가이드 · 편집 후 코드 자동 형식 지정](https://code.claude.com/docs/ko/hooks-guide#auto-format-code-after-edits) |
| 종료 코드: 0 = 이의 없음, 2 = 작업 차단 + stderr가 이유(이벤트에 따라 클로드에게 피드백). PostToolUse는 이미 실행된 뒤라 막지 못하고 stderr를 클로드에게 보여 줌, Stop은 멈추지 못하게 하고 대화를 계속 | [훅 가이드 · 훅 출력](https://code.claude.com/docs/ko/hooks-guide#hook-output), [훅 참조 · 이벤트별 종료 코드 2](https://code.claude.com/docs/ko/hooks#exit-code-2-behavior-per-event) |
| 클로드는 셸 명령으로도 파일을 바꿀 수 있으니, 모든 변경을 확인하려면 턴마다 작업 트리를 보는 Stop 훅을 더한다 | [훅 가이드 · Matchers로 hooks 필터링](https://code.claude.com/docs/ko/hooks-guide#filter-hooks-with-matchers) |
| Stop 훅이 도구 호출 없이 8번 연속 막으면 클로드 코드가 그 훅을 넘김. 훅은 `stop_hook_active`를 보고 스스로 멈추기를 권장(`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`) | [훅 가이드 · Stop hook이 블록 상한에 도달함](https://code.claude.com/docs/ko/hooks-guide#stop-hook-hits-the-block-cap) |

## 입력한 것 (그대로)
```text
claude
파일을 고칠 때마다 문법, 타입, 테스트 검사를 돌리는 훅을 만들어 줘. 통과하면 조용히 넘어가고, 실패할 때만 알려 주게.
/exit
claude
가까운 장소를 5곳까지 보여 줘
/exit
(셸) git checkout nearby-places.mjs      ← 실수: 커밋 안 한 5곳 변경까지 되돌림
claude
아까는 sed로 고쳐서 훅이 안 돌았어. 셸 명령으로 고쳐도 걸리게, 답을 끝낼 때 바뀐 파일을 한 번 더 검사하는 Stop 훅도 달아 줘.
/exit
claude
가까운 장소 반경을 300m로 줄여 줘
```

## 화면에서 본 것 (2026-10-17)
- 훅 만들기(1분 40초): `check.py` — 문법(`.mjs/.js` → `node --check`, `.html`의 module script, `.json`, `.py`), 타입(mcp-server `tsc`), 테스트(`node --test`). 통과면 출력 없이 exit 0, 실패면 `[검증 훅] … 검사 실패` + 끝 40줄을 stderr로 exit 2. 클로드가 일부러 문법·타입·테스트 오류를 넣어 시험하고 되돌림. 설정은 `.claude/settings.json` PostToolUse `Edit|Write|MultiEdit`.
- "가까운 장소 5곳": 클로드가 "Test first (red), then change." — 테스트를 먼저 5로 바꿔 3≠5 실패를 보고 값을 바꿈(81강 TDD 스킬 영향으로 보임). 하지만 모든 수정을 **`sed`(Bash)** 로 해서 PostToolUse 훅은 한 번도 돌지 않음.
- 녹화 사이 실수: 셸에서 `git checkout nearby-places.mjs`로 시험한 것을 되돌리다 커밋 안 한 `NEARBY_LIMIT = 5`까지 3으로 되돌림 → 테스트(5)와 코드(3) 불일치. (같은 녹화 앞부분의 훅 손 시험은 `CLAUDE_PROJECT_DIR`을 안 넘겨 오류가 나서 영상에 쓰지 않음.)
- Stop 훅 더하기(2분 15초): `check.py --stop` = `git diff --name-only HEAD` + 새 파일 → 이미 같은 내용으로 통과한 파일은 건너뜀(`.claude/check-state.json`, `.gitignore`에 추가) → 실패면 exit 2, 같은 세션 연속 3회까지만(`MAX_STOP_BLOCKS`, `stop_hook_active` 확인). 클로드가 답을 끝내려는 순간 방금 단 Stop 훅이 위 불일치를 잡아 3번 막음 → 클로드는 더 막지 않고 "5로 맞출지 3으로 되돌릴지" 물음.
- 반경 300m: `sed`로 반경을 바꾸고 끝내려 하자 Stop 훅이 다시 막음 → "테스트와 규칙 문서에 이미 5로 적혀 있으니 코드를 맞추겠다" → `NEARBY_LIMIT` 5, 134개 통과·실패 0 뒤에야 끝냄. "요청하지 않은 변경을 하나 더 했다, 3으로 두려던 거면 알려 달라"고 밝힘.
- 결과 화면(실제 인증키, 서버 환경 변수로만): 시청 → 가까운 장소 5곳(덕수궁길·정동길, 시의회 앞, 광화문·덕수궁, 명동 관광특구, 북창동 먹자골목).


## 파일
- `solution/.claude/hooks/check.py` — 최종(Stop 포함, 83강 CI 모드 추가 전)
- `solution/.claude/settings.json` — 훅 연결(관찰용 trace 훅 + 검사 훅 PostToolUse·Stop)

## 연습 과제
1. 일부러 `stats.mjs`에 문법 오류를 넣고 클로드에게 다른 파일 하나를 고쳐 달라고 해 보세요. Stop 훅이 무엇을 알려 주는지, 통과할 때는 정말 아무것도 안 보이는지 확인하세요.
2. `MAX_STOP_BLOCKS`를 1로 줄이면 어떻게 달라지는지 비교해 보세요.
