import { useRef } from 'react';

// Pick exactly one option from a short list, e.g. All / Draft / Completed.
// options: [{ value, label }]
// value: the selected option's value
// onChange(value): called when the user picks an option
// label: what the control chooses, read by screen readers (e.g. "Filter by status")
// Keyboard: Tab focuses the selected option; Left/Right arrow keys move and select (radio group pattern).
function SegmentedControl({ options, value, onChange, label }) {
  const buttonRefs = useRef([]);

  function handleKeyDown(event, index) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;

    event.preventDefault();
    const nextIndex = (index + step + options.length) % options.length;
    onChange(options[nextIndex].value);
    buttonRefs.current[nextIndex]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex rounded bg-border/60 p-1">
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`min-h-10 flex-1 rounded px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isSelected ? 'bg-primary text-white' : 'text-text-muted hover:text-text'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
