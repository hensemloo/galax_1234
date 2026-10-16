import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// label: text above the input
// required: shows a red asterisk (use noValidate on the form and validate yourself)
// error: message shown under the input in red
// suffix: unit shown inside the right edge, e.g. "g" or "%"
// showPasswordToggle: adds a show/hide button when type="password"
// Any other props (value, onChange, placeholder, autoComplete...) go to the <input>.
function TextField({
  label,
  type = 'text',
  required = false,
  error,
  suffix,
  showPasswordToggle = false,
  id,
  className = '',
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasToggle = type === 'password' && showPasswordToggle;
  const inputType = hasToggle && isPasswordVisible ? 'text' : type;

  const boxClasses = error
    ? 'border-danger focus-within:ring-danger/25'
    : 'border-border focus-within:border-primary focus-within:ring-primary/20';

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div
        className={`flex min-h-12 items-center rounded border bg-surface focus-within:ring-2 ${boxClasses}`}
      >
        <input
          id={inputId}
          type={inputType}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-text outline-none placeholder:text-text-muted"
          {...inputProps}
        />

        {suffix && <span className="pr-3 text-sm text-text-muted">{suffix}</span>}

        {hasToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            className="flex size-12 shrink-0 items-center justify-center text-text-muted hover:text-text"
          >
            {isPasswordVisible ? (
              <EyeOff className="size-5" aria-hidden="true" />
            ) : (
              <Eye className="size-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;
