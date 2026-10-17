#!/bin/bash
# 상태 줄: 모델 이름 | 컨텍스트 사용량 막대 | 세션 비용
input=$(cat)
model=$(echo "$input" | jq -r '.model.display_name // "?"')
pct=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | awk '{printf "%d", $1}')
cost=$(echo "$input" | jq -r '.cost.total_cost_usd // empty')

width=10
filled=$((pct * width / 100))
[ "$filled" -gt "$width" ] && filled=$width
bar=""
for ((i = 0; i < width; i++)); do
  if [ "$i" -lt "$filled" ]; then bar="${bar}█"; else bar="${bar}░"; fi
done

if [ -n "$cost" ]; then
  cost_text=$(printf '$%.2f' "$cost")
else
  cost_text='비용 정보 없음'
fi

printf '%s | %s %d%% | %s' "$model" "$bar" "$pct" "$cost_text"
