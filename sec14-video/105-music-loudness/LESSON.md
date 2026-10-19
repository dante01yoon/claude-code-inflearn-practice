# 105강 · 배경음악 · 음량 맞추기

숫자 세 개: 전체 -14 LUFS(유튜브 재생 기준) · 음악은 목소리보다 약 20 LU 작게 · True Peak -1 dBTP 아래.

시작: 104강을 마친 `dante-run` 폴더(`out/cut-sub.mp4`가 있는 상태). 음악은 `music/` — Gymnopedie No. 1(Erik Satie, 연주 Kevin MacLeod), CC BY 3.0. 출처는 `music/CREDITS.txt`.

## 실제로 쓴 프롬프트
```
out/cut-sub.mp4에 music 폴더의 음악을 배경으로 깔아서 out/final.mp4로 만들어줘. 음악은 목소리보다 훨씬 작게 일정한 크기로, 시작은 서서히 커지고 끝은 서서히 작아지게 해줘. 전체 음량은 유튜브 기준인 -14 LUFS에 맞추고, 측정한 값은 out/loudness.md에 적어줘.
```
실제 실행 1분 37초. 원래 목소리 -18.9 LUFS → 최종 -14.0 LUFS / -2.0 dBTP, 음악은 목소리보다 약 21 LU 작게 고정(덕킹 없음), 페이드 인 3초 · 아웃 4초. 모노 목소리를 스테레오로 맞추면서 측정값이 약 3 LU 오름. 클로드는 "직접 들어 보지는 못했다"고 적고 CC BY 표기 문구를 남김. 결과 [result/loudness.md](result/loudness.md) · [result/final.mp4](result/final.mp4).

📏 같은 도구(ffmpeg ebur128)로 다시 잼: -14.0 LUFS / -2.0 dBTP, 기록과 같음.
팁: 목표 숫자를 말하기 · 측정값을 파일로 남기기 · 마지막은 사람이 듣기 · 출처 표기는 설명란에.
