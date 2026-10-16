import { formatShortDate } from '../../utils/format';
import { adminBlockPath } from '../../utils/inspectionRoutes';
import SeverityTile from './SeverityTile';

// One block on the dashboard / Blocks page, linking to the block detail.
// block: { id, name }
// totals: from listBlocks() / getBlock() (rules in utils/blockSummary.js)
// e.g. "Block A" · Medium · "5 of 8 trees inspected" · "17% pods infected · last 12 Oct"
function BlockTile({ block, totals }) {
  const inspected = `${totals.treesInspected} of ${totals.treesRegistered} trees inspected`;

  let latest = 'No inspection yet';
  if (totals.lastVisitDate) {
    const percent =
      typeof totals.percentInfected === 'number'
        ? `${totals.percentInfected}% pods infected`
        : 'No pods counted';
    latest = `${percent} · last ${formatShortDate(totals.lastVisitDate)}`;
  }

  return (
    <SeverityTile
      to={adminBlockPath(block.id)}
      severity={totals.severity}
      title={block.name}
      lines={[inspected, latest]}
    />
  );
}

export default BlockTile;
