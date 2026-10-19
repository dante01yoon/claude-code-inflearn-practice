# 음량 측정 기록 — out/final.mp4

측정 도구: ffmpeg `ebur128` 필터(EBU R128 / ITU-R BS.1770, `peak=true`로 True Peak 측정)
목표: 유튜브 기준 **-14 LUFS**, True Peak -1 dBTP 근처

## 최종 결과 (out/final.mp4)

| 항목 | 값 |
|---|---|
| Integrated loudness | **-14.0 LUFS** |
| True Peak | -1.2 dBTP |
| Loudness Range (LRA) | 17.3 LU |
| 오디오 | AAC 192 kbps, 48 kHz, 스테레오 |
| 길이 | 33.2초 (영상 길이와 같음) |

## 재료 측정값

| 재료 | Integrated | True Peak | 비고 |
|---|---|---|---|
| out/cut-sub.mp4 목소리 (모노) | -18.8 LUFS | -0.5 dBTP | LRA 11.2 LU |
| 같은 목소리를 스테레오로 펼침 | -15.8 LUFS | — | 양쪽 채널에 복사(+3 LU) |
| music/gymnopedie-no1-kevin-macleod.mp3 전체 | -20.0 LUFS | -0.1 dBTP | 187.1초 |
| 같은 곡 앞 33.22초 (사용 구간) | -19.7 LUFS | — | |

## 처리 과정

1. 목소리: 모노 → 스테레오(양쪽 같은 소리), 48 kHz.
2. 음악: 곡 앞부분 33.22초를 잘라서 **-14.1 dB를 고정으로 적용**(덕킹이나 자동 음량 조절 없이 일정한 크기).
   목소리(스테레오 -15.8 LUFS)보다 약 **18 LU 작은 -33.8 LUFS**로 맞춘 값입니다.
3. 페이드: 시작 0–3초 서서히 커짐, 끝 29.22–33.22초(4초) 서서히 작아짐.
4. 두 소리를 섞음(합친 뒤 자동으로 줄이지 않음): 이때 -16.2 LUFS, True Peak -0.36 dBTP.
5. +3.1 dB 올리고 4배 오버샘플링한 리미터(-1.3 dB 상한)로 피크를 눌러서 -14.0 LUFS / -1.2 dBTP로 만듦.
   (그냥 +2.2 dB만 올리면 피크가 +1.9 dBTP까지 올라가 찌그러지기 때문에 리미터를 씀.
   리미터가 큰 피크를 누르면서 음량이 조금 줄어서 3.1 dB로 다시 맞춤.)
6. 영상은 다시 인코딩하지 않고 그대로 복사(자막이 입혀진 화면 그대로).

## 최종 게인 기준으로 본 목소리 : 음악

| | 음량 |
|---|---|
| 목소리 (리미터 전) | 약 -12.7 LUFS |
| 음악 (페이드 뒤 일정한 구간 3–29.22초) | 약 -30.6 LUFS |
| 차이 | 약 18 LU |

## 저작자 표시 (CC BY 3.0, 설명란에 넣을 문구)

Gymnopedie No. 1 — Erik Satie; arrangement and performance: Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 3.0 — https://creativecommons.org/licenses/by/3.0/
