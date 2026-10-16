import { NavLink } from 'react-router';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ScrollText,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// `end` = only active on the exact path (so Dashboard is not active on every /admin page).
const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/assessments', label: 'Assessments', icon: ClipboardList, end: false },
  { to: '/admin/staff', label: 'Staff', icon: Users, end: false },
  { to: '/admin/rules', label: 'Assessment Rules', icon: SlidersHorizontal, end: false },
  { to: '/admin/logs', label: 'Activity Logs', icon: ScrollText, end: false },
];

const ITEM_CLASSES =
  'flex min-h-11 w-full items-center gap-3 border-l-4 px-5 text-sm transition-colors';

function AdminSidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sticky top-0 flex h-dvh w-64 shrink-0 flex-col bg-primary-dark text-white">
      <div className="px-6 py-6">
        <p className="text-lg font-semibold">CocoaCheck Sabah</p>
        <p className="mt-0.5 text-xs font-medium tracking-wider text-accent uppercase">Admin</p>
      </div>

      <nav aria-label="Admin" className="flex-1">
        <ul className="space-y-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${ITEM_CLASSES} ${
                    isActive
                      ? 'border-accent bg-white/10 font-medium text-white'
                      : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 py-4">
        <button
          type="button"
          onClick={logout}
          className={`${ITEM_CLASSES} border-transparent text-white/70 hover:bg-white/5 hover:text-white`}
        >
          <LogOut className="size-5" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
