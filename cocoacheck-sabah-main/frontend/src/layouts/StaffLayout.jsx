import { Outlet } from 'react-router';
import BottomTabBar from '../components/navigation/BottomTabBar';

// Staff pages with the bottom tab bar (dashboard, history, detail, profile).
// Mobile-first: these are the mobile styles. Desktop (lg:) styles come later.
function StaffLayout() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* LATER (desktop): add a staff sidebar here, e.g. <StaffSidebar className="hidden lg:flex" />,
          and hide the BottomTabBar on lg: screens. */}

      {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. Replace with lg: styles later. */}
      {/* pb-28 keeps content clear of the fixed bottom tab bar. */}
      <main className="mx-auto w-full max-w-[480px] px-4 pt-6 pb-28">
        <Outlet />
      </main>

      <BottomTabBar />
    </div>
  );
}

export default StaffLayout;
