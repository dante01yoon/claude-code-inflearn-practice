# 동료가 만든 브랜치(feat/quiet-hour)의 변경: 역 카드에 "가장 한가한 때" 줄 추가
p = "index.html"
s = open(p, encoding="utf-8").read()
s = s.replace(
    '  const peakOn = busiest("ON"), peakOff = busiest("OFF");\n',
    '  const peakOn = busiest("ON"), peakOff = busiest("OFF");\n'
    '  const total = (h) => row[`HR_${h}_GET_ON_NOPE`] + row[`HR_${h}_GET_OFF_NOPE`];\n'
    '  const quietest = HOURS.reduce((a, h) => (total(h) < total(a) ? h : a));\n',
)
s = s.replace(
    '      <dt>하차 최다</dt><dd>${hourName(peakOff)}</dd>\n',
    '      <dt>하차 최다</dt><dd>${hourName(peakOff)}</dd>\n'
    '      <dt>가장 한가한 때</dt><dd>${hourName(quietest)}</dd>\n',
)
open(p, "w", encoding="utf-8").write(s)
