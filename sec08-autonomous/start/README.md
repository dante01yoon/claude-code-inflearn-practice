# 섹션 8 시작 상태

섹션 8은 섹션 6이 끝난 서울 라이브 3D에서 시작합니다.

```bash
git clone https://github.com/dante01yoon/seoul-live-3d.git
cd seoul-live-3d
git checkout -b sec08-auto 7bc358e   # 섹션 6 끝(main 병합 커밋)
npm test                            # 73개 통과
```

- 녹화는 Claude Code 2.1.296, auto 권한 모드(섹션 1)로 진행했습니다. `/goal`·백그라운드 세션은 auto 모드와 함께 쓰면 도구마다 멈추지 않습니다.
- You should know는 빌트인 mod라 설치 없이 `/plugin enable cc-plugin-you-should-know@builtin`으로 켭니다(기본 꺼짐).
- agent view(`claude --bg`, `claude agents`, `/fork`, `/bg`)는 research preview입니다(2026-10 기준). 세션마다 구독 사용량을 따로 씁니다.
- dynamic workflows(`ultracode`)는 서브에이전트를 여럿 돌려 토큰을 많이 씁니다(64강 점검 한 번 약 92만 토큰).
- Remote Control은 claude.ai 구독 로그인(Pro·Max·Team·Enterprise)이 필요합니다. 세션 주소와 QR은 남에게 보이지 마세요.
- 섹션 8이 끝난 상태: 브랜치 `sec08-auto`(`3c0e836`), main 병합 `800c2eb`.
