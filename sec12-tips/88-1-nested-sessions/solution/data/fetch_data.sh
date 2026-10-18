#!/bin/sh
# 세계은행(World Bank) 공개 데이터를 다시 받는다. 데이터 라이선스: CC BY 4.0 (https://datacatalog.worldbank.org/public-licenses)
# 실행: sh fetch_data.sh   (이 폴더 안에서)
set -e
curl -s "https://api.worldbank.org/v2/country/all/indicator/SP.POP.65UP.TO.ZS?format=json&date=1990:2023&per_page=20000" -o pop65.json
curl -s "https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN?format=json&date=1990:2023&per_page=20000" -o life-expectancy.json
curl -s "https://api.worldbank.org/v2/country?format=json&per_page=400" -o countries.json
echo "pop65.json life-expectancy.json countries.json 받음"
