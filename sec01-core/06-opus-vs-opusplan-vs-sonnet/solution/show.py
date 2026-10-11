"""한 갈래의 측정 결과를 자세히 본다: 단계별 모델, 모델별 출력 토큰·비용, 계획 앞부분.
사용: python3 show.py <opus|opusplan|sonnet> [회차]"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
model, rep = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 1
r = next(x for x in json.load(open(os.path.join(HERE, "results.json"))) if x["model"] == model and x["rep"] == rep)
print(f"\n▶ {model} {rep}회차 — {r['wall_s']:.0f}초 · ${r['cost_usd']:.2f}")
print(f"  계획 단계 모델: {', '.join(r['plan_models'])}")
for m, v in r["models"].items():
    print(f"  {m:<18} 출력 토큰 {v['out']:>6,} · 비용 ${v['cost']:.3f}")
print("\n  계획 앞부분:")
for line in [ln for ln in r["plan_result"].splitlines() if ln.strip() and ".claude/plans" not in ln][:7]:
    print("   " + line[:90])
