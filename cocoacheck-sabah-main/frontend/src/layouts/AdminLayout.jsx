import { Outlet } from 'react-router';
import AdminSidebar from '../components/navigation/AdminSidebar';
import { useAuth } from '../context/AuthContext';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// Admin pages. Desktop only: dark sidebar on the left, top bar, content on the right.
function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-dvh bg-bg">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-border bg-surface px-8">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-text">{user?.name}</p>
              <p className="text-xs text-text-muted">Administrator</p>
            </div>
            <span
              className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white"
              aria-hidden="true"
            >
              {getInitials(user?.name)}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
