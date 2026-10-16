// Back buttons: go back one page if this tab has an earlier page of our app, otherwise go to
// `fallback` (e.g. the page was opened directly from a link or a new tab).
// React Router keeps the position in the tab's history in window.history.state.idx (0 = first page).
// Checking idx (not location.key) also works after a redirect replaced the first page.
export function canGoBack() {
  return (window.history.state?.idx ?? 0) > 0;
}

// goBack(navigate, '/staff')
export function goBack(navigate, fallback) {
  if (canGoBack()) {
    navigate(-1);
  } else {
    navigate(fallback, { replace: true });
  }
}
