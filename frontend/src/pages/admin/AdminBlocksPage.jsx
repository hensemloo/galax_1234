import { useEffect, useState } from 'react';
import BlockTileGrid from '../../components/inspection/BlockTileGrid';
import SeverityLegend from '../../components/inspection/SeverityLegend';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import SelectField from '../../components/ui/SelectField';
import Skeleton from '../../components/ui/Skeleton';
import { listBlocks, listFarms } from '../../services/inspectionService';

// Admin · Layer 2: Blocks (/admin/blocks). Same tiles as the dashboard's "Block overview"
// (docs/design/pod/admin/A1-dashboard.html). Rules (DEMO) are in utils/blockSummary.js.
function BlocksSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {[0, 1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-28" />
      ))}
    </div>
  );
}

function AdminBlocksPage() {
  const [farmId, setFarmId] = useState(''); // '' = all farms
  const [farms, setFarms] = useState([]);

  const [blocks, setBlocks] = useState([]);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [error, setError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Options for the Farm filter. If they fail, the filter still offers "All farms".
  useEffect(() => {
    let ignore = false;
    listFarms()
      .then((farmList) => {
        if (!ignore) setFarms(farmList);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Load the blocks, and again when the farm changes or after "Try again".
  useEffect(() => {
    let ignore = false;

    listBlocks({ farmId })
      .then((blockList) => {
        if (ignore) return;
        setBlocks(blockList);
        setLoadState('success');
      })
      .catch((loadError) => {
        if (ignore) return;
        setError(loadError);
        setLoadState('error');
      });

    return () => {
      ignore = true;
    };
  }, [farmId, reloadCount]);

  function handleFarmChange(value) {
    setFarmId(value);
    setLoadState('loading');
    setError(null);
  }

  function handleRetry() {
    setLoadState('loading');
    setError(null);
    setReloadCount((count) => count + 1);
  }

  const farmOptions = [
    { value: '', label: 'All farms' },
    ...farms.map((farm) => ({ value: farm.id, label: farm.name })),
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Blocks</h1>
          <p className="mt-1 text-text-muted">
            Colour = highest latest severity of any tree in the block. Click a block to see its
            trees.
          </p>
        </div>
        <SelectField
          label="Farm"
          value={farmId}
          onChange={handleFarmChange}
          options={farmOptions}
          className="min-w-48"
        />
      </div>

      {loadState === 'error' ? (
        <ErrorState title="Could not load the blocks" error={error} onRetry={handleRetry} />
      ) : (
        <Card className="flex flex-col gap-4 md:p-6">
          <SeverityLegend />
          {loadState === 'loading' ? <BlocksSkeleton /> : <BlockTileGrid blocks={blocks} />}
        </Card>
      )}

      <p className="text-xs text-text-muted">
        Block severity = highest latest severity among its trees (DEMO rule). Thresholds are DEMO
        values.
      </p>
    </div>
  );
}

export default AdminBlocksPage;
