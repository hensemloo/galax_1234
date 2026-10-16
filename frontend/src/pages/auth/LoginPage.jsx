import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import Button from '../../components/ui/Button';
import TextField from '../../components/ui/TextField';
import { useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../mocks/mockUsers';
import { getHomePath } from '../../routes/homePath';
import { USE_MOCK } from '../../services/apiClient';

// Roles stay "staff" / "admin" in code; the UI shows these names.
const ROLE_LABELS = { staff: 'Field officer', admin: 'Supervisor' };

// The one screen that is fully responsive now:
// mobile = dark header on top, form below; desktop (lg:) = dark left panel, white card on the right.
function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in: skip the login page.
  if (user && !isSubmitting) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = {};
    if (!email.trim()) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';

    setFieldErrors(errors);
    setFormError('');
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(getHomePath(loggedInUser.role), { replace: true });
    } catch (error) {
      setFormError(error.userMessage ?? error.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg lg:flex">
      <header className="bg-primary-dark px-6 pt-12 pb-8 text-white lg:flex lg:w-[45%] lg:flex-col lg:justify-center lg:px-16">
        <div className="mx-auto w-full max-w-[480px] lg:mx-0 lg:max-w-md">
          <p className="text-2xl font-semibold lg:text-4xl">CocoaCheck Sabah</p>
          <p className="mt-1 text-sm text-white/75 lg:hidden">Cocoa pod disease screening</p>
          <p className="mt-4 hidden text-lg text-white/75 lg:block">
            Cocoa pod disease screening for field officers and supervisors
          </p>
        </div>
      </header>

      <main className="px-6 py-8 lg:flex lg:flex-1 lg:items-center lg:justify-center lg:p-12">
        <div className="mx-auto w-full max-w-[480px] lg:max-w-[400px] lg:rounded lg:border lg:border-border lg:bg-surface lg:p-8 lg:shadow-sm">
          <h1 className="text-2xl font-semibold text-text">Sign in</h1>

          <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
            {formError && (
              <p
                role="alert"
                className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
              >
                {formError}
              </p>
            )}

            <TextField
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((errors) => ({ ...errors, email: undefined }));
              }}
              error={fieldErrors.email}
            />

            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              showPasswordToggle
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((errors) => ({ ...errors, password: undefined }));
              }}
              error={fieldErrors.password}
            />

            <Button type="submit" fullWidth loading={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-muted">
            Access is provided by your supervisor.
          </p>

          {USE_MOCK && (
            <div className="mt-6 rounded border border-dashed border-border px-3 py-2 text-xs text-text-muted">
              <p className="font-medium">Demo accounts</p>
              <ul className="mt-1 space-y-0.5">
                {mockUsers.map((mockUser) => (
                  <li key={mockUser.id}>
                    {ROLE_LABELS[mockUser.role] ?? mockUser.role}:{' '}
                    <span className="font-mono">{mockUser.email}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1">
                Password: <span className="font-mono">{mockUsers[0].password}</span>
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-text-muted">
            Preliminary screening tool · not an official diagnosis
          </p>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
