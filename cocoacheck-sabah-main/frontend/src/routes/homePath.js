// Where each role lands after logging in (and when it opens a page it may not see).
const HOME_PATHS = {
  staff: '/staff',
  admin: '/admin',
};

export function getHomePath(role) {
  return HOME_PATHS[role] ?? '/login';
}
