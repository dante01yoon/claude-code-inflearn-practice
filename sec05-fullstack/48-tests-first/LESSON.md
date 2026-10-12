# 섹션 5 · 48강 테스트 먼저 쓰고 고치기

## 개념
- 빨간불(실패하는 테스트) → 초록불(최소한으로 고치기) → 정리. 고치기 전에 빨간불을 봐야 테스트가 버그를 잡는다는 걸 믿을 수 있음.
- 문제: 혼잡도가 기준선 근처에서 오르내리면 '지난번에 없던 알림 = 새 알림'이라 5분마다 같은 알림.

## 입력한 것 (그대로)
```text
같은 장소 붐빔 알림이 너무 자주 오지 않게 고쳐 줘. 테스트를 먼저 쓰고, 실패하는 걸 확인한 다음에 고쳐 줘
커밋해 줘
```
→ `tests/alerts.test.mjs`에 '같은 장소는 한 번 울린 뒤 쉬는 시간 동안 다시 울리지 않는다'(5분·59분 뒤 안 울림, 60분 뒤 울림, 다른 장소·역은 막지 않음) → 실패 확인 → `PLACE_ALERT_COOLDOWN_MS`(1시간)·`throttleAlerts` 구현 → 통과. 약 1분. 커밋 `dfd8bfb`.

## 직접 확인 (빨간불 검증)
```bash
git checkout dfd8bfb~1 -- alerts.mjs
node --test tests/alerts.test.mjs 2>&1 | grep -E '^(✖|ℹ (pass|fail))' | head -6   # pass 0, fail 1
git checkout HEAD -- alerts.mjs
node --test tests/alerts.test.mjs 2>&1 | grep -E '^(✖|ℹ (pass|fail))' | head -6   # pass 7, fail 0
npm test   # 63개 통과
```

---
앱 저장소: [https://github.com/dante01yoon/seoul-live-3d](https://github.com/dante01yoon/seoul-live-3d) (섹션 5 = 브랜치 `sec05-crowd`, main 병합 `9e43764`). `solution/`에는 이 수업에서 바뀌거나 생긴 파일만 있습니다.
