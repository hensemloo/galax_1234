import { useId, useRef } from 'react';
import { Search, X } from 'lucide-react';

// Search box with a search icon and a clear (X) button.
// label: what is being searched, read by screen readers (the box has no visible label)
// value + onChange(text): the current search text (onChange gets the text, not the event)
// placeholder: hint shown when empty, e.g. "Search tree code, e.g. A-01"
function SearchField({ label, value, onChange, placeholder }) {
  const inputId = useId();
  const inputRef = useRef(null);

  function handleClear() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div className="flex min-h-12 items-center rounded border border-border bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search className="ml-3 size-5 shrink-0 text-text-muted" aria-hidden="true" />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-text outline-none placeholder:text-text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="flex size-12 shrink-0 items-center justify-center text-text-muted hover:text-text"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default SearchField;
