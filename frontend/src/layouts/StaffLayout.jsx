import { Link, Outlet, matchPath, useLocation, useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import BottomTabBar from '../components/navigation/BottomTabBar';
import CocoaPodIcon from '../components/ui/CocoaPodIcon';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/format';
import { goBack } from '../utils/navigation';

// Officer pages outside the wizard. Mobile-first (test at 360–390px).
// The header and tab bar change per page, set in PAGES below (first match wins, so the most
// specific paths come first). The wizard (O2–O5) uses StaffWizardLayout instead.
//
// title: text in the header (null = logo + "CocoaCheck")
// back: shows a back arrow. 'history' = go back one page (fallback /staff when the page was
//       opened directly, e.g. in a new tab); a path = go there.
// avatar: shows the avatar button that opens Profile
// tabBar: shows the bottom tab bar
const PAGES = [
  { path: '/staff', title: null, back: null, avatar: true, tabBar: true },
  { path: '/staff/inspections', title: 'History', back: null, avatar: true, tabBar: true },
  { path: '/staff/profile', title: 'Profile', back: 'history', avatar: false, tabBar: false },
  {
    path: '/staff/diseases',
    title: 'Disease guide',
    back: 'history',
    avatar: false,
    tabBar: false,
  },
  {
    path: '/staff/inspections/:id/report',
    title: 'Report',
    back: '/staff',
    avatar: false,
    tabBar: false,
  },
  {
    path: '/staff/inspections/:id',
    title: 'Full report',
    back: 'history',
    avatar: false,
    tabBar: true,
  },
];

const DEFAULT_PAGE = { title: null, back: null, avatar: true, tabBar: true };

function getPageConfig(pathname) {
  return PAGES.find((page) => matchPath(page.path, pathname)) ?? DEFAULT_PAGE;
}

const HEADER_BUTTON_CLASSES =
  'flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

function StaffLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const page = getPageConfig(location.pathname);

  function handleBack() {
    if (page.back === 'history') {
      goBack(navigate, '/staff');
    } else {
      navigate(page.back);
    }
  }

  return (
    <div className="cc-bg min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 bg-primary-dark text-white">
        {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. */}
        <div className="mx-auto flex min-h-15 w-full max-w-[480px] items-center gap-1 px-2">
          {page.back && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className={`${HEADER_BUTTON_CLASSES} hover:bg-white/10`}
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
          )}

          {page.title ? (
            <span className={`flex-1 text-lg font-semibold ${page.back ? '' : 'pl-2'}`}>
              {page.title}
            </span>
          ) : (
            <span className="flex flex-1 items-center gap-2.5 pl-2">
              <CocoaPodIcon className="size-6 text-primary-light" />
              <span className="text-lg font-bold">CocoaCheck</span>
            </span>
          )}

          {page.avatar && (
            <Link
              to="/staff/profile"
              aria-label="Profile"
              className={`${HEADER_BUTTON_CLASSES} bg-primary-light font-bold text-primary-dark`}
            >
              <span aria-hidden="true">{getInitials(user?.name)}</span>
            </Link>
          )}
        </div>
      </header>

      {/* TEMPORARY: keeps the mobile design centred on laptops until the desktop layout is built. */}
      {/* pb-28 keeps content clear of the fixed bottom tab bar. */}
      <main className={`mx-auto w-full max-w-[480px] px-4 pt-5 ${page.tabBar ? 'pb-28' : 'pb-8'}`}>
        <Outlet />
      </main>

      {page.tabBar && <BottomTabBar />}
    </div>
  );
}

export default StaffLayout;
