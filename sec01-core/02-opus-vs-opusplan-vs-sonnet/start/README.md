# Opus만 vs opusplan vs Sonnet만 (섹션 1 직접 재 보기)

1. `prompt.txt`에 부탁을 한 줄로 적는다.
2. `python3 measure.py` — 세 설정으로 동시에 계획 → 구현, 시간·토큰·비용을 표로.
3. `python3 -m http.server 8000` 후 `http://127.0.0.1:8000/compare.html?rep=1` — 세 결과를 나란히.
