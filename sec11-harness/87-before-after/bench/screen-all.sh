#!/bin/zsh
# 화면 확인을 복사본마다 차례로: 서버(127.0.0.1:18961) → screen-check.mjs(한국과 다른 시간대 브라우저, 서울 09:20 고정, 여의도) → 서버 끔
# 사용: screen-all.sh  (results/before-after.json의 복사본 전부) → results/screen/<복사본>.png·.json, 판정은 merge-screen.mjs
B=${0:A:h}; mkdir -p $B/results/screen
for d in $(python3 -c "import json;[print(r['_']['dir']) for r in json.load(open('$B/results/before-after.json'))['rows']]"); do
  n=${d:t}
  (cd $d && PORT=18961 node server.mjs > /tmp/ba87-srv-$n.log 2>&1 &)
  for i in {1..20}; do curl -s -o /dev/null http://127.0.0.1:18961/subway.html && break; sleep 0.5; done
  (cd $B && hypit capture run screen-check.mjs -- http://127.0.0.1:18961/subway.html $B/results/screen/$n.png $B/results/screen/$n.json > $B/results/screen/$n.log 2>&1)
  pkill -f "node server.mjs" -U $UID -n 2>/dev/null; sleep 1
  for p in $(lsof -tiTCP:18961 -sTCP:LISTEN); do kill $p; done
  echo "$n $(python3 -c "import json;print(json.load(open('$B/results/screen/$n.json'))['card'].replace(chr(10),' | ')[:160])" 2>/dev/null)"
done
