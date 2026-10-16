// Numbers for the inspection flow, kept in one place so the LKM field trip changes data, not code.
// Severity thresholds live in utils/severity.js.

// Pod photos per inspection (one pod per photo).
export const MIN_POD_PHOTOS = 1;
export const MAX_POD_PHOTOS = 10;

// Photo upload limits (checked before compressing).
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PHOTO_SIZE_MB = 5;

// Photos are made smaller in the browser before upload (browser-image-compression options).
export const PHOTO_COMPRESSION = { maxWidthOrHeight: 1280, maxSizeMB: 0.5, useWebWorker: true };

// Tree code format: one letter, a dash, digits, e.g. "A-01". [Open] Real tag format after the LKM trip.
export const TREE_CODE_PATTERN = /^[A-Z]-\d{1,4}$/;

// DEMO: AI confidence below this = "AI unsure, please check". The officer must check these pods
// one by one before continuing from the Review screen.
export const AI_UNSURE_BELOW = 0.7;

// isAiUnsure({ aiConfidence: 0.52 }) -> true
export function isAiUnsure(pod) {
  return typeof pod?.aiConfidence === 'number' && pod.aiConfidence < AI_UNSURE_BELOW;
}

// Review step (O4): "Continue to summary" is allowed once every "AI unsure" pod that is still
// counted (not excluded) has been checked by the officer (reviewed: true).
// canContinueReview([{ aiConfidence: 0.52, excluded: false, reviewed: false }]) -> false
// canContinueReview([{ aiConfidence: 0.52, excluded: false, reviewed: true }])  -> true
// canContinueReview([{ aiConfidence: 0.95, excluded: false, reviewed: false }]) -> true (AI sure)
export function canContinueReview(pods = []) {
  return pods.every((pod) => pod.excluded || !isAiUnsure(pod) || pod.reviewed);
}
