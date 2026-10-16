// Grey pulsing placeholder shown while data loads.
// className: sets the size and shape, e.g. "h-4 w-32" or "h-24 w-full"
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-border ${className}`} aria-hidden="true" />;
}

export default Skeleton;
