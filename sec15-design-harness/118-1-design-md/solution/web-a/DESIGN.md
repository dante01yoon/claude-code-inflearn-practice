---
version: "alpha"
name: "ttareungyi"
description: "따릉이 대여소 현황 토큰. primitive(값) -> semantic(의도). 화면은 semantic만 쓴다."
colors:
  primary: "{colors.brand}"
  brand: "#0A6B47"
  brand-soft: "#E8F3EE"
  on-brand: "#FFFFFF"
  zero: "#B3261E"
  zero-soft: "#FDEEEC"
  text: "#191F28"
  text-muted: "#4E5968"
  surface: "#FFFFFF"
  border: "#E5E8EB"
  low: "#8A4B00"
  low-soft: "#FFF3E0"
  surface-muted: "#F2F4F6"
typography:
  caption:
    fontFamily: "Noto Sans KR"
    fontSize: "13px"
  sub:
    fontFamily: "Noto Sans KR"
    fontSize: "15px"
  body:
    fontFamily: "Noto Sans KR"
    fontSize: "17px"
  title:
    fontFamily: "Noto Sans KR"
    fontSize: "22px"
  headline:
    fontFamily: "Noto Sans KR"
    fontSize: "28px"
  display:
    fontFamily: "Noto Sans KR"
    fontSize: "40px"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "24px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
components:
  app-bar:
    backgroundColor: "{colors.surface}"
    height: "56px"
    typography: "{typography.title}"
  back-button:
    size: "44px"
    textColor: "{colors.brand}"
    typography: "{typography.body}"
  station-row:
    size: "44px"
    height: "72px"
  zero-tag:
    typography: "{typography.caption}"
    textColor: "{colors.zero}"
    rounded: "{rounded.sm}"
  skeleton-row:
    height: "72px"
    backgroundColor: "{colors.border}"
    rounded: "{rounded.sm}"
  state-message:
    typography: "{typography.body}"
    textColor: "{colors.text}"
  button:
    size: "44px"
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.md}"
  coord-text:
    typography: "{typography.caption}"
    textColor: "{colors.text-muted}"
  source-note:
    typography: "{typography.caption}"
    textColor: "{colors.text-muted}"
  summary-card:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.lg}"
    height: "64px"
  low-tag:
    backgroundColor: "{colors.low-soft}"
    textColor: "{colors.low}"
    rounded: "{rounded.sm}"
  freshness:
    typography: "{typography.caption}"
    textColor: "{colors.text-muted}"
  map-pin:
    size: "44px"
  search-bar:
    size: "44px"
  mode-toggle:
    size: "44px"
  map-button:
    size: "44px"
  bottom-cta:
    size: "44px"
---

# ttareungyi 디자인 시스템

> `design-harness design-md`가 `tokens.json`·`components.json`·`copy.json`에서 만든 파일이다. 여기를 고치지 말고 원본을 고친 뒤 다시 만든다.

## Overview

따릉이 대여소 현황 토큰. primitive(값) -> semantic(의도). 화면은 semantic만 쓴다.

문구 톤: 해요체, 짧고 담담하게. 숫자를 먼저 말하고, 사용자를 탓하지 않고 다음 행동을 알려 준다.

## Colors

코드와 화면은 아래 semantic 색만 쓴다. primitive 값은 출처로만 적는다.

- **brand** (#0A6B47) ← `primitive.color.green-700`
- **brand-soft** (#E8F3EE) ← `primitive.color.green-50`
- **on-brand** (#FFFFFF) ← `primitive.color.white`
- **zero** (#B3261E) ← `primitive.color.red-700`
- **zero-soft** (#FDEEEC) ← `primitive.color.red-50`
- **text** (#191F28) ← `primitive.color.grey-900`
- **text-muted** (#4E5968) ← `primitive.color.grey-700`
- **surface** (#FFFFFF) ← `primitive.color.white`
- **border** (#E5E8EB) ← `primitive.color.grey-200`
- **low** (#8A4B00) ← `primitive.color.amber-800`
- **low-soft** (#FFF3E0) ← `primitive.color.amber-50`
- **surface-muted** (#F2F4F6) ← `primitive.color.grey-100`
- **primary**: `color.brand`의 별칭 (DESIGN.md의 대표 색 자리)

지켜야 할 명도 대비:

- `color.text` / `color.surface`: 4.5:1 이상 (현재 16.56:1)
- `color.text-muted` / `color.surface`: 4.5:1 이상 (현재 7.11:1)
- `color.brand` / `color.surface`: 4.5:1 이상 (현재 6.55:1)
- `color.on-brand` / `color.brand`: 4.5:1 이상 (현재 6.55:1)
- `color.brand` / `color.brand-soft`: 4.5:1 이상 (현재 5.76:1)
- `color.text` / `color.brand-soft`: 4.5:1 이상 (현재 14.58:1)
- `color.zero` / `color.surface`: 4.5:1 이상 (현재 6.54:1)
- `color.zero` / `color.zero-soft`: 4.5:1 이상 (현재 5.79:1)
- `color.text` / `color.zero-soft`: 4.5:1 이상 (현재 14.68:1)
- `color.text-muted` / `color.zero-soft`: 4.5:1 이상 (현재 6.31:1)
- `color.low` / `color.surface`: 4.5:1 이상 (현재 6.80:1)
- `color.low` / `color.low-soft`: 4.5:1 이상 (현재 6.20:1)
- `color.text` / `color.surface-muted`: 4.5:1 이상 (현재 15.02:1)
- `color.text-muted` / `color.surface-muted`: 4.5:1 이상 (현재 6.45:1)
- `color.zero` / `color.surface-muted`: 4.5:1 이상 (현재 5.93:1)
- `color.text-muted` / `color.brand-soft`: 4.5:1 이상 (현재 6.26:1)
- `color.on-brand` / `color.low`: 4.5:1 이상 (현재 6.80:1)
- `color.text-muted` / `color.surface`: 4.5:1 이상 (현재 7.11:1)

## Typography

- 글꼴: Noto Sans KR, Apple SD Gothic Neo, sans-serif (`font-family.base`, 토큰에는 첫 글꼴만 적는다)
- `font-size.caption`: 13px
- `font-size.sub`: 15px
- `font-size.body`: 17px
- `font-size.title`: 22px
- `font-size.headline`: 28px
- `font-size.display`: 40px
- `font-weight.regular`: 400
- `font-weight.bold`: 700
- `font-weight.medium`: 500
- `line-height.body`: 1.5
- `line-height.tight`: 1.3

굵기와 행간은 tokens.json에서 글자 크기와 짝지어 정하지 않았으므로 front matter의 typography에는 크기와 글꼴만 있다.

## Layout

- 격자: 기준 4px, 좌우 여백 16px, 4열, 열 간격 16px
- `space.1`: 4px ← `primitive.dimension.4`
- `space.2`: 8px ← `primitive.dimension.8`
- `space.3`: 12px ← `primitive.dimension.12`
- `space.4`: 16px ← `primitive.dimension.16`
- `space.6`: 24px ← `primitive.dimension.24`
- `space.8`: 32px ← `primitive.dimension.32`
- `size.touch`: 44px ← `primitive.dimension.44`
- `size.header`: 56px ← `primitive.dimension.56`
- `size.row`: 72px ← `primitive.dimension.72`
- `size.zero-bar`: 4px ← `primitive.dimension.4`
- `size.summary`: 64px ← `primitive.dimension.64`
- `size.searchbar`: 48px ← `primitive.dimension.48`
- `size.pin`: 32px ← `primitive.dimension.32`
- `size.pin-selected`: 40px ← `primitive.dimension.40`
- `size.cta`: 52px ← `primitive.dimension.52`

## Shapes

- `radius.sm`: 4px ← `primitive.dimension.4`
- `radius.md`: 8px ← `primitive.dimension.8`
- `radius.lg`: 12px ← `primitive.dimension.12`
- `radius.xl`: 16px ← `primitive.dimension.16`
- `radius.pill`: 24px ← `primitive.dimension.24`
- 토큰 밖에서 허용하는 모서리: 0px

## Components

- **AppBar** (`app-bar`)
  - textColor: `color.text` (#191F28)
  - divider: `color.border` (#E5E8EB)
  - paddingX: `space.4` (16px)
- **BackButton** (`back-button`): 누를 수 있음
  - '목록' 글자 + 왼쪽 화살표. detail 헤더 왼쪽.
- **StationRow** (`station-row`): 누를 수 있음, 변형 available, low, zero
  - paddingX: `space.4` (16px)
  - gap: `space.3` (12px)
  - name: `font-size.body` (17px)
  - nameColor: `color.text` (#191F28)
  - count: `font-size.title` (22px)
  - countWeight: `font-weight.bold` (700)
  - countAvailable: `color.brand` (#0A6B47)
  - countZero: `color.zero` (#B3261E)
  - rack: `color.text-muted` (#4E5968)
  - divider: `color.border` (#E5E8EB)
  - pressed: `color.brand-soft` (#E8F3EE)
  - zeroFill: `color.zero-soft` (#FDEEEC)
  - zeroBar: `color.zero` (#B3261E)
  - zeroBarWidth: `size.zero-bar` (4px)
  - chevron: `color.text-muted` (#4E5968)
  - zero: 배경 zero-soft + 왼쪽 막대 + ZeroTag + 굵은 '0대'. 색만으로 구분하지 않음.
- **ZeroTag** (`zero-tag`)
  - weight: `font-weight.bold` (700)
  - border: `color.zero` (#B3261E)
  - paddingX: `space.2` (8px)
  - '자전거 없음' 글자 태그. 테두리 1px zero.
- **SkeletonRow** (`skeleton-row`)
  - paddingX: `space.4` (16px)
  - 로딩 상태에 5개. 글자 없음.
- **StateMessage** (`state-message`): 변형 loading, empty, error
  - muted: `color.text-muted` (#4E5968)
  - errorIcon: `color.zero` (#B3261E)
  - gap: `space.4` (16px)
  - paddingY: `space.8` (32px)
  - list 안 상태 영역. empty·error는 아래 Button.
- **Button** (`button`): 누를 수 있음, 변형 primary
  - fontSize: `font-size.body` (17px)
  - weight: `font-weight.bold` (700)
  - paddingX: `space.6` (24px)
- **BikeCount** (`bike-count`): 변형 available, zero
  - number: `font-size.display` (40px)
  - weight: `font-weight.bold` (700)
  - available: `color.brand` (#0A6B47)
  - zero: `color.zero` (#B3261E)
  - label: `font-size.body` (17px)
  - labelColor: `color.text` (#191F28)
  - lineHeight: `line-height.tight` (1.3)
  - detail 최상위. 큰 숫자 + '대 남음'. zero는 '0대' + ZeroTag.
- **InfoRow** (`info-row`)
  - label: `font-size.body` (17px)
  - labelColor: `color.text-muted` (#4E5968)
  - value: `font-size.title` (22px)
  - valueColor: `color.text` (#191F28)
  - divider: `color.border` (#E5E8EB)
  - paddingY: `space.4` (16px)
  - detail 거치대 수. 라벨-값 한 줄.
- **CoordText** (`coord-text`)
  - weight: `font-weight.regular` (400)
  - 위·경도. 가장 낮은 위계.
- **SourceNote** (`source-note`)
  - divider: `color.border` (#E5E8EB)
  - paddingY: `space.4` (16px)
  - 화면 맨 끝 출처표시.
- **SummaryCard** (`summary-card`): 변형 default, zero
  - label: `font-size.caption` (13px)
  - value: `font-size.title` (22px)
- **LowTag** (`low-tag`)
- **Freshness** (`freshness`)
- **MapPin** (`map-pin`): 누를 수 있음
  - 숫자 말풍선 핀. 터치 영역 44. available/low/zero/selected
- **SearchBar** (`search-bar`): 누를 수 있음
  - 플로팅 검색바 48, pill
- **ModeToggle** (`mode-toggle`): 누를 수 있음
  - 대여/반납 전환, 높이 44
- **MapButton** (`map-button`): 누를 수 있음
  - 48 원형, 내 위치·새로고침
- **SheetHandle** (`sheet-handle`)
  - 36×4
- **StaleBanner** (`stale-banner`)
  - 새로고침 실패 안내 + 다시 시도
- **StatusBar** (`status-bar`)
  - 기기 상태 표시줄 자리
- **HomeIndicator** (`home-indicator`)
  - 134×5 바, 하단 안전 영역 34
- **BigStat** (`big-stat`)
  - 한 화면 한 목표: 모드에 맞는 핵심 숫자 하나를 40으로
- **Legend** (`legend`)
  - 핀 색 범례 한 줄
- **BottomCTA** (`bottom-cta`): 누를 수 있음
  - 풀폭 52, 화면당 하나

## Do's and Don'ts

- Do: primitive 값 대신 semantic 토큰을 쓴다.
- Do: 누를 수 있는 요소는 44px 이상으로 만든다.
- Do: 버튼 문구는 6자 이내로 쓴다.
- Don't: 「실패하였습니다」 표현을 쓰지 않는다.
- Don't: 「오류가 발생」 표현을 쓰지 않는다.
- Don't: 「Error」 표현을 쓰지 않는다.
- Don't: 「에러」 표현을 쓰지 않는다.
- Don't: 「!!」 표현을 쓰지 않는다.
- Don't: 「잠시만 기다려 주십시오」 표현을 쓰지 않는다.
- Don't: 「고객님」 표현을 쓰지 않는다.
- Don't: 「죄송합니다」 표현을 쓰지 않는다.
- Don't: 「No data」 표현을 쓰지 않는다.

## 문구 예

| 자리 | 문구 |
|---|---|
| appTitle | 따릉이 대여소 현황 |
| listCount | 대여소 {n}곳 |
| rowCount | {bikes}대 |
| rowRack | 거치대 {racks}개 |
| zeroTag | 자전거 없음 |
| loading | 불러오는 중… |
| empty | 표시할 대여소가 없어요 |
| error | 대여소 정보를 불러오지 못했어요 |
| retry | 다시 시도 |
| back | 목록 |
| detailCount | {bikes}대 남음 |
| detailRackValue | {racks}개 |
| coords | 위도 {lat} · 경도 {lng} |
| source | 출처: 서울특별시 OA-15493, 공공누리 제1유형 |
| freshness | {month}월 {day}일 오전 {h}:{m} 기준 |
| summaryAvailable | 자전거 있는 곳 |
| summaryBikes | 남은 자전거 |
| summaryZero | 자전거 없는 곳 |
| lowTag | 얼마 없음 |
| emptyBody | 대여소 이름 일부만 넣어 보세요. 예: 망원역 |
| errorBody | 인터넷 연결을 확인한 뒤 다시 시도해 주세요 |
| detailEmptyRacks | 빈 거치대 |
| search | 대여소 이름 검색 |
| modeRent | 대여 |
| modeReturn | 반납 |
| sheetTitle | 이 지역 대여소 {n}곳 |
| sheetTitleReturn | 반납할 수 있는 곳 {n}곳 |
| freshShort | 오전 {h}:{m} 기준 |
| sortBikes | 자전거 많은 순 |
| rowSub | 빈 거치대 {empty}개 |
| rowSubZero | 자전거 없음 · 빈 거치대 {empty}개 |
| statBikes | 자전거 |
| statEmpty | 빈 거치대 |
| statRacks | 거치대 |
| nearby | 가까운 대여소 |
| distance | 약 {m}m |
| zeroTitle | 지금 빌릴 자전거가 없어요 |
| mapEmptyTitle | 이 지역에 대여소가 없어요 |
| mapEmptyBody | 지도를 넓혀서 다시 찾아보세요 |
| widen | 범위 넓히기 |
| staleTitle | 최신 정보를 불러오지 못했어요 |
| staleBody | 오전 {h}:{m} 정보를 보여 주고 있어요 |
| osm | © OpenStreetMap |
| bigRent | 빌릴 수 있는 자전거 |
| bigReturn | 반납할 수 있는 자리 |
| racks | 거치대 {racks}개 |
| legend | 3대 이상 · 1~2대 · 없음 |
| emptyTitle | ‘{q}’ 이름의 대여소가 없어요 |
| clearSearch | 검색어 지우기 |

## 그 밖의 토큰

- `primitive.color.ink-900`: #18211D
- `primitive.color.ink-600`: #505C56
- `primitive.color.ink-200`: #D3DBD7
- `primitive.color.ink-50`: #F3F6F4
- `primitive.dimension.20`: 20px
- `primitive.dimension.28`: 28px
