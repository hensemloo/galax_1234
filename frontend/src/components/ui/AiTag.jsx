import { Sparkles } from 'lucide-react';

// Small neutral tag marking content produced by the AI model. No props.
function AiTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-2 py-0.5 text-xs font-medium text-text-muted">
      <Sparkles className="size-3.5" aria-hidden="true" />
      AI-generated
    </span>
  );
}

export default AiTag;
