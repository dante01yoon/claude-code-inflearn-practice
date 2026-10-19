# 음량 기록 (final.mp4)

측정 도구: ffmpeg `ebur128=peak=true` (EBU R128 / ITU-R BS.1770, 통합 음량은 게이트 적용)

## 측정값

| 대상 | Integrated | LRA | True Peak |
|---|---|---|---|
| 원본 목소리 `out/cut-sub.mp4` (모노) | -18.9 LUFS | 11.7 LU | -0.4 dBTP |
| 같은 목소리를 스테레오(양쪽 동일)로 바꾼 뒤 | -15.9 LUFS | 11.7 LU | -0.4 dBTP |
| 음악 원본 처음 41.49초 | -19.8 LUFS | 7.6 LU | — |
| 섞은 직후 (음량 맞추기 전) | -15.9 LUFS | 22.2 LU | -0.3 dBTP |
| **최종 `out/final.mp4`** | **-14.0 LUFS** | 21.6 LU | **-2.0 dBTP** |

- 목표: -14 LUFS (유튜브 기준), True Peak -1 dBTP 이하 → 둘 다 충족
- 최종본 안의 음악만 따로 계산하면 약 -35.1 LUFS → 목소리보다 약 21 LU 작음
- LRA가 큰 건 말 사이 조용한 구간에 음악만 작게 깔려 있어서임(의도한 결과)

## 처리 내용

1. 목소리: 48 kHz로 맞추고 모노 → 스테레오(양쪽 같은 소리)
2. 음악 `music/gymnopedie-no1-kevin-macleod.mp3`: 처음부터 영상 길이(41.49초)만큼 자름, 볼륨 -18 dB 고정(덕킹 없음, 일정한 크기),
   0~3초 페이드인, 37.49~41.49초(마지막 4초) 페이드아웃
3. 두 소리를 더함(`amix normalize=0`, 각자 볼륨 그대로)
4. 전체 +2.7 dB, 리미터 상한 -2 dBFS (목소리 피크만 살짝 눌림)
5. 오디오 AAC 192 kbps 스테레오 48 kHz로 인코딩. 영상은 `cut-sub.mp4` 그대로 복사(재인코딩 없음, 자막 그대로)

## 저작권 표기 (CC BY 3.0, 업로드할 때 설명란에 필요)

Gymnopedie No. 1 — Erik Satie; arrangement and performance: Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 3.0 https://creativecommons.org/licenses/by/3.0/
