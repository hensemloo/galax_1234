import { Outlet } from 'react-router';
import AdminSidebar from '../components/navigation/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/format';

// Supervisor pages (role "admin" in code). Desktop (>= 1280px): dark sidebar on the left,
// top bar, content on the right. The faint cocoa pattern (cc-bg) sits behind the content area.
// Printing (report view): sidebar, top bar, padding and pattern are left out, so only the page
// content (the A4 report) is printed.
function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-dvh bg-bg print:block print:min-h-0 print:bg-surface">
      <AdminSidebar />

      <div className="cc-bg flex min-w-0 flex-1 flex-col print:before:hidden">
        <header className="no-print flex h-16 items-center justify-end border-b border-border bg-surface px-8">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-text">{user?.name}</p>
              <p className="text-xs text-text-muted">Supervisor</p>
            </div>
            <span
              className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-white"
              aria-hidden="true"
            >
              {getInitials(user?.name)}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
