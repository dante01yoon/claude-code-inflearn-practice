#!/bin/sh
# main 커밋을 만들고, 동료가 만든 것처럼 feat/quiet-hour 브랜치에 "가장 한가한 때" 커밋을 하나 올린다.
set -e
git init -q -b main
git add -A && git commit -qm "CLAUDE.md 규칙과 역별 요약 카드"
git checkout -q -b feat/quiet-hour
python3 quiet-hour.py && rm quiet-hour.py make-teammate-branch.sh
git add -A && git -c user.name=teammate -c user.email=teammate@example.com commit -qm "역 카드에 가장 한가한 시간 표시"
git log --oneline --all --graph
