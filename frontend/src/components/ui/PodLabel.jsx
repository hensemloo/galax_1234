import { HEALTHY_LABEL } from '../../utils/severity';

// A pod's label in its colour: healthy = green, any disease = red, excluded = grey.
// Text is always shown, so the colour is never the only signal.
// label: disease code, e.g. 'healthy' | 'black_pod'
// name: display name from the disease table (listDiseases), e.g. "Black pod rot".
//       If missing, the code is shown in a readable form ("black_pod" -> "Black pod").
// excluded: shows "Excluded" instead of the label
// confidence: optional AI confidence 0-1, shown as " · 52%"
function readableCode(code = '') {
  const text = code.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function PodLabel({ label, name, excluded = false, confidence, className = '' }) {
  let colour = 'text-sev-high-text';
  let dot = 'bg-sev-high-dot';
  let text = name ?? readableCode(label);

  if (excluded) {
    colour = 'text-sev-na-text';
    dot = 'bg-sev-na-dot';
    text = 'Excluded';
  } else if (label === HEALTHY_LABEL) {
    colour = 'text-sev-none-text';
    dot = 'bg-sev-none-dot';
  } else if (!label) {
    colour = 'text-text-muted';
    dot = 'bg-border';
    text = 'Not analysed';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`size-2 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      <span className={`font-semibold ${colour}`}>{text}</span>
      {typeof confidence === 'number' && !excluded && (
        <span className="font-mono text-xs text-text-muted">· {Math.round(confidence * 100)}%</span>
      )}
    </span>
  );
}

export default PodLabel;
