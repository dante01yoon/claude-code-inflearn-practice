---
workflow: general-video
flow: automation
storyboard: no
message: "등불가게 검은 고양이가 달빛 야시장의 문을 연다"
aspect: 1920x1080
language: ko
length: 10s
---

## Intent

「달빛 고양이 야시장」 에셋으로 만드는 10초 가로 영상. 주인공은 003 등불가게 검은 고양이.
요청 원문: "고양이 에셋으로 10초짜리 가로 영상을 만들어줘 … 주인공은 003 등불가게 검은 고양이야. 다 되면 out/first.mp4로 렌더해줘."

## Assets

- assets/mooncat/characters/003_lantern_shopkeeper.png — 주인공, 두 장면 모두 등장
- assets/mooncat/characters/054_lantern_firefly_companion.png — 반딧불 친구, 1장면 조연
- assets/mooncat/backgrounds/246-rainy-lantern-alley.png — 1장면 배경
- assets/mooncat/backgrounds/241-lantern-station-plaza.png — 2장면 배경
- assets/mooncat/props/261-paw-coin.png, 262-moon-gem.png — 2장면 장식

## Notes

- 렌더 출력: out/first.mp4 (사용자가 완료 후 렌더를 미리 요청함).
- 오디오 요청 없음 → 무음으로 진행 (추정 기본값).
- 폰트: Gowun Batang 700(제목), Gowun Dodum(부제) — 문구 글자만 서브셋해 assets/fonts에 동봉. 문구 바꾸면 폰트 서브셋도 다시 받아야 함.
