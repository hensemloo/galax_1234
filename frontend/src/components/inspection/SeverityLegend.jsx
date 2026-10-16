import SeverityBadge from '../ui/SeverityBadge';

// Small legend for block and tree tiles: None, Low, Medium, High, Not inspected.
const LEGEND = ['none', 'low', 'medium', 'high', 'na'];

function SeverityLegend({ className = '' }) {
  return (
    <ul aria-label="Severity colours" className={`flex flex-wrap gap-2 ${className}`}>
      {LEGEND.map((severity) => (
        <li key={severity}>
          <SeverityBadge severity={severity} />
        </li>
      ))}
    </ul>
  );
}

export default SeverityLegend;
