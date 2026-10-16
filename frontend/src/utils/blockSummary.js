// The ONE place that turns inspections into block and tree numbers (block tiles, block detail).
// The backend will use the same rules later (keep them in sync).
//
// DEMO rules (until Lembaga Koko Malaysia (LKM) tells us how they judge a block):
// - A tree's status = the severity of its LATEST COMPLETED inspection. Drafts don't count.
//   No completed inspection -> 'na' ("Not inspected").
// - Block severity = the HIGHEST tree status in the block (high > medium > low > none).
//   No tree inspected -> 'na'.
// - Block numbers come from each tree's latest completed inspection only, so an old visit never
//   counts twice. Everything is calculated, never typed by hand.
import { getWorstSeverity } from './severity';

/** Tree statuses that count as "Trees Medium or High". */
export const ATTENTION_SEVERITIES = ['medium', 'high'];

/** Status filters for the Trees list: all, Medium or High, Not inspected. */
export const TREE_STATUS_FILTERS = ['all', 'attention', 'na'];

/**
 * Does a tree's status match a Trees list filter? Unknown filter -> yes (same as 'all').
 * @param {string} status - the tree's status from summariseTree ('none' … 'high', or 'na')
 * @param {string} filter - one of TREE_STATUS_FILTERS
 * @example
 * matchesTreeStatus('medium', 'attention') // -> true
 * matchesTreeStatus('na', 'attention')     // -> false
 */
export function matchesTreeStatus(status, filter) {
  if (filter === 'attention') return ATTENTION_SEVERITIES.includes(status);
  if (filter === 'na') return status === 'na';
  return true;
}

// Newest first: by visit date, then by when it was created.
function compareNewestFirst(a, b) {
  return (
    b.visitDate.localeCompare(a.visitDate) || (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
  );
}

/**
 * The latest completed inspection of every tree. Drafts are ignored.
 * @param {Array<object>} inspections - inspections in the CLAUDE.md section 11 shape
 * @returns {Map<string, object>} tree id -> its latest completed inspection
 */
export function getLatestCompletedByTree(inspections = []) {
  const latest = new Map();
  for (const item of [...inspections].sort(compareNewestFirst)) {
    if (item.status === 'completed' && !latest.has(item.tree.id)) {
      latest.set(item.tree.id, item);
    }
  }
  return latest;
}

/**
 * One tree for a block screen: its status and the numbers of its latest completed inspection.
 * @param {{ id: string, code: string }} tree
 * @param {object | undefined} latestInspection - from getLatestCompletedByTree, or undefined
 * @returns {{ id: string, code: string, status: string, latest: null | { inspectionId: string,
 *   visitDate: string, officer: { id: string, name: string }, counted: number, infected: number,
 *   percentInfected: number | null } }}
 * @example
 * // A-01, latest = INS-0012 (12 Oct, Aina, 1 of 4 counted pods infected)
 * summariseTree({ id: 'T-A-01', code: 'A-01' }, ins0012)
 * // -> { id: 'T-A-01', code: 'A-01', status: 'medium', latest: { inspectionId: 'INS-0012',
 * //      visitDate: '2026-10-12', officer: { id: 'U-001', name: 'Aina' }, counted: 4,
 * //      infected: 1, percentInfected: 25 } }
 * // A-02 (only a draft) -> { id: 'T-A-02', code: 'A-02', status: 'na', latest: null }
 */
export function summariseTree(tree, latestInspection) {
  if (!latestInspection) {
    return { id: tree.id, code: tree.code, status: 'na', latest: null };
  }
  const { summary } = latestInspection;
  return {
    id: tree.id,
    code: tree.code,
    status: summary.severity,
    latest: {
      inspectionId: latestInspection.id,
      visitDate: latestInspection.visitDate,
      officer: { id: latestInspection.officer.id, name: latestInspection.officer.name },
      counted: summary.counted,
      infected: summary.infected,
      percentInfected: summary.percentInfected,
    },
  };
}

/**
 * Block totals from its trees (the output of summariseTree).
 * @param {Array<ReturnType<typeof summariseTree>>} treeSummaries - every registered tree
 * @returns {{ severity: string, treesRegistered: number, treesInspected: number,
 *   podsChecked: number, podsInfected: number, percentInfected: number | null,
 *   treesMediumOrHigh: number, lastVisitDate: string | null }}
 *   percentInfected is rounded to a whole number, null when no pods were checked.
 * @example
 * // Block A: 8 trees, 5 with a completed inspection (A-01 Medium, A-03 None, A-04 Medium,
 * // A-05 None, A-06 Low)
 * // -> { severity: 'medium', treesRegistered: 8, treesInspected: 5, podsChecked: 24,
 * //      podsInfected: 4, percentInfected: 17, treesMediumOrHigh: 2, lastVisitDate: '2026-10-12' }
 */
export function summariseBlockTotals(treeSummaries = []) {
  const inspected = treeSummaries.filter((tree) => tree.latest);
  const podsChecked = inspected.reduce((total, tree) => total + tree.latest.counted, 0);
  const podsInfected = inspected.reduce((total, tree) => total + tree.latest.infected, 0);
  const visitDates = inspected.map((tree) => tree.latest.visitDate).sort();

  return {
    severity: getWorstSeverity(inspected.map((tree) => tree.status)),
    treesRegistered: treeSummaries.length,
    treesInspected: inspected.length,
    podsChecked,
    podsInfected,
    percentInfected: podsChecked > 0 ? Math.round((podsInfected / podsChecked) * 100) : null,
    treesMediumOrHigh: inspected.filter((tree) => ATTENTION_SEVERITIES.includes(tree.status))
      .length,
    lastVisitDate: visitDates.at(-1) ?? null,
  };
}

/**
 * Everything a block screen needs, from the block's registered trees and ALL inspections.
 * @param {Array<{ id: string, code: string }>} blockTrees - the trees registered in the block
 * @param {Map<string, object>} latestByTree - from getLatestCompletedByTree
 * @returns {{ trees: Array<ReturnType<typeof summariseTree>>,
 *   totals: ReturnType<typeof summariseBlockTotals> }} trees sorted by tree code
 */
export function summariseBlock(blockTrees = [], latestByTree = new Map()) {
  const trees = [...blockTrees]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((tree) => summariseTree(tree, latestByTree.get(tree.id)));
  return { trees, totals: summariseBlockTotals(trees) };
}
