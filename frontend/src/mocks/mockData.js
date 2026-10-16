// Mock pod-inspection data used when VITE_USE_MOCK=true.
// Shapes match CLAUDE.md section 11 (the future API). Field names are camelCase.
// Sample data only: not real LKM records. Disease texts are DEMO until LKM verifies them.
import { toIsoDate } from '../utils/format';
import { isAiUnsure } from '../utils/inspectionRules';
import { summarisePods } from '../utils/severity';

// ---------- Farms, blocks, trees ----------

export const farms = [
  {
    id: 'F-01',
    name: 'LKM Tawau Station',
    blocks: [
      { id: 'BLK-A', name: 'Block A' },
      { id: 'BLK-B', name: 'Block B' },
      { id: 'BLK-C', name: 'Block C' },
      { id: 'BLK-D', name: 'Block D' },
      { id: 'BLK-E', name: 'Block E' },
    ],
  },
];

// Tree code = block letter + number, e.g. "A-01". id is the database id.
// Every registered tree, inspected or not, so block screens can show "X of Y trees inspected".
// Block E has trees but no inspections yet (shows "Not inspected").
function treeCodes(letter, count) {
  return Array.from(
    { length: count },
    (_, index) => `${letter}-${String(index + 1).padStart(2, '0')}`
  );
}

const TREE_CODES = {
  'BLK-A': treeCodes('A', 8),
  'BLK-B': treeCodes('B', 6),
  'BLK-C': treeCodes('C', 7),
  'BLK-D': treeCodes('D', 9),
  'BLK-E': treeCodes('E', 5),
};

export const trees = Object.entries(TREE_CODES).flatMap(([blockId, codes]) =>
  codes.map((code) => ({ id: `T-${code}`, code, blockId }))
);

// ---------- Diseases (the disease table; the recommended action comes from here, never from AI) ----------

export const diseases = [
  {
    code: 'healthy',
    nameEn: 'Healthy',
    nameMs: '[to verify]',
    cause: 'No disease visible on the pod surface.',
    looks:
      'Even colour for its ripeness stage (green, yellow or red-orange); no dark spreading patches or rot.',
    action: 'No action needed. Continue routine monitoring.',
    source: 'DEMO',
  },
  {
    code: 'black_pod',
    nameEn: 'Black pod rot',
    nameMs: 'Reput buah hitam [to verify]',
    cause: 'Phytophthora, a fungus-like organism. Spreads more in wet, humid conditions.',
    looks:
      'Brown to black patch that spreads across the pod; white powdery growth may appear on older patches.',
    action:
      'Remove and dispose of infected pods away from the trees; monitor nearby trees; consult an LKM officer.',
    source: 'DEMO',
  },
  {
    // Placeholder until the final AI dataset and the LKM field trip decide the real list.
    code: 'other',
    nameEn: 'Other / unknown condition',
    nameMs: '[to verify]',
    cause: 'A condition the AI was not trained on, or not sure about.',
    looks: 'Damage or discolouration that does not match the conditions above.',
    action: 'Take a clear photo and ask an LKM officer to check the tree.',
    source: 'DEMO',
  },
];

// ---------- Officers ----------

const AINA = { id: 'U-001', name: 'Aina' };
const HAFIZ = { id: 'U-003', name: 'Hafiz' };

// ---------- Inspections ----------

// pod('P-1', 'black_pod', 0.52, 'healthy') = AI said black pod (52%), officer changed it to healthy.
// Not analysed yet: pod('P-1') -> no AI label, no final label.
// reviewed: same rule as analyseInspection (confident = true, "AI unsure" or not analysed = false).
// inspection() below sets it to true for every pod of a completed inspection.
function pod(id, aiLabel = null, aiConfidence = null, finalLabel = aiLabel, excluded = false) {
  return {
    id,
    photoUrl: null, // mock: the UI shows a coloured placeholder instead of a photo
    aiLabel,
    aiConfidence,
    finalLabel,
    excluded,
    changedByOfficer: aiLabel !== null && finalLabel !== aiLabel,
    reviewed: aiLabel !== null && !isAiUnsure({ aiConfidence }),
  };
}

function findBlock(blockId) {
  return farms[0].blocks.find((block) => block.id === blockId);
}

// Builds a full inspection. The summary is calculated with summarisePods, never typed by hand.
// A draft that has not been analysed yet has summary: null.
// `previous` is filled in by inspectionService (it depends on the other inspections).
function inspection({
  id,
  status,
  treeCode,
  visitDate,
  notes = '',
  officer,
  pods: podList,
  createdAt,
}) {
  // A completed inspection was fully reviewed before it was confirmed.
  const pods =
    status === 'completed' ? podList.map((item) => ({ ...item, reviewed: true })) : podList;
  const tree = trees.find((item) => item.code === treeCode);
  const block = findBlock(tree.blockId);
  const isAnalysed = pods.some((item) => item.aiLabel);

  return {
    id,
    status,
    farm: { id: farms[0].id, name: farms[0].name },
    block: { id: block.id, name: block.name },
    tree: { id: tree.id, code: tree.code, isNew: false },
    visitDate,
    notes,
    officer,
    pods,
    summary: isAnalysed ? summarisePods(pods) : null,
    previous: null,
    createdAt,
    confirmedAt: status === 'completed' ? createdAt.replace(/T\d\d/, 'T11') : null,
  };
}

// Mock dates are relative to today, so the demo always looks recent (CLAUDE.md section 11).
// daysAgo(0) -> today, daysAgo(3) -> 3 days ago, as a local "yyyy-mm-dd".
function daysAgo(n) {
  const today = new Date();
  return toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - n));
}

export const inspections = [
  // Draft, already analysed: 3 confident pods + 2 "AI unsure" pods (reviewed: false) that the
  // officer must check on the Review step (O4). Home -> Drafts -> A-02 opens Review.
  inspection({
    id: 'INS-0013',
    status: 'draft',
    treeCode: 'A-02',
    visitDate: daysAgo(0),
    officer: AINA,
    createdAt: `${daysAgo(0)}T08:45:00+08:00`,
    pods: [
      pod('P-0013-1', 'healthy', 0.95),
      pod('P-0013-2', 'black_pod', 0.9),
      pod('P-0013-3', 'healthy', 0.91),
      pod('P-0013-4', 'black_pod', 0.52),
      pod('P-0013-5', 'healthy', 0.48),
    ],
  }),
  // The CLAUDE.md example: 5 photos, Pod 4 changed by the officer, Pod 5 excluded -> 25% Medium.
  inspection({
    id: 'INS-0012',
    status: 'completed',
    treeCode: 'A-01',
    visitDate: daysAgo(3),
    notes: 'Some pods dark near the stalk.',
    officer: AINA,
    createdAt: `${daysAgo(3)}T09:10:00+08:00`,
    pods: [
      pod('P-0012-1', 'healthy', 0.95),
      pod('P-0012-2', 'black_pod', 0.9),
      pod('P-0012-3', 'healthy', 0.91),
      pod('P-0012-4', 'black_pod', 0.52, 'healthy'),
      pod('P-0012-5', 'healthy', 0.48, 'healthy', true),
    ],
  }),
  inspection({
    id: 'INS-0011',
    status: 'completed',
    treeCode: 'A-03',
    visitDate: daysAgo(3),
    officer: AINA,
    createdAt: `${daysAgo(3)}T09:40:00+08:00`,
    pods: [
      pod('P-0011-1', 'healthy', 0.97),
      pod('P-0011-2', 'healthy', 0.93),
      pod('P-0011-3', 'healthy', 0.89),
      pod('P-0011-4', 'healthy', 0.94),
      pod('P-0011-5', 'healthy', 0.9),
    ],
  }),
  inspection({
    id: 'INS-0010',
    status: 'completed',
    treeCode: 'C-04',
    visitDate: daysAgo(5),
    notes: 'Wet week. Several pods rotting on the lower branches.',
    officer: HAFIZ,
    createdAt: `${daysAgo(5)}T10:05:00+08:00`,
    pods: [
      pod('P-0010-1', 'black_pod', 0.93),
      pod('P-0010-2', 'black_pod', 0.88),
      pod('P-0010-3', 'healthy', 0.91),
      pod('P-0010-4', 'black_pod', 0.86),
      pod('P-0010-5', 'healthy', 0.9),
    ],
  }),
  // Hafiz, same visit as C-04: 3 of 6 pods infected -> 50% High.
  inspection({
    id: 'INS-0014',
    status: 'completed',
    treeCode: 'C-02',
    visitDate: daysAgo(5),
    officer: HAFIZ,
    createdAt: `${daysAgo(5)}T09:30:00+08:00`,
    pods: [
      pod('P-0014-1', 'black_pod', 0.92),
      pod('P-0014-2', 'healthy', 0.9),
      pod('P-0014-3', 'black_pod', 0.85),
      pod('P-0014-4', 'healthy', 0.93),
      pod('P-0014-5', 'black_pod', 0.81),
      pod('P-0014-6', 'healthy', 0.88),
    ],
  }),
  inspection({
    id: 'INS-0009',
    status: 'completed',
    treeCode: 'B-05',
    visitDate: daysAgo(6),
    officer: HAFIZ,
    createdAt: `${daysAgo(6)}T15:20:00+08:00`,
    pods: [
      pod('P-0009-1', 'healthy', 0.92),
      pod('P-0009-2', 'healthy', 0.9),
      pod('P-0009-3', 'healthy', 0.95),
      pod('P-0009-4', 'healthy', 0.88),
    ],
  }),
  // Hafiz: 1 of 6 pods infected -> 17% Low, so Block D shows Low on the block tiles.
  inspection({
    id: 'INS-0016',
    status: 'completed',
    treeCode: 'D-05',
    visitDate: daysAgo(7),
    notes: 'One small dark patch on a lower pod.',
    officer: HAFIZ,
    createdAt: `${daysAgo(7)}T10:20:00+08:00`,
    pods: [
      pod('P-0016-1', 'healthy', 0.93),
      pod('P-0016-2', 'healthy', 0.91),
      pod('P-0016-3', 'black_pod', 0.88),
      pod('P-0016-4', 'healthy', 0.94),
      pod('P-0016-5', 'healthy', 0.9),
      pod('P-0016-6', 'healthy', 0.92),
    ],
  }),
  // Draft: 3 photos added in the field, not analysed yet (no signal).
  inspection({
    id: 'INS-0008',
    status: 'draft',
    treeCode: 'D-03',
    visitDate: daysAgo(7),
    officer: AINA,
    createdAt: `${daysAgo(7)}T14:30:00+08:00`,
    pods: [pod('P-0008-1'), pod('P-0008-2'), pod('P-0008-3')],
  }),
  inspection({
    id: 'INS-0007',
    status: 'completed',
    treeCode: 'C-07',
    visitDate: daysAgo(9),
    officer: AINA,
    createdAt: `${daysAgo(9)}T10:15:00+08:00`,
    pods: [
      pod('P-0007-1', 'black_pod', 0.91),
      pod('P-0007-2', 'healthy', 0.94),
      pod('P-0007-3', 'healthy', 0.66, 'black_pod'),
      pod('P-0007-4', 'healthy', 0.92),
      pod('P-0007-5', 'healthy', 0.9),
      pod('P-0007-6', 'healthy', 0.87),
    ],
  }),
  // Hafiz: 2 of 5 pods infected -> 40% Medium.
  inspection({
    id: 'INS-0015',
    status: 'completed',
    treeCode: 'A-04',
    visitDate: daysAgo(10),
    officer: HAFIZ,
    createdAt: `${daysAgo(10)}T10:40:00+08:00`,
    pods: [
      pod('P-0015-1', 'healthy', 0.94),
      pod('P-0015-2', 'black_pod', 0.89),
      pod('P-0015-3', 'healthy', 0.91),
      pod('P-0015-4', 'black_pod', 0.84),
      pod('P-0015-5', 'healthy', 0.9),
    ],
  }),
  inspection({
    id: 'INS-0006',
    status: 'completed',
    treeCode: 'A-05',
    visitDate: daysAgo(12),
    officer: AINA,
    createdAt: `${daysAgo(12)}T09:00:00+08:00`,
    pods: [
      pod('P-0006-1', 'healthy', 0.96),
      pod('P-0006-2', 'healthy', 0.93),
      pod('P-0006-3', 'healthy', 0.9),
      pod('P-0006-4', 'healthy', 0.91),
    ],
  }),
  inspection({
    id: 'INS-0005',
    status: 'completed',
    treeCode: 'A-06',
    visitDate: daysAgo(12),
    officer: AINA,
    createdAt: `${daysAgo(12)}T09:35:00+08:00`,
    pods: [
      pod('P-0005-1', 'healthy', 0.94),
      pod('P-0005-2', 'black_pod', 0.84),
      pod('P-0005-3', 'healthy', 0.92),
      pod('P-0005-4', 'healthy', 0.9),
      pod('P-0005-5', 'healthy', 0.89),
      pod('P-0005-6', 'healthy', 0.93),
    ],
  }),
  // Earlier visit to A-01, so the A-01 report can show "Previous inspection: <date> · None (0%)".
  inspection({
    id: 'INS-0001',
    status: 'completed',
    treeCode: 'A-01',
    visitDate: daysAgo(33),
    officer: AINA,
    createdAt: `${daysAgo(33)}T09:20:00+08:00`,
    pods: [
      pod('P-0001-1', 'healthy', 0.93),
      pod('P-0001-2', 'healthy', 0.91),
      pod('P-0001-3', 'healthy', 0.95),
      pod('P-0001-4', 'healthy', 0.9),
      pod('P-0001-5', 'healthy', 0.92),
    ],
  }),
  // First visit to A-01 (Hafiz): 1 of 6 pods infected -> 17% Low. With INS-0001 and INS-0012 this
  // gives the A-01 tree history 3 bars: Low (62 days ago), None (33 days ago), Medium (3 days ago).
  inspection({
    id: 'INS-0017',
    status: 'completed',
    treeCode: 'A-01',
    visitDate: daysAgo(62),
    officer: HAFIZ,
    createdAt: `${daysAgo(62)}T10:00:00+08:00`,
    pods: [
      pod('P-0017-1', 'healthy', 0.94),
      pod('P-0017-2', 'healthy', 0.9),
      pod('P-0017-3', 'black_pod', 0.87),
      pod('P-0017-4', 'healthy', 0.92),
      pod('P-0017-5', 'healthy', 0.89),
      pod('P-0017-6', 'healthy', 0.93),
    ],
  }),
];
