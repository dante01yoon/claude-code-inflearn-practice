#!/bin/bash
# PreModelSwitch 훅: 모델을 바꾸기 전에 예상 비용을 보여 주고 한 번 더 확인한다.
# 가격: Anthropic API 정가 (USD / 100만 토큰, 2026-10 기준). 구독 요금제라면 실제 청구액이 아니라 사용량 비교용이다.

input=$(cat)
from=$(jq -r '.from_model // ""' <<<"$input")
to=$(jq -r '.to_model // ""' <<<"$input")
source=$(jq -r '.source // ""' <<<"$input")
tokens=$(jq -r '.context_tokens // 0' <<<"$input")
warm=$(jq -r '.prompt_cache_warm // false' <<<"$input")
switch_usd=$(jq -r '.estimated_cache_write_usd // 0' <<<"$input")

# 입력가 출력가 (USD/MTok)
price() {
  case "${1%%\[*}" in
    *fable-5-1*|*fable-5*|*mythos-5*) echo "10 50" ;;
    *opus-5-5*)   echo "4 20" ;;
    *opus-5*|*opus-4-8*|*opus-4-7*|*opus-4-6*) echo "5 25" ;;
    *sonnet-5-5*|*sonnet-5*) echo "2 10" ;;
    *sonnet-4-6*) echo "3 15" ;;
    *haiku-5-5*)  echo "0.10 0.50" ;;
    *haiku-4-5*)  echo "1 5" ;;
    *) echo "" ;;
  esac
}

# SDK 요청은 확인 창을 띄울 수 없어 "ask"가 거절로 처리되므로 안내만 하고 통과
if [ "$source" = "sdk" ] || [ "$from" = "$to" ]; then
  exit 0
fi

read -r fin fout <<<"$(price "$from")"
read -r tin tout <<<"$(price "$to")"

fmt_price() { [ -n "$1" ] && echo "입력 \$$1 / 출력 \$$2 (100만 토큰당)" || echo "가격 정보 없음"; }

msg="모델 변경: ${from:-?} → ${to:-?}
  지금 모델: $(fmt_price "$fin" "$fout")
  새 모델:   $(fmt_price "$tin" "$tout")"

if [ -n "$fin" ] && [ -n "$tin" ]; then
  ratio=$(awk -v a="$tin" -v b="$fin" 'BEGIN{ if (a >= b) printf "%.1f배", a/b; else printf "1/%.0f", b/a }')
  msg+="
  새 모델 단가는 지금의 약 ${ratio}입니다."
fi

if [ "$tokens" -gt 0 ]; then
  ktok=$(awk -v t="$tokens" 'BEGIN{printf "%.0f", t/1000}')
  usd=$(awk -v u="$switch_usd" 'BEGIN{printf "%.2f", u}')
  msg+="
  지금 대화 약 ${ktok}k 토큰을 새 모델로 다시 보내야 해서, 전환 비용이 약 \$${usd} 듭니다."
  [ "$warm" = "true" ] && msg+="
  (지금 캐시가 살아 있어 그대로 두면 더 싸게 이어갈 수 있습니다.)"
fi
msg+="
바꿀까요?"

jq -n --arg r "$msg" '{hookSpecificOutput:{hookEventName:"PreModelSwitch",permissionDecision:"ask",permissionDecisionReason:$r}}'
