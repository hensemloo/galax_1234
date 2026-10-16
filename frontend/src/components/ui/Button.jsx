import { LoaderCircle } from 'lucide-react';

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANT_CLASSES = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:hover:bg-primary',
  secondary:
    'border border-primary/40 bg-surface text-primary hover:bg-bg disabled:hover:bg-surface',
  text: 'bg-transparent text-primary hover:underline disabled:hover:no-underline',
};

const SIZE_CLASSES = {
  md: 'min-h-12 px-5',
  sm: 'min-h-10 px-4 text-sm',
};

// variant: "primary" | "secondary" | "text"
// size: "md" (48px, default) | "sm" (40px; only inside a bigger tap area, e.g. a card link)
// loading: shows a spinner and disables the button
// as: "button" (default) | "span". Use "span" when the button sits inside a link (a <button>
//     inside an <a> is invalid HTML); it then looks like a button but the link does the work.
function Button({
  variant = 'primary',
  size = 'md',
  as = 'button',
  type = 'button',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
    fullWidth && 'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );

  if (as === 'span') {
    return (
      <span className={classes} {...props}>
        {content}
      </span>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
}

export default Button;
