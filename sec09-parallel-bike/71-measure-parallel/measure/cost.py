"""대화 기록(jsonl)의 토큰 사용량을 API 정가로 환산 (2026-10-12 platform.claude.com/docs/en/about-claude/pricing).
사용: python3 cost.py <jsonl 또는 폴더>... — 하위 에이전트·팀원 기록(subagents/ 등)까지 모두 더한다. 같은 메시지 id는 한 번만 센다."""
import glob, json, os, sys
PRICE = {  # $/MTok: input, cache write 5m, cache write 1h, cache read, output
    "opus": (4, 5, 8, 0.20, 20), "sonnet": (2, 2.5, 4, 0.10, 10), "haiku": (0.10, 0.125, 0.20, 0.01, 0.50)}
def fam(m):
    for k in PRICE:
        if k in (m or ""): return k
    return None
files = []
for a in sys.argv[1:]:
    files += [a] if a.endswith(".jsonl") else glob.glob(os.path.join(a, "**", "*.jsonl"), recursive=True)
seen, tot, by = set(), 0.0, {}
tok = {"in": 0, "cw": 0, "cr": 0, "out": 0}
for f in files:
    for l in open(f):
        try: d = json.loads(l)
        except Exception: continue
        m = d.get("message") or {}
        u = m.get("usage"); mid = m.get("id")
        if not u or not mid or (mid, d.get("requestId")) in seen: continue
        seen.add((mid, d.get("requestId")))
        fm = fam(m.get("model"))
        if not fm: continue
        p = PRICE[fm]
        cc = u.get("cache_creation") or {}
        w5 = cc.get("ephemeral_5m_input_tokens", u.get("cache_creation_input_tokens", 0) if not cc else 0)
        w1 = cc.get("ephemeral_1h_input_tokens", 0)
        c = (u.get("input_tokens", 0) * p[0] + w5 * p[1] + w1 * p[2] + u.get("cache_read_input_tokens", 0) * p[3] + u.get("output_tokens", 0) * p[4]) / 1e6
        tot += c; by[m.get("model")] = by.get(m.get("model"), 0) + c
        tok["in"] += u.get("input_tokens", 0); tok["cw"] += w5 + w1; tok["cr"] += u.get("cache_read_input_tokens", 0); tok["out"] += u.get("output_tokens", 0)
print(json.dumps({"files": len(files), "messages": len(seen), "usd": round(tot, 3), "by_model": {k: round(v, 3) for k, v in by.items()}, "tokens": tok}, ensure_ascii=False))
