import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm text-text-muted">404</p>
      <h1 className="text-2xl font-semibold text-text">Page not found</h1>
      <p className="text-text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="font-medium text-primary underline underline-offset-4">
        Go to home
      </Link>
    </main>
  );
}

export default NotFoundPage;
