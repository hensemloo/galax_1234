import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { History, House, Plus } from 'lucide-react';
import { listInspections } from '../../services/inspectionService';
import { NEW_INSPECTION_PATH } from '../../utils/inspectionRoutes';

// Officer bottom tab bar: Home · (+ New, raised, centre) · History. Labels are always visible.
// Shown on Home, History and Full report only (see layouts/StaffLayout.jsx).
// Profile is not a tab: it opens from the avatar in the header.

const TAB_CLASSES =
  'relative flex min-h-14 flex-1 flex-col items-center justify-end gap-0.5 pb-1.5 text-xs';

// Loads the number of drafts once when the tab bar appears (it re-mounts after the wizard,
// so the badge is fresh when the officer comes back). Errors just hide the badge.
function useDraftCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    listInspections({ status: 'draft' })
      .then((drafts) => {
        if (!ignore) setCount(drafts.length);
      })
      .catch(() => {
        if (!ignore) setCount(0);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return count;
}

function tabClasses({ isActive }) {
  return `${TAB_CLASSES} ${isActive ? 'font-semibold text-primary' : 'text-text-muted'}`;
}

function BottomTabBar() {
  const draftCount = useDraftCount();
  const draftText = `${draftCount} ${draftCount === 1 ? 'draft' : 'drafts'}`;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. */}
      <div className="mx-auto flex max-w-[480px] items-end px-2">
        {/* `end`: only active on exactly /staff, not on every /staff/... page. */}
        <NavLink
          to="/staff"
          end
          className={tabClasses}
          aria-label={draftCount > 0 ? `Home, ${draftText}` : undefined}
        >
          <span className="relative flex">
            <House className="size-6" aria-hidden="true" />
            {draftCount > 0 && (
              <span
                className="absolute -top-1.5 -right-3 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white"
                aria-hidden="true"
              >
                {draftCount}
              </span>
            )}
          </span>
          Home
        </NavLink>

        {/* Raised centre button: start a new inspection. The visible "New" label sits under the circle. */}
        <div className="flex flex-1 justify-center">
          <NavLink
            to={NEW_INSPECTION_PATH}
            aria-label="New inspection"
            className="group -mt-6 flex flex-col items-center gap-0.5 pb-1.5 text-xs font-semibold text-primary outline-none"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-surface transition-colors group-hover:bg-primary-dark group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-accent">
              <Plus className="size-7" aria-hidden="true" />
            </span>
            New
          </NavLink>
        </div>

        {/* Not `end`: History stays active on a full report (/staff/inspections/:id). */}
        <NavLink to="/staff/inspections" className={tabClasses}>
          <History className="size-6" aria-hidden="true" />
          History
        </NavLink>
      </div>
    </nav>
  );
}

export default BottomTabBar;
