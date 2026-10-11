#!/usr/bin/env python3
"""서울 열린데이터광장 Open API에서 데이터를 받아 CSV/JSON으로 저장한다.

사용법:
  python3 fetch.py <서비스명> [추가 인자 ...] [--out 경로] [--max N] [--format csv|json|both] [--force]

예:
  python3 fetch.py CardSubwayTime 202508
  python3 fetch.py RealtimeCityAir --format json
  python3 fetch.py TbPublicWifiInfo --max 3000

인증키 순서: --key > 환경변수 SEOUL_API_KEY > 현재 폴더 .env 의 SEOUL_API_KEY > sample(최대 5건)
인증키는 화면에 출력하지 않는다.
"""
import argparse
import csv
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://openapi.seoul.go.kr:8088"
PAGE = 1000  # API 한 번에 받을 수 있는 최대 건수
SAMPLE_MAX = 5


def load_key(cli_key):
    if cli_key:
        return cli_key
    if os.environ.get("SEOUL_API_KEY"):
        return os.environ["SEOUL_API_KEY"]
    if os.path.exists(".env"):
        with open(".env", encoding="utf-8") as f:
            for line in f:
                m = re.match(r"\s*(?:export\s+)?SEOUL_API_KEY\s*=\s*['\"]?([^'\"\s#]+)", line)
                if m:
                    return m.group(1)
    return "sample"


def request(key, service, start, end, params):
    parts = [key, "json", service, str(start), str(end)] + [urllib.parse.quote(p, safe="") for p in params]
    url = BASE + "/" + "/".join(urllib.parse.quote(p, safe="%") for p in parts)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                return r.read().decode("utf-8")
        except OSError as e:  # URLError, socket.timeout 포함
            if attempt == 2:
                sys.exit(f"[오류] 서버에 연결하지 못했습니다: {e}")
            time.sleep(2 * (attempt + 1))


def parse(text, service):
    """(rows, total, code, message) 를 돌려준다. 오류는 JSON 또는 XML로 올 수 있다."""
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        code = re.search(r"<CODE>(.*?)</CODE>", text, re.S)
        msg = re.search(r"<MESSAGE>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</MESSAGE>", text, re.S)
        return [], 0, code.group(1) if code else "UNKNOWN", (msg.group(1) if msg else text[:300]).strip()
    body = data.get(service)
    if body is None and len(data) == 1 and isinstance(next(iter(data.values())), dict) and "RESULT" not in data:
        body = next(iter(data.values()))  # 서비스명 대소문자가 다르게 온 경우
    if body is None:
        res = data.get("RESULT", {})
        return [], 0, res.get("CODE", "UNKNOWN"), res.get("MESSAGE", "")
    res = body.get("RESULT", {})
    return body.get("row", []), int(body.get("list_total_count", 0)), res.get("CODE", ""), res.get("MESSAGE", "")


HINTS = {
    "INFO-100": "인증키가 틀렸습니다. SEOUL_API_KEY 값을 확인하세요.",
    "INFO-200": "조건에 맞는 데이터가 없습니다. 날짜(아직 공개 전일 수 있음)나 추가 인자를 바꿔 보세요.",
    "ERROR-300": "필수 인자가 빠졌습니다. 데이터셋 페이지의 '요청인자'를 확인하고 추가 인자를 넣으세요.",
    "ERROR-310": "서비스명을 찾을 수 없습니다. 대소문자까지 정확히 확인하세요.",
    "ERROR-500": "서버 오류입니다. 서비스명이 틀렸을 때도 이 코드가 나옵니다.",
}


def main():
    ap = argparse.ArgumentParser(description="서울 열린데이터광장 Open API 받기")
    ap.add_argument("service", help="서비스명 (예: CardSubwayTime)")
    ap.add_argument("params", nargs="*", help="추가 요청인자 (순서대로, 예: 202508)")
    ap.add_argument("--key", help="인증키 (보통은 SEOUL_API_KEY 환경변수나 .env 사용)")
    ap.add_argument("--out", help="저장 경로(확장자 제외). 기본: data/seoul/<서비스명>[_인자]")
    ap.add_argument("--max", type=int, default=0, help="최대 건수 (0 = 전부)")
    ap.add_argument("--format", choices=["csv", "json", "both"], default="both")
    ap.add_argument("--force", action="store_true", help="같은 이름 파일이 있으면 덮어쓰기")
    a = ap.parse_args()

    key = load_key(a.key)
    is_sample = key == "sample"
    if is_sample:
        print("[알림] 인증키가 없어 sample 키로 최대 5건만 받습니다. (SEOUL_API_KEY 설정 필요)")

    limit = SAMPLE_MAX if is_sample else (a.max or None)
    if is_sample and a.max:
        limit = min(a.max, SAMPLE_MAX)

    stem = a.out or os.path.join("data", "seoul", "_".join([a.service] + [re.sub(r"[^\w가-힣-]", "-", p) for p in a.params]))
    exts = ["csv", "json"] if a.format == "both" else [a.format]
    targets = [f"{stem}.{e}" for e in exts]
    if not a.force:
        exist = [t for t in targets if os.path.exists(t)]
        if exist:
            sys.exit(f"[중지] 이미 있는 파일: {', '.join(exist)}  (덮어쓰려면 --force)")

    rows, total, start = [], None, 1
    while True:
        end = start + PAGE - 1
        if limit:
            end = min(end, limit)
        if total is not None:
            end = min(end, total)
        got, cnt, code, msg = parse(request(key, a.service, start, end, a.params), a.service)
        if code != "INFO-000":
            hint = HINTS.get(code, "")
            sys.exit(f"[오류] {code}: {msg}" + (f"\n  → {hint}" if hint else ""))
        total = cnt
        rows.extend(got)
        print(f"  {start}~{end} 받음 (누적 {len(rows)} / 전체 {total})", file=sys.stderr)
        if not got or len(rows) >= total or (limit and len(rows) >= limit):
            break
        start = end + 1
        time.sleep(0.2)

    os.makedirs(os.path.dirname(stem) or ".", exist_ok=True)
    cols = list(dict.fromkeys(k for r in rows for k in r))
    if "json" in exts:
        with open(f"{stem}.json", "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, indent=1)
    if "csv" in exts:
        with open(f"{stem}.csv", "w", encoding="utf-8-sig", newline="") as f:  # 엑셀에서 한글이 안 깨지게
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerows(rows)

    print(f"[완료] {a.service}: {len(rows)}건 저장 (전체 {total}건)")
    print(f"  파일: {', '.join(targets)}")
    print(f"  컬럼({len(cols)}): {', '.join(cols[:15])}{' …' if len(cols) > 15 else ''}")
    if rows:
        print("  첫 줄: " + json.dumps(rows[0], ensure_ascii=False)[:300])


if __name__ == "__main__":
    main()
