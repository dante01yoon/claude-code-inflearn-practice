# 디자인 하네스

단계: prd → research → ia → wireframe → system → figma → verify → handoff
산출물 파일명·필수 섹션: `harness/stages.mjs`. 산출물은 `work/<프로젝트>/`에만 쓴다.

- 작업 전후로 `npm run check`. 앞 단계가 PASS가 아니면 다음 단계로 가지 않는다.
- wireframe·system·verify는 사람이 승인한다. `npm run approve`는 실행하지 않는다. WAIT이면 멈추고 승인을 요청한다.
- 피그마 쓰기는 wireframe·system 승인 뒤에만 한다(훅이 막음). 승인 뒤 산출물을 고치면 재승인이 필요하다.
