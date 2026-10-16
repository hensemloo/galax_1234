import { formatShortDate } from '../../utils/format';
import { adminTreePath } from '../../utils/inspectionRoutes';
import SeverityTile from './SeverityTile';

// One tree on the block detail page, linking to the tree history.
// tree: from getBlock().trees: { id, code, status, latest | null }
// e.g. "A-01" · Medium · "1 of 4 pods infected · 25%" · "12 Oct · Aina"
function TreeTile({ tree }) {
  const { latest } = tree;
  let lines = ['No inspection yet'];

  if (latest) {
    const result =
      typeof latest.percentInfected === 'number'
        ? `${latest.infected} of ${latest.counted} pods infected · ${latest.percentInfected}%`
        : 'No pods counted';
    lines = [result, `${formatShortDate(latest.visitDate)} · ${latest.officer.name}`];
  }

  return (
    <SeverityTile
      to={adminTreePath(tree.id)}
      severity={tree.status}
      title={tree.code}
      mono
      lines={lines}
    />
  );
}

export default TreeTile;
