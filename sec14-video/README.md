# 섹션 14 · 클로드로 영상 만들기·편집하기

| 폴더 | 내용 |
|---|---|
| [93-preview](93-preview/) | 결과물 미리 보기 · 영상을 코드로 만든다는 것 · 도구 지도(Remotion · HyperFrames · Claude Motion · ffmpeg/Whisper) |
| [94-techniques](94-techniques/) | 전문 촬영·모션 기법 15가지 — 고양이 갤러리를 클로드에게 만들게 하기 |
| [95-remotion](95-remotion/) | Remotion 설치와 공식 스킬 — 짧은 한 줄로 첫 영상 (📏 스킬 없음 44.7 vs 있음 47.0) |
| [96-data-video](96-data-video/) | 데이터로 만드는 영상 — 서울역의 하루, 화면 숫자를 원본과 대조 |
| [97-self-check](97-self-check/) | 렌더하면 스스로 보는 검수 — 콘택트 시트 (📏 47.0 → 48.7) |
| [98-camera-prompt](98-camera-prompt/) | 카메라 기법을 지시하는 법 — 보여 줄 것 → 할 말 → 카메라 (📏 23.0 / 38.7 / 40.0) |
| [99-brand-kit](99-brand-kit/) | 브랜드 키트를 스킬로 (📏 일관성 4 → 9) |
| [100-trailer](100-trailer/) | [실습] 고양이 게임 20초 트레일러 — 한 군데만 고치기 |
| [101-six-steps](101-six-steps/) | 6단계로 나눠 맡기기 |
| [102-hyperframes](102-hyperframes/) | HyperFrames로 같은 영상 (📏 Remotion 47.0 / HyperFrames 42.7) |
| [103-rough-cut](103-rough-cut/) | 러프컷 자동화 — 실패 테이크 · 추임새 빼기, 자른 목록 남기기 |
| [104-captions](104-captions/) | 자막 · 고유명사 교정 — 모르면 그대로, 고친 건 근거와 함께 |
| [105-music-loudness](105-music-loudness/) | 배경음악 · 음량 맞추기 — -14 LUFS, 음악은 목소리보다 약 20 LU 작게 |
| [106-ai-scene](106-ai-scene/) | AI로 장면 만들기 — Comfy Cloud MCP로 엔딩 그림 → 5초 영상, 크레딧 기록 |

시작 자료 [start/](start/) — 이 폴더를 받아 작업 폴더에 그대로 두고 시작합니다.
- `mooncat-assets/` — 쿼카 게임 「달빛 고양이 야시장」 그림 중 실습에 필요한 최소 24개(캐릭터 5 · 배경 7 · 소품 12). 새로 만들 필요 없이 이 폴더를 그대로 쓰세요.
- `seoul-data/` — 서울 열린데이터광장 CardSubwayTime 응답(2026년 7월 한 달 합계, 역 5곳)과 칸 설명.
- `dante-run/` — 103~105강 연습용 원본 `raw.mp4`(수업용으로 만든 78초 영상) · 용어 목록 · 배경음악(CC BY 3.0, `music/CREDITS.txt`).

녹화 환경: Claude Code 2.1.299 · Opus 5.5 · Remotion 4.0.536 · Node 24. 실습 폴더 이름은 영상과 같게 `cat-video`, `seoul-video`.
