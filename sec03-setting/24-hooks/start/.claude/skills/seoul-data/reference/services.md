# 서비스별 요청인자

주소 모양: `http://openapi.seoul.go.kr:8088/{인증키}/json/{서비스명}/{시작}/{끝}/{인자1}/{인자2}/…`

- 인자는 **순서대로** 붙는다. 뒤쪽 인자를 쓰려면 앞쪽 안 쓰는 칸을 공백(`%20`)으로 채운다.
- 맨 뒤에서부터 안 쓰는 칸은 생략해도 된다.
- 여기 없는 서비스는 데이터셋 페이지의 'Open API' 탭에서 서비스명과 요청인자 순서를 확인해 이 표에 더한다.

| 데이터 | 서비스명 | 인자 순서 | fetch.py 예 |
|---|---|---|---|
| 지하철 호선별 역별 시간대별 승하차 (월) | `CardSubwayTime` | `/월(YYYYMM, 필수)/호선/역` | `CardSubwayTime 202508 --station 강남` |
| 지하철 호선별 역별 승하차 (일) | `CardSubwayStatsNew` | `/날짜(YYYYMMDD, 필수)/호선/역` | `CardSubwayStatsNew 20250801 --line 2` |
| 실시간 대기환경(미세먼지) | `RealtimeCityAir` | 없음 | `RealtimeCityAir` |
| 공공 와이파이 위치 | `TbPublicWifiInfo` | 없음 | `TbPublicWifiInfo` |
| 따릉이 실시간 대여 현황 | `bikeList` | 없음 | `bikeList` |

## CardSubwayTime / CardSubwayStatsNew

- 월·날짜는 위치 인자로, 호선·역은 `--line`, `--station`으로 준다. 스크립트가 순서를 맞추고 빈 칸은 `%20`으로 채운다.
  - `CardSubwayTime 202508 --station 강남` → `…/CardSubwayTime/1/1000/202508/%20/강남`
  - `CardSubwayTime 202508 --line 2 --station 강남` → `…/202508/2호선/강남`
- `--line`에 숫자만 주면(`2`) `2호선`으로 바꾼다. 그 밖의 노선명(예: `경의선`, `공항철도 1호선`)은 데이터에 적힌 그대로 준다.
- 역 이름도 데이터에 적힌 그대로여야 한다(예: `서울역`, `총신대입구(이수)`). `INFO-200`이 나오면 역 이름 표기가 다를 수 있으니, `--line`만 주고 `--max 1000`으로 받아 역 컬럼(`STTN` 또는 `SUB_STA_NM`)에서 정확한 이름을 찾는다.
- 한 역이 여러 호선에 있으면(예: 환승역) `--station`만 줄 때 호선마다 한 줄씩 나온다.
- 최신 달·날짜는 아직 공개 전일 수 있다. `INFO-200`이면 한두 달 전으로 바꿔 본다.
