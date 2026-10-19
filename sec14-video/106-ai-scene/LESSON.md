# 106강 · AI로 장면 만들기 — Comfy Cloud MCP

흐름: 원본에서 참조 프레임 한 장 → 같은 화풍으로 그림 만들기(이미지 모델) → 그림을 영상으로(이미지 → 영상 모델) → 규격 맞추기(1920×1080 · 30fps).

## 연결하기 (한 번만)
```bash
claude mcp add --transport http comfy-cloud https://cloud.comfy.org/mcp
```
그다음 클로드 안에서 `/mcp` → comfy-cloud 로그인. 로그인 대신 API 키로 연결하려면 위 명령 끝에 `--header "X-API-Key: 내 키"`를 붙입니다(녹화 환경은 이 방법). API 키는 비밀번호와 같으니 화면에 띄우거나 저장소에 올리지 마세요. `claude mcp list`에서 `✔ Connected`면 준비 끝.

시작: 105강을 마친 `dante-run` 폴더. Comfy Cloud 크레딧이 듭니다.

## 실제로 쓴 프롬프트
```
컴피 클라우드로 이 영상 마지막에 붙일 장면을 만들어줘. raw.mp4와 같은 클레이 화풍으로 단테가 결승 깃발에 도착해서 손을 흔드는 그림을 만들고, 그걸 5초짜리 영상으로 움직이게 해서 out/ending.mp4로 저장해줘. 크레딧은 써도 되니까 묻지 말고 진행하고, 쓴 모델과 크레딧은 out/scene.md에 적어줘.
```
실제 실행 4분 11초: raw.mp4 70초 프레임을 참조로 올림 → Nano Banana Pro로 엔딩 그림 → 화풍 확인 → Kling 3.0 image-to-video 작업을 넣고 백그라운드에서 기다리며 차례를 끝냄.
이어서 `claude -c`(같은 대화 이어 열기)로 `영상 다 됐어? 끝났으면 out/ending.mp4로 받아서 확인하고 scene.md도 적어줘.` → 55초. 결과 5초 · 1920×1080 · 30fps.

크레딧(결제 내역 값): 그림 35.44 + 영상 118.16 = 153.60. 클로드가 알려 준 점: "카메라 고정"을 넣었지만 화면이 좌우로 조금 움직임. 결과 [result/scene.md](result/scene.md) · [result/ending_still.png](result/ending_still.png) · [result/ending.mp4](result/ending.mp4).

팁: 그림체는 원본 프레임을 참조로 · 크레딧 허락과 기록을 미리 적기 · 오래 걸리면 `claude -c`로 돌아와 "다 됐어?"
