---
workflow: general-video
flow: automation
storyboard: no
message: "벽돌에 부딪힌 단테가 다시 일어나 끝까지 간다"
destination: shorts
aspect: 1080x1920
language: ko
length: 27s
---

## Intent

78초 원본(assets/raw.mp4, 펠트·클레이 배경의 2D 점프 게임 화면 + 한국어 내레이션)에서
30초 이내 한 구간을 골라 세로 쇼츠로 편집한다. 실패 → 재도전 → 성공의 짧은 서사.

## Assets

- assets/raw.mp4 — 원본 1920x1080 30fps, 78.2s. 사용 구간 36.8s–63.9s (27.1s).
- assets/transcript.json — whisper 전사(자동 번역됨, 참고용). 자막 타이밍은 발화 구간별 한국어 재전사로 보정.
- assets/fonts/BlackHanSans-Regular.ttf — 한글 디스플레이 서체 (OFL).

## Customizations

- 단어 하이라이트 자막 (karaoke, asr-keyword-glow 변형)
- 키네틱 타이포 훅 (kinetic-beat-slam: "벽돌 하나에" → "꽝!")
- 진행 바 (stat-bars-and-fills progress fill + 코인 헤드)

## Notes

- 출력: out/short.mp4. 프로젝트 훅 기준: 1080x1920, -14 LUFS ±1, 0.5s 넘는 검은 화면 금지.
