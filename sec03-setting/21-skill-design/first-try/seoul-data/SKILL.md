---
name: seoul-data
description: 서울 열린데이터광장(data.seoul.go.kr) Open API에서 데이터를 받아 data/seoul/ 폴더에 CSV·JSON으로 저장한다. 지하철 승하차, 미세먼지, 공공와이파이, 따릉이 등 서울시 공공데이터를 받아 달라고 하거나, 서비스명(예: CardSubwayTime)이나 데이터셋 이름을 주며 데이터를 가져와 달라고 할 때 쓴다.
argument-hint: "[서비스명 또는 데이터 설명] [추가 인자…]"
allowed-tools: Bash(python3 .claude/skills/seoul-data/scripts/fetch.py:*)
---

# /seoul-data — 서울 열린데이터광장 데이터 받기

사용자 요청:

$ARGUMENTS

(비어 있으면 대화에서 사용자가 말한 데이터를 쓴다.)

## 1. 서비스명 정하기

API는 `http://openapi.seoul.go.kr:8088/{인증키}/json/{서비스명}/{시작}/{끝}/{추가 인자…}` 모양이다.

- 사용자가 서비스명(영문, 예: `CardSubwayTime`)을 주면 그대로 쓴다. 대소문자까지 정확해야 한다.
- 데이터 설명만 주면(예: "지하철 시간대별 승하차") 아래 표에서 고른다. 표에 없으면 WebSearch로 `data.seoul.go.kr <데이터 이름> OpenAPI 서비스명`을 찾거나, 데이터셋 페이지 주소를 받아 'Open API' 탭에서 서비스명과 **요청인자**를 확인한다.
- 필수 인자(날짜 등)를 모르면 샘플 키로 한 번 불러 보고, `ERROR-300`이 나오면 요청인자를 찾아 넣는다.

| 데이터 | 서비스명 | 추가 인자 |
|---|---|---|
| 지하철 호선별 역별 시간대별 승하차 (월) | `CardSubwayTime` | `YYYYMM` (예: 202508) |
| 지하철 호선별 역별 승하차 (일) | `CardSubwayStatsNew` | `YYYYMMDD` |
| 실시간 대기환경(미세먼지) | `RealtimeCityAir` | 없음 |
| 공공 와이파이 위치 | `TbPublicWifiInfo` | 없음 |
| 따릉이 실시간 대여 현황 | `bikeList` | 없음 |

최신 달·날짜는 아직 공개 전일 수 있다. `INFO-200`(데이터 없음)이 나오면 한두 달 전으로 바꿔 다시 시도한다.

## 2. 받기

```bash
python3 .claude/skills/seoul-data/scripts/fetch.py <서비스명> [추가 인자…] [--max N] [--format csv|json|both] [--out 경로] [--force]
```

- 기본 저장 위치는 `data/seoul/<서비스명>_<인자>.csv` 와 `.json` 이다. 사용자가 위치를 말하면 `--out`으로 바꾼다.
- 한 번에 1,000건씩 끝까지 이어 받는다. 몇만 건 이상이면 먼저 `--max 1000`으로 받아 모양을 보여 주고 전부 받을지 묻는다.
- 같은 파일이 있으면 멈춘다. **원본 데이터이므로 덮어쓰기(`--force`)는 사용자가 원할 때만** 쓴다.
- CSV는 `utf-8-sig`로 저장해 엑셀에서 한글이 깨지지 않는다.

## 3. 인증키

스크립트는 `--key` → 환경변수 `SEOUL_API_KEY` → 현재 폴더 `.env`의 `SEOUL_API_KEY` 순서로 찾고, 없으면 `sample` 키(최대 5건)를 쓴다.

- **인증키를 직접 읽거나 화면·파일·커밋에 쓰지 않는다.** `.env`를 열어 보지 말고 스크립트에 맡긴다.
- sample 키로 받았으면 사용자에게 알린다: data.seoul.go.kr 로그인 → 마이페이지 → '인증키 신청'으로 일반 인증키를 받고, 프로젝트 `.env`에 `SEOUL_API_KEY=발급받은키` 한 줄을 넣으면 전부 받을 수 있다. `.env`가 `.gitignore`에 있는지도 확인해 준다.

## 4. 보고

한국어로 짧게 알려 준다.

- 받은 건수 / 전체 건수, 저장한 파일 경로
- 주요 컬럼과 뜻(이름으로 짐작되는 것만, 예: `HR_8_GET_ON_NOPE` = 8시대 승차 인원)
- sample 키였으면 5건뿐이라는 점과 인증키 설정 방법
