import { TriangleAlert } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

// Card shown when data fails to load, with a "Try again" button.
// title: short heading, e.g. "Could not load inspections"
// error: the caught error; shows error.userMessage (set by apiClient) or a fallback
// onRetry: called when "Try again" is pressed (load the data again)
// className: extra classes, e.g. "mt-6"
function ErrorState({ title, error, onRetry, className = '' }) {
  return (
    <Card className={className}>
      <div role="alert" className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
        <div>
          <p className="font-medium text-text">{title}</p>
          <p className="mt-1 text-sm text-text-muted">{error?.userMessage ?? FALLBACK_MESSAGE}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" fullWidth onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </Card>
  );
}

export default ErrorState;
