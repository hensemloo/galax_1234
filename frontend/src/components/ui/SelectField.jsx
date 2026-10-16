import { useId } from 'react';

// Native dropdown styled like TextField: label above, error message below.
// Used by the O2 form (Farm, Block) and the supervisor filters (Farm, Period, Officer).
// label: text above the select
// value + onChange(value): the selected option's value (onChange gets the value, not the event)
// options: [{ value, label }]. Put { value: '', label: 'Choose a farm' } first for a placeholder.
// required: shows a red asterisk (use noValidate on the form and validate yourself)
// error: message shown under the select in red
// disabled: greyed out and not clickable, e.g. Block until a farm is chosen
// className: extra classes for the wrapper, e.g. a min width
function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
  className = '',
}) {
  const selectId = useId();
  const errorId = `${selectId}-error`;

  const borderClasses = error
    ? 'border-danger focus:ring-danger/25'
    : 'border-border focus:border-primary focus:ring-primary/20';

  return (
    <div className={className}>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-text">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-12 w-full rounded border bg-surface px-3 text-base text-text outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${borderClasses}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default SelectField;
