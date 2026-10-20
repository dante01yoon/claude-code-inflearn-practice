# 핸드오프: ttareungyi

- Figma: 아직 없음
- 노드 내보낸 시각: 2026-10-19T22:54:15.434543+00:00
- 화면 크기: 390×844

## 화면과 상태

| 화면 | 기능 | default | empty | error | loading |
|---|---|---|---|---|---|
| 지도 (`map`) | F0, F1, F3 | 있음 | 있음 | 있음 | 있음 |
| 대여소 시트 (`station`) | F2 | 있음 | 해당 없음 | 해당 없음 | 해당 없음 |
| 목록 펼침 (`list`) | F1 | 있음 | 해당 없음 | 해당 없음 | 해당 없음 |

## 흐름

- 지도에서 근처 대여소에 자전거가 남았는지 확인: map:loading → map → station
- 고른 대여소가 0대일 때 가까운 대안 찾기: map → station:zero → station
- 반납할 빈 거치대 찾기: map → map:return
- 새로고침 실패 시 마지막 정보 유지 + 다시 시도: map → map:error → map

## 토큰

| 토큰 | 값 | 종류 |
|---|---|---|
| `color.brand` | #0A6B47 | color |
| `color.brand-soft` | #E8F3EE | color |
| `color.on-brand` | #FFFFFF | color |
| `color.zero` | #B3261E | color |
| `color.zero-soft` | #FDEEEC | color |
| `color.text` | #191F28 | color |
| `color.text-muted` | #4E5968 | color |
| `color.surface` | #FFFFFF | color |
| `color.border` | #E5E8EB | color |
| `color.low` | #8A4B00 | color |
| `color.low-soft` | #FFF3E0 | color |
| `color.surface-muted` | #F2F4F6 | color |
| `space.1` | 4px | dimension |
| `space.2` | 8px | dimension |
| `space.3` | 12px | dimension |
| `space.4` | 16px | dimension |
| `space.6` | 24px | dimension |
| `space.8` | 32px | dimension |
| `radius.sm` | 4px | dimension |
| `radius.md` | 8px | dimension |
| `radius.lg` | 12px | dimension |
| `radius.xl` | 16px | dimension |
| `radius.pill` | 24px | dimension |
| `size.touch` | 44px | dimension |
| `size.header` | 56px | dimension |
| `size.row` | 72px | dimension |
| `size.zero-bar` | 4px | dimension |
| `size.summary` | 64px | dimension |
| `size.searchbar` | 48px | dimension |
| `size.pin` | 32px | dimension |
| `size.pin-selected` | 40px | dimension |
| `size.cta` | 52px | dimension |
| `font-size.caption` | 13px | dimension |
| `font-size.sub` | 15px | dimension |
| `font-size.body` | 17px | dimension |
| `font-size.title` | 22px | dimension |
| `font-size.headline` | 28px | dimension |
| `font-size.display` | 40px | dimension |
| `font-weight.regular` | 400 | fontWeight |
| `font-weight.bold` | 700 | fontWeight |
| `font-weight.medium` | 500 | fontWeight |
| `line-height.body` | 1.5 | number |
| `line-height.tight` | 1.3 | number |
| `font-family.base` | Noto Sans KR, Apple SD Gothic Neo, sans-serif | fontFamily |

## 컴포넌트

- **AppBar**: fill=`color.surface`, height=`size.header`, text=`font-size.title`, textColor=`color.text`, divider=`color.border`, paddingX=`space.4`
- **BackButton**, 누를 수 있음: minSize=`size.touch`, color=`color.brand`, text=`font-size.body`
- **StationRow** (available, low, zero), 누를 수 있음: minSize=`size.touch`, height=`size.row`, paddingX=`space.4`, gap=`space.3`, name=`font-size.body`, nameColor=`color.text`, count=`font-size.title`, countWeight=`font-weight.bold`, countAvailable=`color.brand`, countZero=`color.zero`, rack=`color.text-muted`, divider=`color.border`, pressed=`color.brand-soft`, zeroFill=`color.zero-soft`, zeroBar=`color.zero`, zeroBarWidth=`size.zero-bar`, chevron=`color.text-muted`
- **ZeroTag**: text=`font-size.caption`, weight=`font-weight.bold`, color=`color.zero`, border=`color.zero`, radius=`radius.sm`, paddingX=`space.2`
- **SkeletonRow**: height=`size.row`, fill=`color.border`, radius=`radius.sm`, paddingX=`space.4`
- **StateMessage** (loading, empty, error): text=`font-size.body`, color=`color.text`, muted=`color.text-muted`, errorIcon=`color.zero`, gap=`space.4`, paddingY=`space.8`
- **Button** (primary), 누를 수 있음: minSize=`size.touch`, fill=`color.brand`, text=`color.on-brand`, fontSize=`font-size.body`, weight=`font-weight.bold`, radius=`radius.md`, paddingX=`space.6`
- **BikeCount** (available, zero): number=`font-size.display`, weight=`font-weight.bold`, available=`color.brand`, zero=`color.zero`, label=`font-size.body`, labelColor=`color.text`, lineHeight=`line-height.tight`
- **InfoRow**: label=`font-size.body`, labelColor=`color.text-muted`, value=`font-size.title`, valueColor=`color.text`, divider=`color.border`, paddingY=`space.4`
- **CoordText**: text=`font-size.caption`, color=`color.text-muted`, weight=`font-weight.regular`
- **SourceNote**: text=`font-size.caption`, color=`color.text-muted`, divider=`color.border`, paddingY=`space.4`
- **SummaryCard** (default, zero): fill=`color.surface-muted`, radius=`radius.lg`, height=`size.summary`, label=`font-size.caption`, value=`font-size.title`
- **LowTag**: fill=`color.low-soft`, text=`color.low`, radius=`radius.sm`
- **Freshness**: text=`font-size.caption`, color=`color.text-muted`
- **MapPin**, 누를 수 있음: minSize=`size.touch`
- **SearchBar**, 누를 수 있음: minSize=`size.touch`
- **ModeToggle**, 누를 수 있음: minSize=`size.touch`
- **MapButton**, 누를 수 있음: minSize=`size.touch`
- **SheetHandle**: 36×4
- **StaleBanner**: 새로고침 실패 안내 + 다시 시도
- **StatusBar**: 기기 상태 표시줄 자리
- **HomeIndicator**: 134×5 바, 하단 안전 영역 34
- **BigStat**: 한 화면 한 목표: 모드에 맞는 핵심 숫자 하나를 40으로
- **Legend**: 핀 색 범례 한 줄
- **BottomCTA**, 누를 수 있음: minSize=`size.touch`

## 기계 검사 결과

오류 0개, 경고 0개

## 사람 검토

아직 없음 (`design-harness review`)
