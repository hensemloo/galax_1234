import { LayoutGrid } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import BlockTile from './BlockTile';

// Responsive grid of block tiles: 5 across on wide screens, fewer on smaller ones.
// blocks: from listBlocks(): [{ block, farm, totals }]
function BlockTileGrid({ blocks }) {
  if (blocks.length === 0) {
    return <EmptyState icon={LayoutGrid} title="No blocks registered for this farm." />;
  }

  return (
    <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {blocks.map(({ block, totals }) => (
        <li key={block.id} className="grid">
          <BlockTile block={block} totals={totals} />
        </li>
      ))}
    </ul>
  );
}

export default BlockTileGrid;
