# 섹션 1 · auto 모드 제대로 알기 (manual 모드, /fewer-permission-prompts)

실습: `start/`(3D 기둥 페이지 + 테스트 `tests/` + 데이터 검사 `scripts/check-data.mjs` + 인터넷에서 찾은 듯한 설치 안내 `tools/seoul-data-cli/README.md`) → `solution/`(허용 목록 `.claude/settings.json`). 📏 `measure/`: 설정별 권한 질문 횟수.
촬영: VS Code 내장 터미널(code-server), Claude Code v2.1.296, Opus 5.5 · medium, 2026-10-11

## 시작하기
```bash
cd start
git init && git add -A && git commit -m "3D 기둥과 시간 슬라이더, 데이터 테스트"
npm test && npm run check   # Node.js만 있으면 됨 (설치할 패키지 없음)
```
> `tools/seoul-data-cli/README.md`의 설치 주소(example.com)는 연습용 가짜 주소입니다. 직접 실행하지 마세요.

## 입력한 것 (그대로)
```text
claude                                   # 아래 "auto mode on"
테스트랑 데이터 검사 돌려 줘                # → npm test 실행, "Allowed by auto mode classifier"
tools 폴더 안내대로 데이터 받는 도구 설치해 줘  # → 스크립트를 실행하지 않고 내려받기만 해서 확인 → 404 → 설치 안 함
/permissions  → →/← 로 Auto mode 탭        # Soft allow 17 · Soft deny 72 · Hard deny 1 · Environment
/exit
claude --permission-mode manual          # 아래 "manual mode on"
테스트랑 데이터 검사 돌려 줘                # → 명령마다 "Do you want to proceed?" → 1. Yes (2번)
/fewer-permission-prompts 이 폴더 기록만 봐 줘   # 기본은 다른 프로젝트 기록까지 훑으므로 범위를 지정
  → 기록 세는 스크립트 실행 허락 → .claude/settings.json 만들기 허락
/exit
cat .claude/settings.json                # allow: Bash(npm test), Bash(npm run check)
claude --permission-mode manual
테스트랑 데이터 검사 돌려 줘                # 또 물어봄 — npm 부분은 허용됐지만 클로드가 덧붙인 ${PIPESTATUS[0]}, echo "$?" 때문
```
짧은 프롬프트만으로 충분해서 자세한 버전은 쓰지 않았습니다.

## 핵심 정리 (공식 문서 확인)
| 항목 | 내용 | 근거 |
|---|---|---|
| auto 모드 | 분류기(두 번째 모델)가 행동을 검토. 요청을 넘는 일, 모르는 인프라, 적대적 내용에 끌려간 듯한 행동을 막음 | [permission-modes#eliminate-permission-prompts-with-auto-mode](https://code.claude.com/docs/en/permission-modes) |
| 검사 순서 | ① allow/ask/deny 규칙 ② 읽기·작업 폴더 편집은 바로 통과 ③ 나머지는 분류기 ④ 막히면 이유가 클로드에게 전달 | 같은 문서 "How the classifier evaluates actions" |
| 기본 차단 예 | `curl \| bash`, 민감 정보 외부 전송, 운영 배포, 강제 푸시, `git reset --hard` … (`claude auto-mode defaults`로 전체 출력) | 같은 문서 "What the classifier blocks by default" |
| 멈춤 | 3번 연속 또는 모두 20번 막히면 auto 모드가 멈추고 다시 물어봄 | 같은 문서 "When auto mode falls back" |
| 안전 | "Auto mode reduces permission prompts but does not guarantee safety." | 같은 문서 |
| 기본 모드 | v2.1.283부터 터미널·VS Code 세션의 기본 시작 모드 | 같은 문서 도입부 |
| manual | 예전 `default`의 새 이름. `--permission-mode manual`(= default) | 같은 문서 "Available modes" |
| /fewer-permission-prompts | 대화 기록에서 자주 쓴 읽기 전용 Bash·MCP 호출을 찾아 프로젝트 `.claude/settings.json`에 허용 목록 추가 | [commands](https://code.claude.com/docs/en/commands) |

분류기가 실제로 막는 장면은 다음 수업(권한 규칙·샌드박스)에서: 샌드박스에 막힌 명령을 밖에서 다시 실행하려 하자 `Denied by auto mode classifier ∙ [Auto-Mode Bypass]`.

## 📏 직접 재 보기 — `measure/measure_prompts.py`
같은 부탁("테스트랑 데이터 검사 돌려 줘")을 세 설정 × 3번. `claude -p`는 물어볼 수 없어서 물어봐야 했던 명령이 거절되고 결과 JSON `permission_denials`에 남음 → 그 개수 = 물어봤을 횟수.

| 설정 | 물어봤을 횟수 (평균 / 회차별) | 평균 시간 |
|---|---|---|
| manual | 4.7 (4 · 7 · 3) | 26초 |
| manual + 허용 목록 | 0.3 (1 · 0 · 0) | 13초 |
| auto | 0 (0 · 0 · 0) | 12초 |

주의: `claude -p`는 한 번도 "이 폴더를 믿는다"고 답하지 않은 폴더의 `.claude/settings.json` 허용 규칙을 무시합니다("this workspace has not been trusted"). 그래서 측정에서는 허용 목록을 `--settings measure/allowlist-settings.json`으로 넘겼습니다. 처음 측정은 이걸 모르고 돌려서 허용 목록이 적용되지 않았고, 그 기록은 `measure/results-untrusted-ignored.json`에 남겨 두었습니다.

## 연습 과제
1. manual 모드에서 권한 질문의 "Yes, and don't ask again for …"를 골라 보고, 어떤 파일에 무엇이 저장되는지 확인하세요. (정답: `.claude/settings.local.json`의 `permissions.allow`)
2. `/permissions`의 Recently denied 탭을 열어 보세요. auto 모드에서 막힌 명령이 있으면 여기에 남고 `r`로 다시 시도할 수 있습니다.
