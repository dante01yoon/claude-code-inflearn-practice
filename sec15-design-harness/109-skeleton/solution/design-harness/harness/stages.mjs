// 단계 정의. 순서가 곧 진행 순서다.
// file: 산출물(마크다운), sections: 비어 있으면 안 되는 `## 제목`
// also: 해시(승인)에 함께 묶이는 추가 파일, extra: 추가 검사(오류 문자열 배열 반환)
// gate: 사람이 `npm run approve <단계>`로 승인해야 PASS

export const STAGES = [
  { id: 'prd', file: '01-prd.md', sections: ['문제', '목표', '사용자', '범위', '성공 지표'] },
  { id: 'research', file: '02-research.md', sections: ['질문', '방법', '발견', '시사점'] },
  { id: 'ia', file: '03-ia.md', sections: ['화면 목록', '내비게이션', '핵심 흐름'] },
  { id: 'wireframe', file: '04-wireframe.md', sections: ['화면별 구성', '상태'], gate: true },
  {
    id: 'system',
    file: '05-system.md',
    sections: ['원칙', '컴포넌트'],
    also: ['tokens.json'],
    extra: checkTokens,
    gate: true,
  },
  { id: 'figma', file: '06-figma.md', sections: ['파일', '프레임 목록'], extra: checkFigmaLink },
  { id: 'verify', file: '07-verify.md', sections: ['체크리스트', '이슈'], extra: checkChecklist, gate: true },
  { id: 'handoff', file: '08-handoff.md', sections: ['범위', '스펙', '남은 이슈'] },
];

// figma 단계(쓰기)에 들어가기 전에 PASS여야 하는 승인 단계
export const FIGMA_GATES = ['wireframe', 'system'];

function checkTokens({ read }) {
  const raw = read('tokens.json');
  if (raw == null) return ['파일 없음: tokens.json'];
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    return [`tokens.json 파싱 실패: ${e.message}`];
  }
  return ['color', 'typography', 'spacing']
    .filter((k) => !json[k] || typeof json[k] !== 'object' || Object.keys(json[k]).length === 0)
    .map((k) => `tokens.json에 ${k} 값 없음`);
}

function checkFigmaLink({ sections }) {
  return /https:\/\/(www\.)?figma\.com\/(design|file|board)\//.test(sections['파일'] ?? '')
    ? []
    : ['"파일" 섹션에 figma.com 링크 없음'];
}

function checkChecklist({ sections }) {
  const body = sections['체크리스트'] ?? '';
  const done = (body.match(/^\s*- \[x\]/gim) ?? []).length;
  const open = (body.match(/^\s*- \[ \]/gm) ?? []).length;
  if (open > 0) return [`체크리스트 미완료 ${open}개`];
  if (done === 0) return ['체크리스트 항목 없음'];
  return [];
}
