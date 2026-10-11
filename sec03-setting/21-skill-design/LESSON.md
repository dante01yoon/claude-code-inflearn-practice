# 섹션 3 · 21강 스킬 설계 — 설명 한 줄, 스크립트·참고 자료, 자가 수정 체크리스트

서울 열린데이터광장에서 공공데이터를 받는 `seoul-data` 스킬을 만듭니다. 이 스킬은 섹션 4부터 「서울 라이브 3D」에서 계속 씁니다.

좋은 스킬의 세 가지
1. **설명 한 줄(description)** — 클로드가 언제 꺼낼지 고르는 목차. 짧게, 하지만 실제로 쓰는 키워드는 담기
2. **스크립트·참고 자료** — 정확해야 하는 일은 `scripts/`(실행만, 내용은 컨텍스트에 안 올라감), 자세한 표는 `reference/`(필요할 때만 읽음)
3. **체크리스트** — SKILL.md 끝에서 결과를 스스로 확인하고, 틀리면 고쳐서 다시

## 이번 수업에서 입력한 것 (그대로)

```bash
claude
```

짧은 프롬프트:

```text
서울 열린데이터광장 데이터 받는 스킬 만들어 줘
/clear
서울역 2026년 7월 시간대별 승하차 인원 받아 줘
```

→ 스킬 이름을 말하지 않아도 `Skill(seoul-data)`가 불림. 그런데 받은 5건이 **서울역·시청·종각·종로3가·종로5가**(1호선 앞쪽 5개 역) — 빗나감.
이유: `CardSubwayTime`은 주소 끝에 `/월/호선/역`을 붙여 원하는 역만 고를 수 있는데 스킬이 그 칸을 몰랐고, 결과 확인 단계도 없었음. (짧은 버전 결과: `first-try/seoul-data/`)

"프롬프트를 좀 더 자세히 써야 제대로 되니, 제대로 작성해 보겠습니다" — 자세한 프롬프트:

```text
seoul-data 스킬을 이렇게 고쳐 줘.
- description은 '서울 열린데이터광장 데이터를 받을 때 쓴다'는 한 줄로 짧게
- 서비스별 요청인자는 reference/services.md로 빼기. CardSubwayTime은 /월/호선/역 순서이고, 안 쓰는 칸은 공백(%20)
- scripts/fetch.py에 --line, --station 옵션 추가
- SKILL.md 끝에 스스로 확인하는 체크리스트: RESULT.CODE가 INFO-000인지, 받은 건수가 list_total_count와 맞는지, 요청한 역만 들어 있는지. 틀리면 고쳐서 다시 받기
```

```text
/clear
서울역 2026년 7월 시간대별 승하차 인원 받아 줘
/web-page 방금 받은 서울역 데이터로 시간대별 승하차 그래프
```

→ 이번엔 1호선·4호선·경부선·경의선·공항철도 1호선, **모두 서울역**. 체크리스트가 "전체 10건 중 5건(sample 키 한도)"을 스스로 알려 줌.
→ `/web-page`(20강 스킬)로 `seoul-station.html`: 하차 최다 08시(447,225명), 승차 최다 18시(435,647명) — sample 키로 받은 5개 노선 기준.

- 실제 API: `http://openapi.seoul.go.kr:8088/{KEY}/json/CardSubwayTime/1/5/202607/%20/서울역` (sample 키는 최대 5건, http 전용)
- 내 인증키: data.seoul.go.kr → 마이페이지 → 인증키 신청 → 프로젝트 `.env`에 `SEOUL_API_KEY=발급받은키` (키는 스크립트가 읽고 화면에 출력하지 않음)
- 라이선스: 공공누리 1유형(출처 표시)

결과: `solution/.claude/skills/seoul-data/` (SKILL.md · reference/services.md · scripts/fetch.py), `solution/seoul-station.html`, `solution/data/seoul/`

## 공식 문서
- [Add supporting files](https://code.claude.com/docs/en/skills#add-supporting-files) — SKILL.md는 500줄 아래로, 자세한 자료는 따로
- [Skill content lifecycle](https://code.claude.com/docs/en/skills#skill-content-lifecycle) · [Skill descriptions are cut short](https://code.claude.com/docs/en/skills#skill-descriptions-are-cut-short)

## 연습 과제
description에 지하철·따릉이·미세먼지 같은 키워드를 넣고, "미세먼지 데이터 받아 줘"만으로도 스킬이 불리는지 확인
