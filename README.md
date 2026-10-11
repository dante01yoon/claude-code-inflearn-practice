# 클로드 코드 실전 — 강의 실습 파일

인프런 강의 「클로드 코드 실전 — 설치부터 하네스까지」에서 **실제로 촬영할 때 입력한 프롬프트와 클로드 코드가 만든 파일**을 모아 둔 저장소입니다.
클로드 코드의 결과는 같은 프롬프트라도 매번 조금씩 다릅니다. 내 결과가 영상과 다르면 이 저장소의 파일에서 이어서 진행하세요.

- 촬영 환경: VS Code 내장 터미널(code-server), Claude Code v2.1.296, 2026-10
- 수업마다 `LESSON.md`(입력한 명령·프롬프트 원문, 공식 문서 링크), `start/`(시작 상태), `solution/`(녹화 끝 상태)이 있습니다.
- 프롬프트는 짧은 평소 말투로 먼저 시도하고, 결과가 빗나가면 그때 자세한 프롬프트로 다시 씁니다. 두 버전을 모두 남겨 둡니다.
- 인증키가 들어 있는 `.env`는 올리지 않습니다. `.env.example`을 `.env`로 복사해 내 키를 넣어 쓰세요.

## 섹션 1. 핵심 기능 다지기

| 폴더 | 내용 | 수업 |
|---|---|---|
| [sec01-core/01-model-effort](sec01-core/01-model-effort/) | `/model` 별칭, `opusplan`, `/effort`, `ultrathink`, `/fast` 실습. 모델·생각 깊이·비용을 보여 주는 상태 줄 설정, 생각 깊이 4단계 비교 스크립트(`effort_check.py`) | 모델·생각 깊이 고르기 |
| [sec01-core/02-opus-vs-opusplan-vs-sonnet](sec01-core/02-opus-vs-opusplan-vs-sonnet/) | 같은 가계부 페이지를 Opus만·opusplan·Sonnet만으로 만들고 시간·토큰·비용을 재는 `measure.py`, 결과 페이지 9개와 `results.json` | 📏 Opus만 vs opusplan vs Sonnet만 |
