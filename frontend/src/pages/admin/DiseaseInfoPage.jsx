import DiseaseGuide from '../../components/inspection/DiseaseGuide';

// Admin · Layer 2: Disease info (/admin/diseases). Read-only.
// Same content as the officer Disease guide (components/inspection/DiseaseGuide.jsx), desktop layout.
// Design: docs/design/pod/admin/L2-disease-info.html
function DiseaseInfoPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-2">
      <h1 className="text-3xl font-bold text-text">Disease info</h1>
      <DiseaseGuide layout="desktop" />
    </div>
  );
}

export default DiseaseInfoPage;
