# 섹션 8 · 65강 백그라운드 세션과 agent view(프리뷰) — `claude --bg`, `/fork`, `/background`

> 실험 기능 · 2026-10 기준: agent view(백그라운드 세션)는 research preview입니다. 화면과 단축키가 바뀔 수 있습니다.

## 개념: 야간 근무조와 현황판
- 백그라운드 세션 = 터미널 없이 따로 도는 서비스(supervisor) 위에서 계속 일하는 근무조. agent view(`claude agents`) = 현황판(기다림 · 일하는 중 · 끝남).
- 파일을 고치기 전에 각 세션이 `.claude/worktrees/` 아래 **자기 git worktree**로 옮겨 가서, 여러 세션이 동시에 일해도 서로의 파일을 덮어쓰지 않습니다. (이미 대화 중이던 세션을 `/bg`로 보낸 경우는 원래 자리에서 계속 고침)

| 명령 | 하는 일 |
|---|---|
| `claude --bg "할 일"` (`--name 이름`) | 셸에서 새 세션을 바로 백그라운드로. `-p`와 같이 못 씀. 출력: `backgrounded · <id>` + attach/logs/stop 명령 |
| `claude agents` | 현황판. ↑↓ 고르기 · Space 엿보기(답장 가능) · Enter/→ 들어가기 · 빈 입력에서 ← 나오기 · Ctrl+X 지우기 |
| `/bg` (= `/background`) | 대화 중인 세션을 통째로 백그라운드로 |
| `/fork "할 일"` | 지금 대화를 복사해 복사본만 백그라운드로(모델 · 권한 모드 · 허락한 권한까지 넘어감), 나는 계속 |

## 실습 (입력한 것 그대로)
```bash
claude --bg "비교 그래프를 주소로 공유할 수 있게 해 줘. ?compare=강남,홍대입구로 열면 바로 비교되게"
claude agents          # Space로 엿보기 → 끝나면 Enter로 들어가기
```
```text
/fork README에 비교 그래프 공유 주소 쓰는 법을 한 단락 추가해 줘
```
```bash
# ←로 현황판에 돌아와 두 세션이 끝난 것을 확인한 뒤
git worktree list
git log --oneline --all -5
git merge --ff-only worktree-compare-url-readme
```
- 첫 세션(이름은 클로드가 붙인 `compare-graph-query-param`): 약 3분 26초, 브랜치 `worktree-compare-url`에 커밋 `5589fd9`(주소로 비교 바로 열기 · 고르면 주소 갱신 · 링크 복사 버튼 · 테스트 87개 통과). 375px 화면은 확인 못 했다고 알림.
- `/fork` 복사본: "session running · … · runs in the origin tree" → 26초 만에 `worktree-compare-url-readme`에 커밋 `16d04aa`(앞 커밋 위에서 출발).
- 두 커밋이 한 줄이라 `git merge --ff-only` 한 번으로 합침.
- 세션 지우기: 합친 뒤 지워도 클로드 코드는 커밋이 원격에 없으면 한 번 막고 `--discard-unpushed` 확인을 요구합니다(커밋이 내 브랜치에 들어간 것을 확인한 뒤 지우기).

## 결과 화면
`npm start` → http://127.0.0.1:8000/subway.html?compare=강남,홍대입구 → 열리자마자 두 역 비교 칸으로 내려가 그래프가 그려지고, 아래 「링크 복사」 버튼.

## 주의 (공식 문서 Limitations)
세션마다 구독 사용량을 따로 씁니다(10개 = 약 10배). 세션은 내 컴퓨터에서 돌아 종료하면 멈춥니다. 세션을 지우면 그 워크트리도 지워집니다.

## 근거 (2026-10-12 확인, Claude Code 2.1.296)
- [Manage multiple agents with agent view](https://code.claude.com/docs/en/agent-view)

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 8 = 브랜치 `sec08-auto`, 이 수업 커밋 `5589fd9`, `16d04aa`).
