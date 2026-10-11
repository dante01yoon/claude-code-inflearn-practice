# 섹션 1 · 모델·생각 깊이 고르기 (파일럿 P1)

영상: `output/p1-final.mp4` · 실습 폴더: `practice/start/`(시작) → `practice/solution/`(녹화 끝 상태)
녹화 환경: code-server(브라우저 속 VS Code, 127.0.0.1 전용) 내장 터미널, Claude Code v2.1.296, 2026-10-10

## 이번 수업에서 입력한 것 (그대로)

```text
claude
/model                         # 목록에서 ↓ 3번 → Sonnet 5.5 → s (이번 세션만)
/exit
claude --model opusplan        # 이 세션에만 opusplan
Shift+Tab                      # plan mode on (상태 줄 모델이 Opus 5.5로)
자기소개 카드 웹 페이지를 index.html 한 장으로 만들어 줘
→ "Claude has written up a plan … Would you like to proceed?" 1번(Yes) 선택 (실행은 Sonnet 5.5)
/effort                        # → 한 칸 오른쪽(high) → s (이번 세션만)
ultrathink 방금 만든 페이지에서 더 좋아질 점 세 가지만 짧게 알려 줘
/fast                          # 안내만 보고 Esc (켜지 않음: 사용량 크레딧 과금)
/exit
python3 effort_check.py
```

상태 줄 설정(`practice/start/.claude/settings.json` + `.claude/statusline.py`): 모델 · 생각 깊이 · 빠른 모드 · 이번 세션 비용(추정).

## 핵심 정리 (공식 문서 확인)

| 항목 | 내용 | 근거 |
|---|---|---|
| 별칭 | `opus`/`sonnet`/`haiku` → Anthropic API에서 Opus 5.5 / Sonnet 5.5 / Haiku 5.5. `best` = Fable을 쓸 수 있으면 Fable, 아니면 opus | [model-config#model-aliases](https://code.claude.com/docs/en/model-config) |
| 기본값 | Pro·Max·Team·Enterprise·API의 `default`는 Opus 5.5 (v2.1.280+) | model-config#default-model-setting |
| 저장 방식 | `/model 이름`·목록 Enter = 기본값 저장, 목록 `s` = 이번 세션만, `--model` = 그 세션만 | model-config#setting-your-model |
| opusplan | plan mode에서 opus, 실행 모드에서 sonnet. 목록에 행이 없어 이름으로 지정 | model-config#opusplan-model-setting |
| effort | low·medium·high·xhigh·max. Opus/Sonnet/Haiku 5.5 기본 medium. max는 이번 세션만, 과잉 사고 가능 → 먼저 시험 | model-config#adjust-effort-level |
| ultrathink | 그 턴에만 더 깊이(지시 추가), API effort 값은 그대로. "think hard"는 일반 글자로 전달 | model-config#use-ultrathink-for-one-off-deep-reasoning |
| /fast | 연구 미리보기, 같은 Opus를 최대 2.5배 빠르게, Opus 5.5 기준 $8/$40 per MTok, 구독은 사용량 크레딧으로만 | [fast-mode](https://code.claude.com/docs/en/fast-mode) |
| 모델 전환과 캐시 | 모델마다 캐시가 따로라 `/model` 전환 후 다음 요청은 전체 대화를 캐시 없이 다시 읽음 | [prompt-caching#switching-models](https://code.claude.com/docs/en/prompt-caching) |
| 상태 줄 | `statusLine` command에 JSON(model.display_name, effort.level, fast_mode, cost.total_cost_usd 등) 전달 | [statusline](https://code.claude.com/docs/en/statusline) |

화면에서 직접 확인한 것: 상태 줄 모델이 `opusplan` 시작 시 Sonnet 5.5 → plan mode에서 Opus 5.5 → 승인 후 실행에서 Sonnet 5.5. ultrathink 입력 시 "Deeper reasoning requested for this turn". /fast 대화창 "High-speed mode for Opus 5.5. Draws from usage credits at a higher rate… $8/$40 per Mtok".

## 📏 직접 재 보기 — effort_check.py

같은 퍼즐(정답: 수아, 철호, 태민, 민수, 지영)을 Opus 5.5에 effort 4단계 × 3번 = 12번 동시에 `claude -p --effort <단계> --safe-mode --output-format json`으로 실행. 값은 결과 JSON의 duration_ms 대신 스크립트 벽시계, `modelUsage.thinkingTokens`, `outputTokens`, `total_cost_usd`(공식 단가 추정치, 구독 청구액 아님).

| effort | 평균 시간 | 생각 토큰 | 출력 토큰 | 정답 | 비용(추정) |
|---|---|---|---|---|---|
| low | 6.9초 | 273 | 422 | 3/3 | $0.012 |
| medium | 4.9초 | 293 | 313 | 3/3 | $0.009 |
| high | 5.0초 | 288 | 308 | 3/3 | $0.009 |
| max | 14.4초 | 1,102 | 1,388 | 3/3 | $0.031 |

(화면 녹화 회차. 첫 녹화 시도 회차도 같은 경향: low 5.2초/294, medium 5.9초/307, high 6.9초/315, max 15.6초/1,015 — `practice/solution/effort_results.json`은 화면 회차)
해석: 쉬운 문제에서는 단계를 올려도 정답은 같고, max만 시간 약 3배·생각 토큰 약 4배. 평소 medium, 어려운 일에서만 올리기.

## 연습 과제
1. 상태 줄에 `context_window.used_percentage`를 추가해 보기 (정답: 아래).
2. `claude --model haiku`로 같은 자기소개 페이지를 만들어 결과 비교.

정답 1 — `statusline.py` 마지막 줄 앞에 `ctx = (d.get("context_window") or {}).get("used_percentage", 0)` 추가, print에 `· 컨텍스트 {ctx}%`.
