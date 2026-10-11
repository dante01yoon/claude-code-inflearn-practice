"""상태 줄: 모델·생각 깊이·빠른 모드·세션 비용(추정)을 한 줄로.
입력: Claude Code가 넘겨주는 JSON (공식 문서 statusline)"""

import json
import sys

d = json.load(sys.stdin)
model = d.get("model", {}).get("display_name", "?")
effort = (d.get("effort") or {}).get("level", "-")
cost = (d.get("cost") or {}).get("total_cost_usd", 0) or 0
fast = " · ↯ 빠른 모드" if d.get("fast_mode") else ""
print(f"모델 {model} · 생각 깊이 {effort}{fast} · 이번 세션 ${cost:.2f}")
