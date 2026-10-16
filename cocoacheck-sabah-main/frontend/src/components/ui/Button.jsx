import { LoaderCircle } from 'lucide-react';

const BASE_CLASSES =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded px-5 font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT_CLASSES = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:hover:bg-primary',
  secondary: 'border border-border bg-surface text-primary hover:bg-bg disabled:hover:bg-surface',
  text: 'bg-transparent text-primary hover:underline disabled:hover:no-underline',
};

// variant: "primary" | "secondary" | "text"
// loading: shows a spinner and disables the button
function Button({
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], fullWidth && 'w-full', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {loading && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export default Button;
