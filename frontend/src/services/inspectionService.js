// Pod inspections: everything pages need to read or change inspections, farms, trees and diseases.
// Pages call these functions; they never call axios or the mocks directly.
//
// Mock mode (VITE_USE_MOCK=true): data comes from mocks/mockData.js and is kept in memory, so
// changes (new drafts, photos, labels) last until the page is refreshed.
// Real mode: calls the draft FastAPI endpoints from CLAUDE.md section 11.
// Both modes return the same shapes (CLAUDE.md section 11).
//
// Officers only see their own inspections. In mock mode we copy that rule here;
// in real mode the backend enforces it (403). Hiding buttons is not security.
import apiClient, { USE_MOCK, mockDelay } from './apiClient';
import { getStoredUser } from './authService';
import { diseases, farms, inspections, trees } from '../mocks/mockData';
import { mockUsers } from '../mocks/mockUsers';
import { reportPathFor } from '../utils/inspectionRoutes';
import { MAX_POD_PHOTOS, isAiUnsure } from '../utils/inspectionRules';
import { getLatestCompletedByTree, matchesTreeStatus, summariseBlock } from '../utils/blockSummary';
import { summarisePods } from '../utils/severity';

// ---------- Mock helpers ----------

// Our own copy of the mock data, so changes never touch mocks/mockData.js.
const store = {
  inspections: structuredClone(inspections),
  trees: structuredClone(trees),
};

// Copy before returning, so screens cannot accidentally change the stored data.
function copy(value) {
  return structuredClone(value);
}

function mockError(message, status) {
  const error = new Error(message);
  error.userMessage = message;
  error.response = { status };
  return error;
}

function currentUser() {
  return getStoredUser();
}

function canSee(user, inspection) {
  return user?.role === 'admin' || inspection.officer.id === user?.id;
}

// Newest first: by visit date, then by when it was created.
function compareNewestFirst(a, b) {
  return (
    b.visitDate.localeCompare(a.visitDate) || (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
  );
}

// The latest completed inspection of the same tree before this one, or null.
function findPrevious(inspection) {
  const earlier = store.inspections
    .filter(
      (item) =>
        item.id !== inspection.id &&
        item.status === 'completed' &&
        item.tree.id === inspection.tree.id &&
        compareNewestFirst(item, inspection) > 0
    )
    .sort(compareNewestFirst)[0];

  if (!earlier) return null;
  return {
    visitDate: earlier.visitDate,
    severity: earlier.summary.severity,
    percentInfected: earlier.summary.percentInfected,
  };
}

// What we send back: a copy with `previous` filled in.
function toResponse(inspection) {
  return { ...copy(inspection), previous: findPrevious(inspection) };
}

// Recalculate the summary after pods change. Not analysed yet -> null.
function refreshSummary(inspection) {
  const isAnalysed = inspection.pods.some((pod) => pod.aiLabel);
  inspection.summary = isAnalysed ? summarisePods(inspection.pods) : null;
}

// Finds an inspection the logged-in user may see, or throws "not found" / "no access".
function findVisible(id) {
  const inspection = store.inspections.find((item) => item.id === id);
  if (!inspection) {
    throw mockError('Inspection not found.', 404);
  }
  if (!canSee(currentUser(), inspection)) {
    throw mockError('You can only open your own inspections.', 403);
  }
  return inspection;
}

// Like findVisible, but also checks the inspection is still a draft (completed = locked).
function findEditable(id) {
  const inspection = findVisible(id);
  if (inspection.status !== 'draft') {
    throw mockError('This inspection is completed and locked.', 409);
  }
  return inspection;
}

function findBlock(blockId) {
  for (const farm of farms) {
    const block = farm.blocks.find((item) => item.id === blockId);
    if (block) return { farm, block };
  }
  return null;
}

// "a-1 " -> "A-1". Tree codes are stored in capitals.
function normaliseTreeCode(code = '') {
  return code.trim().toUpperCase();
}

function nextInspectionId() {
  const highest = Math.max(0, ...store.inspections.map((item) => Number(item.id.split('-')[1])));
  return `INS-${String(highest + 1).padStart(4, '0')}`;
}

// The latest completed inspection per tree (used by the tree lookup and block screens).
function latestCompletedByTree() {
  return getLatestCompletedByTree(store.inspections);
}

// One block's trees + totals, calculated by utils/blockSummary.js (the DEMO block rules).
function blockResponse(farm, block, latest) {
  const blockTrees = store.trees.filter((tree) => tree.blockId === block.id);
  return {
    block: { id: block.id, name: block.name },
    farm: { id: farm.id, name: farm.name },
    ...summariseBlock(blockTrees, latest),
  };
}

// DEMO AI: the same pod position always gets the same label, so demos are repeatable.
// Positions 2, 5 and 9 are below 0.70 so the "AI unsure, please check" flow can be shown.
const MOCK_AI_RESULTS = [
  ['healthy', 0.94],
  ['black_pod', 0.58],
  ['healthy', 0.91],
  ['black_pod', 0.87],
  ['healthy', 0.64],
  ['healthy', 0.92],
  ['black_pod', 0.9],
  ['healthy', 0.89],
  ['healthy', 0.67],
  ['black_pod', 0.83],
];

// ---------- Inspections ----------

// Does the search text match the tree code, block name or officer name? Empty search = yes.
function matchesSearch(inspection, search) {
  if (!search) return true;
  return [inspection.tree.code, inspection.block.name, inspection.officer.name].some((text) =>
    text?.toLowerCase().includes(search)
  );
}

// filters (all optional):
// { status: 'draft' | 'completed', q: tree code / block / officer text,
//   from: 'yyyy-mm-dd', to: 'yyyy-mm-dd', officerId, blockId, farmId }
// Officers get only their own inspections; supervisors get all. Newest first.
export async function listInspections({ status, q, from, to, officerId, blockId, farmId } = {}) {
  if (USE_MOCK) {
    await mockDelay();
    const user = currentUser();
    const search = q?.trim().toLowerCase();
    const items = store.inspections
      .filter((item) => canSee(user, item))
      .filter((item) => !status || item.status === status)
      .filter((item) => matchesSearch(item, search))
      .filter((item) => !from || item.visitDate >= from)
      .filter((item) => !to || item.visitDate <= to)
      .filter((item) => !officerId || item.officer.id === officerId)
      .filter((item) => !blockId || item.block.id === blockId)
      .filter((item) => !farmId || item.farm.id === farmId)
      .sort(compareNewestFirst);
    return items.map(toResponse);
  }
  const response = await apiClient.get('/inspections', {
    params: { status, q, from, to, officerId, blockId, farmId },
  });
  return response.data;
}

export async function getInspection(id) {
  if (USE_MOCK) {
    await mockDelay();
    return toResponse(findVisible(id));
  }
  const response = await apiClient.get(`/inspections/${id}`);
  return response.data;
}

// Step 1 of the wizard. Finds the tree by code in the block, or creates it (tree.isNew = true).
// Returns the new draft inspection.
export async function createInspection({ blockId, treeCode, visitDate, notes = '' }) {
  if (USE_MOCK) {
    await mockDelay();
    const user = currentUser();
    const found = findBlock(blockId);
    const code = normaliseTreeCode(treeCode);
    if (!found) throw mockError('Block not found.', 404);
    if (!code) throw mockError('Tree code is required.', 422);

    let tree = store.trees.find((item) => item.blockId === blockId && item.code === code);
    const isNew = !tree;
    if (isNew) {
      tree = { id: `T-${code}`, code, blockId };
      store.trees.push(tree);
    }

    const now = new Date().toISOString();
    const inspection = {
      id: nextInspectionId(),
      status: 'draft',
      farm: { id: found.farm.id, name: found.farm.name },
      block: { id: found.block.id, name: found.block.name },
      tree: { id: tree.id, code: tree.code, isNew },
      visitDate,
      notes,
      officer: { id: user?.id, name: user?.name },
      pods: [],
      summary: null,
      previous: null,
      createdAt: now,
      confirmedAt: null,
    };
    store.inspections.push(inspection);
    return toResponse(inspection);
  }
  const response = await apiClient.post('/inspections', { blockId, treeCode, visitDate, notes });
  return response.data;
}

// "Find or create" check while typing the tree code.
// Existing tree -> { id, code, blockId, lastVisitDate } (lastVisitDate null if never completed).
// New tree -> null.
export async function lookupTree(blockId, code) {
  if (USE_MOCK) {
    await mockDelay(250);
    const tree = store.trees.find(
      (item) => item.blockId === blockId && item.code === normaliseTreeCode(code)
    );
    if (!tree) return null;
    const last = latestCompletedByTree().get(tree.id);
    return { ...copy(tree), lastVisitDate: last?.visitDate ?? null };
  }
  const response = await apiClient.get(`/blocks/${blockId}/trees`, { params: { code } });
  return response.data;
}

// files: File objects that are already checked and compressed by the page.
// Returns the updated inspection.
export async function addPodPhotos(id, files) {
  if (USE_MOCK) {
    await mockDelay(600);
    const inspection = findEditable(id);
    if (inspection.pods.length + files.length > MAX_POD_PHOTOS) {
      throw mockError(`You can add up to ${MAX_POD_PHOTOS} pod photos.`, 422);
    }
    const startNumber = inspection.pods.length;
    files.forEach((file, index) => {
      inspection.pods.push({
        id: `P-${id.split('-')[1]}-${Date.now()}-${startNumber + index + 1}`,
        // Mock only: a temporary browser URL so the photo can be shown until refresh.
        photoUrl: typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null,
        aiLabel: null,
        aiConfidence: null,
        finalLabel: null,
        excluded: false,
        changedByOfficer: false,
        reviewed: false,
      });
    });
    refreshSummary(inspection);
    return toResponse(inspection);
  }
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const response = await apiClient.post(`/inspections/${id}/photos`, formData);
  return response.data;
}

// Returns the updated inspection.
export async function removePodPhoto(id, podId) {
  if (USE_MOCK) {
    await mockDelay();
    const inspection = findEditable(id);
    inspection.pods = inspection.pods.filter((item) => item.id !== podId);
    refreshSummary(inspection);
    return toResponse(inspection);
  }
  await apiClient.delete(`/photos/${podId}`);
  return getInspection(id);
}

// Sends the photos to the AI (needs internet). Only pods without an AI label are analysed,
// so labels the officer already reviewed are kept. Returns the updated inspection.
export async function analyseInspection(id) {
  if (USE_MOCK) {
    await mockDelay(1500);
    const inspection = findEditable(id);
    if (inspection.pods.length === 0) {
      throw mockError('Add at least one pod photo first.', 422);
    }
    inspection.pods.forEach((pod, index) => {
      if (pod.aiLabel) return;
      const [label, confidence] = MOCK_AI_RESULTS[index % MOCK_AI_RESULTS.length];
      Object.assign(pod, {
        aiLabel: label,
        aiConfidence: confidence,
        finalLabel: label,
        excluded: false,
        changedByOfficer: false,
        // "AI unsure" pods must be checked by the officer on the Review step.
        reviewed: !isAiUnsure({ aiConfidence: confidence }),
      });
    });
    refreshSummary(inspection);
    return toResponse(inspection);
  }
  const response = await apiClient.post(`/inspections/${id}/analyse`);
  return response.data;
}

// The officer's decision for one pod. changes: { finalLabel } and/or { excluded }.
// Returns the updated inspection.
export async function updatePod(id, podId, { finalLabel, excluded }) {
  if (USE_MOCK) {
    await mockDelay(250);
    const inspection = findEditable(id);
    const pod = inspection.pods.find((item) => item.id === podId);
    if (!pod) throw mockError('Pod photo not found.', 404);
    if (finalLabel !== undefined) pod.finalLabel = finalLabel;
    if (excluded !== undefined) pod.excluded = excluded;
    pod.changedByOfficer = pod.aiLabel !== null && pod.finalLabel !== pod.aiLabel;
    pod.reviewed = true; // the officer has looked at this pod
    refreshSummary(inspection);
    return toResponse(inspection);
  }
  const response = await apiClient.patch(`/photos/${podId}`, { finalLabel, excluded });
  return response.data;
}

// Locks the inspection (status completed). It can't be edited after this.
export async function confirmInspection(id) {
  if (USE_MOCK) {
    await mockDelay();
    const inspection = findEditable(id);
    if (inspection.pods.length === 0 || inspection.pods.some((pod) => !pod.aiLabel)) {
      throw mockError('Analyse all pod photos before confirming.', 422);
    }
    inspection.status = 'completed';
    inspection.confirmedAt = new Date().toISOString();
    refreshSummary(inspection);
    return toResponse(inspection);
  }
  const response = await apiClient.post(`/inspections/${id}/confirm`);
  return response.data;
}

// Download PDF (O6 only for officers). Returns the path of the print page in BOTH modes, a string
// like "/staff/inspections/INS-0012/print" (supervisors: "/admin/inspections/INS-0012/report").
// That page shows the A4 report (InspectionReport) and the browser's print dialog, where the
// user picks "Save as PDF".
// [Decided] Phase 1 = browser print-to-PDF; the backend does not generate PDFs (CLAUDE.md section 7).
// Access is still protected: the print page loads the report with getInspection(id), which the
// backend refuses (403) for another officer's inspection.
export async function downloadReport(id) {
  if (USE_MOCK) {
    await mockDelay(250);
    const inspection = findVisible(id);
    if (inspection.status !== 'completed') {
      throw mockError('The report is ready after the inspection is confirmed.', 409);
    }
  }
  return reportPathFor(currentUser()?.role, id);
}

// ---------- Reference data ----------

// [{ id, name, blocks: [{ id, name }] }]
export async function listFarms() {
  if (USE_MOCK) {
    await mockDelay(250);
    return copy(farms);
  }
  const response = await apiClient.get('/farms');
  return response.data;
}

// [{ code, nameEn, nameMs, cause, looks, action, source }]
export async function listDiseases() {
  if (USE_MOCK) {
    await mockDelay(250);
    return copy(diseases);
  }
  const response = await apiClient.get('/diseases');
  return response.data;
}

// ---------- Supervisor ----------

// Field officers, for the officer filter on supervisor screens. [{ id, name }], A–Z.
export async function listOfficers() {
  if (USE_MOCK) {
    await mockDelay(250);
    return mockUsers
      .filter((user) => user.role === 'staff')
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  const response = await apiClient.get('/officers');
  return response.data;
}

// Severities that put a tree on the "Trees needing attention" list.
const ATTENTION_SEVERITIES = ['high', 'medium'];
const RECENT_LIMIT = 6;

// filters: { farmId, from, to, officerId } (all optional). Everything is calculated from the
// inspections that match the filters (never typed by hand), so the numbers always agree.
// Returns {
//   kpis: { completed, draftsPending, podsChecked, podsExcluded, podsInfected, percentInfected,
//           treesNeedingAttention, blocksNeedingAttention },
//   attention: [{ inspectionId, tree: { id, code }, block: { id, name }, visitDate,
//                 officer: { id, name }, severity, percentInfected }]  High first, then % desc,
//   recent: [inspection] latest 6, drafts included, newest first,
// }
// "Needing attention" = the tree's LATEST completed inspection (within the filters) is
// Medium or High. percentInfected is null when no pods were counted.
export async function getDashboard({ farmId, from, to, officerId } = {}) {
  if (USE_MOCK) {
    await mockDelay();
    const user = currentUser();
    const matching = store.inspections
      .filter((item) => canSee(user, item))
      .filter((item) => !farmId || item.farm.id === farmId)
      .filter((item) => !officerId || item.officer.id === officerId)
      .filter((item) => !from || item.visitDate >= from)
      .filter((item) => !to || item.visitDate <= to)
      .sort(compareNewestFirst);
    const completed = matching.filter((item) => item.status === 'completed');

    const sum = (key) => completed.reduce((total, item) => total + item.summary[key], 0);
    const podsChecked = sum('counted');
    const podsInfected = sum('infected');

    // matching is newest first, so the first completed inspection per tree is its latest.
    const latestByTree = new Map();
    for (const item of completed) {
      if (!latestByTree.has(item.tree.id)) latestByTree.set(item.tree.id, item);
    }
    const attention = [...latestByTree.values()]
      .filter((item) => ATTENTION_SEVERITIES.includes(item.summary.severity))
      .sort(
        (a, b) =>
          ATTENTION_SEVERITIES.indexOf(a.summary.severity) -
            ATTENTION_SEVERITIES.indexOf(b.summary.severity) ||
          b.summary.percentInfected - a.summary.percentInfected
      )
      .map((item) => ({
        inspectionId: item.id,
        tree: { id: item.tree.id, code: item.tree.code },
        block: copy(item.block),
        visitDate: item.visitDate,
        officer: copy(item.officer),
        severity: item.summary.severity,
        percentInfected: item.summary.percentInfected,
      }));

    return {
      kpis: {
        completed: completed.length,
        draftsPending: matching.length - completed.length,
        podsChecked,
        podsExcluded: sum('excluded'),
        podsInfected,
        percentInfected: podsChecked ? Math.round((podsInfected / podsChecked) * 100) : null,
        treesNeedingAttention: attention.length,
        blocksNeedingAttention: new Set(attention.map((item) => item.block.id)).size,
      },
      attention,
      recent: matching.slice(0, RECENT_LIMIT).map(toResponse),
    };
  }
  const response = await apiClient.get('/dashboard', {
    params: { farmId, from, to, officerId },
  });
  return response.data;
}

// One row of a tree's history: the numbers of one completed inspection.
function toHistoryEntry(inspection) {
  const { counted, excluded, infected, percentInfected, severity, diseases } = inspection.summary;
  return {
    id: inspection.id,
    visitDate: inspection.visitDate,
    officer: copy(inspection.officer),
    counted,
    excluded,
    infected,
    percentInfected,
    severity,
    diseases: copy(diseases),
  };
}

// One tree and its history, for the tree history screen. Drafts are not part of the history.
// Returns {
//   tree: { id, code }, block: { id, name }, farm: { id, name },
//   inspections: [{ id, visitDate, officer: { id, name }, counted, excluded, infected,
//                   percentInfected, severity, diseases: [{ code, count }] }]  oldest -> newest,
// }
export async function getTree(id) {
  if (USE_MOCK) {
    await mockDelay();
    const tree = store.trees.find((item) => item.id === id);
    if (!tree) throw mockError('Tree not found.', 404);
    const { farm, block } = findBlock(tree.blockId);
    return {
      tree: { id: tree.id, code: tree.code },
      block: { id: block.id, name: block.name },
      farm: { id: farm.id, name: farm.name },
      inspections: store.inspections
        .filter((item) => item.status === 'completed' && item.tree.id === id)
        .sort(compareNewestFirst)
        .reverse()
        .map(toHistoryEntry),
    };
  }
  const response = await apiClient.get(`/trees/${id}`);
  return response.data;
}

// Every registered tree with its latest result, for the Trees list. Sorted by block, then code.
// filters (all optional): { farmId, blockId, q: tree code text,
//   status: 'all' | 'attention' (Medium or High) | 'na' (not inspected) }
// Status rules (DEMO) are the block rules in utils/blockSummary.js.
// Returns [{ id, code, block: { id, name }, farm: { id, name }, status,
//            latest (as in getBlock trees) | null, inspectionCount (completed only) }]
export async function listTrees({ farmId, blockId, q, status } = {}) {
  if (USE_MOCK) {
    await mockDelay();
    const latest = latestCompletedByTree();
    const search = normaliseTreeCode(q);
    return farms
      .filter((farm) => !farmId || farm.id === farmId)
      .flatMap((farm) =>
        farm.blocks
          .filter((block) => !blockId || block.id === blockId)
          .flatMap((block) => {
            const blockTrees = store.trees.filter((tree) => tree.blockId === block.id);
            return summariseBlock(blockTrees, latest).trees.map((tree) => ({
              ...tree,
              block: { id: block.id, name: block.name },
              farm: { id: farm.id, name: farm.name },
              inspectionCount: store.inspections.filter(
                (item) => item.status === 'completed' && item.tree.id === tree.id
              ).length,
            }));
          })
      )
      .filter((tree) => !search || tree.code.includes(search))
      .filter((tree) => matchesTreeStatus(tree.status, status));
  }
  const response = await apiClient.get('/trees', { params: { farmId, blockId, q, status } });
  return response.data;
}

// Blocks for the block tiles (dashboard and Blocks page), in farm order.
// filters: { farmId } (optional, '' = all farms).
// Returns [{ block: { id, name }, farm: { id, name }, totals }] (totals as in getBlock).
export async function listBlocks({ farmId } = {}) {
  if (USE_MOCK) {
    await mockDelay();
    const latest = latestCompletedByTree();
    return farms
      .filter((farm) => !farmId || farm.id === farmId)
      .flatMap((farm) =>
        farm.blocks.map((block) => {
          // Same numbers as getBlock, without the tree list.
          const summary = blockResponse(farm, block, latest);
          return { block: summary.block, farm: summary.farm, totals: summary.totals };
        })
      );
  }
  const response = await apiClient.get('/blocks', { params: { farmId } });
  return response.data;
}

// One block with every registered tree's latest result, for the block detail screen.
// Rules (DEMO) are in utils/blockSummary.js: tree status = latest COMPLETED inspection
// ('na' = not inspected), block severity = highest tree status.
// Returns {
//   block: { id, name }, farm: { id, name },
//   trees: [{ id, code, status, latest: { inspectionId, visitDate, officer: { id, name },
//             counted, infected, percentInfected } | null }]   sorted by tree code,
//   totals: { severity, treesRegistered, treesInspected, podsChecked, podsInfected,
//             percentInfected, treesMediumOrHigh, lastVisitDate },
// }
export async function getBlock(id) {
  if (USE_MOCK) {
    await mockDelay();
    const found = findBlock(id);
    if (!found) throw mockError('Block not found.', 404);
    return blockResponse(found.farm, found.block, latestCompletedByTree());
  }
  const response = await apiClient.get(`/blocks/${id}`);
  return response.data;
}
