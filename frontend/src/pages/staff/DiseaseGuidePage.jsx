import DiseaseGuide from '../../components/inspection/DiseaseGuide';

// Disease guide (/staff/diseases). Read-only. Opens from Profile and from "What is this?" in the
// Check pod sheet (/staff/diseases#black_pod scrolls to that disease).
// The header (title, back arrow with goBack(), no tab bar) is set in layouts/StaffLayout.jsx, so
// Back returns to wherever the officer came from (Profile or Review pods).
// Same content as the supervisor Disease info page (components/inspection/DiseaseGuide.jsx).
function DiseaseGuidePage() {
  return (
    <>
      {/* The header bar shows "Disease guide"; this heading is for screen readers. */}
      <h1 className="sr-only">Disease guide</h1>
      <DiseaseGuide layout="mobile" />
    </>
  );
}

export default DiseaseGuidePage;
