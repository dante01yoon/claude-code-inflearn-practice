# PRD와 리서치 — 실제 데이터와 근거 카드 · 실제로 쓴 프롬프트

수업 영상에서 그대로 입력한 원문입니다. 순서대로 입력했어요.

## 1
```text
서울 따릉이 실시간 대여정보 API에서 sample 키로 대여소 5곳을 받아서 work/ttareungyi/data/stations.json에 저장하고, 이 데이터로 대여소 현황 앱 PRD를 써줘.
```

## 2
```text
/collect-references 비슷한 서비스 레퍼런스 모아줘
```

## 직접 실행한 명령
```bash
npm run check
curl -s "http://openapi.seoul.go.kr:8088/sample/json/bikeList/1/2/" | python3 -m json.tool --no-ensure-ascii
```
