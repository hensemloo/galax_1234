import { Link } from 'react-router';
import SeverityBadge from '../ui/SeverityBadge';

// Coloured tile that is one link, used for block tiles and tree tiles.
// Colour + the SeverityBadge word together show the status (never colour alone).
// to: where the tile goes, e.g. "/admin/blocks/BLK-A"
// severity: 'none' | 'low' | 'medium' | 'high' | 'na'
// title: big text at the top, e.g. "Block A" or "A-01"
// mono: show the title in the mono font (tree codes)
// lines: 1–2 short muted lines under the title
//
// Full class names are written out so Tailwind can find them (no `bg-sev-${x}-bg`).
const TILE_STYLES = {
  none: 'bg-sev-none-bg border-sev-none-border',
  low: 'bg-sev-low-bg border-sev-low-border',
  medium: 'bg-sev-medium-bg border-sev-medium-border',
  high: 'bg-sev-high-bg border-sev-high-border',
  na: 'bg-sev-na-bg border-sev-na-border',
};

function SeverityTile({ to, severity, title, mono = false, lines = [] }) {
  const key = TILE_STYLES[severity] ? severity : 'na';

  return (
    <Link
      to={to}
      className={`flex min-h-11 flex-col gap-2 rounded-xl border px-4 py-3.5 text-text transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${TILE_STYLES[key]}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className={`text-lg font-bold ${mono ? 'font-mono font-semibold' : ''}`}>
          {title}
        </span>
        <SeverityBadge severity={key} onTile />
      </span>
      {lines.map((line) => (
        <span key={line} className="text-sm text-text-muted">
          {line}
        </span>
      ))}
    </Link>
  );
}

export default SeverityTile;
