import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Camera, ChevronRight, Info, Lock, LogOut } from 'lucide-react';
import { version as packageVersion } from '../../../package.json';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/format';

// O8 Profile: opens from the avatar in the header (no tab bar; the layout shows a back arrow).
// Design: docs/design/pod/staff/O8-profile.html (without the "My activity" stats).

// "version" in frontend/package.json. 0.0.0 is the unset default, so show v0.1.0 until it is bumped.
const FALLBACK_VERSION = '0.1.0';
const APP_VERSION =
  packageVersion && packageVersion !== '0.0.0' ? packageVersion : FALLBACK_VERSION;

// Roles stay "staff" / "admin" in code; the UI shows these names.
const ROLE_LABELS = { staff: 'Field officer', admin: 'Supervisor' };

const PHOTO_TIPS = [
  'One pod per photo, filling most of the frame.',
  'Good light, no heavy shadow.',
  'Upload only the best photo of each pod.',
  'No signal? Take photos with the phone camera, then add them from the gallery later.',
];

const SECTION_HEADING_CLASSES = 'text-sm font-bold tracking-wide text-text-muted uppercase';
const ROW_CLASSES =
  'flex min-h-13 w-full items-center gap-3 px-3.5 text-left font-semibold text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';

function RowIcon({ icon: Icon }) {
  return <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />;
}

// A row that opens to show more text (Photo tips, About). Uses the browser's <details>.
function ExpandRow({ icon, label, hint, children }) {
  return (
    <details className="group">
      <summary
        className={`${ROW_CLASSES} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
      >
        <RowIcon icon={icon} />
        <span className="flex-1">{label}</span>
        {hint && <span className="text-sm font-normal text-text-muted">{hint}</span>}
        <ChevronRight
          className="size-5 text-text-muted transition-transform group-open:rotate-90"
          aria-hidden="true"
        />
      </summary>
      <div className="px-3.5 pb-3.5 pl-11.5 text-sm text-text-muted">{children}</div>
    </details>
  );
}

function ProfilePage() {
  const { user, logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      {/* The header bar shows "Profile"; this heading is for screen readers. */}
      <h1 className="sr-only">Profile</h1>

      <section aria-label="Officer" className="flex items-center gap-3.5">
        <span
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-light text-2xl font-bold text-primary-dark"
          aria-hidden="true"
        >
          {getInitials(user?.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold text-text">{user?.name}</p>
          {user?.role && (
            <span className="mt-1 inline-flex rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          )}
        </div>
      </section>

      <section
        aria-labelledby="account-heading"
        className="mt-5 rounded-xl border border-border bg-surface"
      >
        <div className="flex items-center justify-between gap-3 px-3.5 pt-3 pb-1">
          <h2 id="account-heading" className={SECTION_HEADING_CLASSES}>
            Account
          </h2>
          <span className="text-xs text-text-muted">Managed by your supervisor</span>
        </div>
        <dl>
          <div className="flex justify-between gap-3 border-b border-border px-3.5 py-2.5">
            <dt className="text-text-muted">Staff ID</dt>
            <dd className="font-mono font-semibold text-text">{user?.staffId ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-3 px-3.5 pt-2.5 pb-3">
            <dt className="text-text-muted">Email</dt>
            <dd className="min-w-0 text-right font-semibold break-all text-text">
              {user?.email ?? '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="settings-heading" className="mt-5">
        <h2 id="settings-heading" className={SECTION_HEADING_CLASSES}>
          Settings and help
        </h2>
        <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          <li>
            {/* No change-password screen yet: passwords are reset by the supervisor for now. */}
            <ExpandRow icon={Lock} label="Change password">
              Ask your supervisor to reset your password. Changing it in the app is coming later.
            </ExpandRow>
          </li>
          <li>
            <ExpandRow icon={Camera} label="Photo tips">
              <ul className="list-disc space-y-1 pl-4">
                {PHOTO_TIPS.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </ExpandRow>
          </li>
          <li>
            <Link to="/staff/diseases" className={`${ROW_CLASSES} hover:bg-bg`}>
              <RowIcon icon={BookOpen} />
              <span className="flex-1">Disease guide</span>
              <ChevronRight className="size-5 text-text-muted" aria-hidden="true" />
            </Link>
          </li>
          <li>
            <ExpandRow icon={Info} label="About CocoaCheck" hint={`v${APP_VERSION}`}>
              CocoaCheck Sabah helps field officers screen cocoa pods for disease. The AI suggests a
              label; the officer decides. Preliminary screening only, not an official diagnosis.
            </ExpandRow>
          </li>
        </ul>
      </section>

      <button
        type="button"
        onClick={() => setIsLogoutOpen(true)}
        className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-danger bg-surface font-bold text-danger transition-colors hover:bg-danger/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <LogOut className="size-5" aria-hidden="true" />
        Log out
      </button>

      {/* Confirming calls logout(); ProtectedRoute then sends the user to /login. */}
      <ConfirmDialog
        open={isLogoutOpen}
        title="Log out?"
        message="You will need to log in again to continue."
        confirmLabel="Log out"
        onConfirm={logout}
        onCancel={() => setIsLogoutOpen(false)}
      />
    </>
  );
}

export default ProfilePage;
