import { NavLink } from 'react-router';
import { History, House, Plus, User } from 'lucide-react';

// `end` = only active on the exact path (so "/staff" is not active on "/staff/profile").
const LEFT_TABS = [
  { to: '/staff', label: 'Home', icon: House, end: true },
  { to: '/staff/assessments', label: 'History', icon: History, end: false },
];
const RIGHT_TABS = [{ to: '/staff/profile', label: 'Profile', icon: User, end: false }];

function TabLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs ${
          isActive ? 'font-semibold text-primary' : 'text-text-muted'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute top-0 h-1 w-8 rounded-b bg-accent" aria-hidden="true" />
          )}
          <Icon className={`size-6 ${isActive ? 'text-accent' : ''}`} aria-hidden="true" />
          {label}
        </>
      )}
    </NavLink>
  );
}

function BottomTabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. Replace with lg: styles later. */}
      <div className="mx-auto flex max-w-[480px] items-end px-2">
        {LEFT_TABS.map((tab) => (
          <TabLink key={tab.to} {...tab} />
        ))}

        {/* Raised centre button: start a new assessment */}
        <div className="flex flex-1 justify-center">
          <NavLink
            to="/staff/assessments/new"
            aria-label="New assessment"
            className="-mt-6 mb-2 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg ring-4 ring-bg transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus className="size-7" aria-hidden="true" />
          </NavLink>
        </div>

        {RIGHT_TABS.map((tab) => (
          <TabLink key={tab.to} {...tab} />
        ))}
      </div>
    </nav>
  );
}

export default BottomTabBar;
