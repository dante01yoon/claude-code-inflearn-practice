# 핸드오프와 재사용

`npm run handoff` → `work/ttareungyi/HANDOFF.md`(화면·상태 표, 흐름, 토큰, 컴포넌트, 검사 결과, 사람 검토 — 파일에서만 생성).
녹화에서 실제로 난 일: ① 첫 실행이 오류(토큰 목록이 없는 컴포넌트 7개) → "npm run handoff가 에러 나. 고쳐줘" → 생성기가 tokens 없음을 허용(22초). ② 문서의 화면 이름이 `undefined` → 생성기는 `title`, 이 프로젝트 ia.json은 `name` → ia.json을 고치면 와이어프레임 승인이 풀리므로 생성기가 둘 다 읽게(26초).
재사용: "이 하네스를 다른 프로젝트에서도 /design-flow로 바로 시작할 수 있게 묶어줘" → [플러그인](https://code.claude.com/docs/en/plugins) + 마켓플레이스로 묶음(`.claude-plugin/`, `hooks/hooks.json`, `bin/design-harness`, 5분 4초, `claude plugin validate` 통과). 다른 프로젝트에서는:
```bash
claude plugin marketplace add /경로/design-harness
claude plugin install design-harness@design-harness --scope project
```
(사용자 설정을 바꾸는 명령이라 녹화에서는 실행하지 않고) 빈 `new-app` 폴더에서 `claude --plugin-dir ../design-harness` → `/design-flow` → 프로젝트 이름 · 만들 것 · 실존 데이터와 라이선스를 먼저 물음. 이 저장소 안에서는 플러그인을 켜지 마세요(훅이 두 번 돔).

프롬프트 원문(복사용): [PROMPTS.md](PROMPTS.md)
