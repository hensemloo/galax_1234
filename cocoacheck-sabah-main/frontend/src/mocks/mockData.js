// Mock assessment data used when VITE_USE_MOCK=true.
// Field names are snake_case to match the FastAPI backend.
//
// status: "draft" | "completed"
// result.result: "no_major_concerns" | "further_inspection" | "significant_concerns"

// One complete assessment, used for detail screens and the wizard demo.
export const mockAssessment = {
  id: 'A-0046',
  batch_id: 'CB-046',
  supplier: 'Koperasi Pekebun Koko Tawau',
  district: 'Tawau',
  assessment_date: '2026-10-01',
  notes: 'Sample taken from the top of three sacks.',
  status: 'completed',
  current_step: 6,
  assessed_by: 'Nur Aisyah Rahman',
  image_url: null,
  ai_result: {
    beans_detected: 105,
    flagged: 3,
    avg_confidence: 0.87,
    // bbox = [x, y, width, height] in pixels on the uploaded image
    detections: [
      { label: 'mouldy', confidence: 0.91, bbox: [142, 88, 38, 30] },
      { label: 'insect_damaged', confidence: 0.84, bbox: [410, 236, 36, 28] },
      { label: 'flat', confidence: 0.79, bbox: [268, 402, 40, 24] },
      { label: 'good', confidence: 0.95, bbox: [60, 310, 37, 29] },
    ],
  },
  measurements: {
    sample_weight_g: 100,
    bean_count: 105,
    moisture_pct: 7.2,
    foreign_matter_pct: 0.5,
  },
  result: {
    indicative_grade: 'B',
    result: 'further_inspection',
    recommended_action:
      'Bean count per 100 g is above the Grade A limit and 3 beans were flagged. Hold the batch and do a cut test before purchase.',
  },
  created_at: '2026-10-01T09:12:00+08:00',
  updated_at: '2026-10-01T09:41:00+08:00',
};

// Shorter assessments for list screens (dashboard, history, admin table).
export const mockAssessments = [
  mockAssessment,
  {
    id: 'A-0045',
    batch_id: 'CB-045',
    supplier: 'Kumpulan Peladang Kota Marudu',
    district: 'Kota Marudu',
    assessment_date: '2026-09-30',
    status: 'completed',
    current_step: 6,
    assessed_by: 'Nur Aisyah Rahman',
    result: { indicative_grade: 'A', result: 'no_major_concerns' },
  },
  {
    id: 'A-0044',
    batch_id: 'CB-044',
    supplier: 'Ladang Koko Kiulu',
    district: 'Kiulu',
    assessment_date: '2026-09-29',
    status: 'completed',
    current_step: 6,
    assessed_by: 'Nur Aisyah Rahman',
    result: { indicative_grade: 'C', result: 'significant_concerns' },
  },
  {
    id: 'A-0047',
    batch_id: 'CB-047',
    supplier: 'Pertubuhan Peladang Keningau',
    district: 'Keningau',
    assessment_date: '2026-10-01',
    status: 'draft',
    current_step: 2,
    assessed_by: 'Nur Aisyah Rahman',
    result: null,
  },
  {
    id: 'A-0048',
    batch_id: 'CB-048',
    supplier: 'Koperasi Pekebun Koko Tawau',
    district: 'Tawau',
    assessment_date: '2026-10-02',
    status: 'draft',
    current_step: 4,
    assessed_by: 'Nur Aisyah Rahman',
    result: null,
  },
  {
    id: 'A-0043',
    batch_id: 'CB-043',
    supplier: 'Pertubuhan Peladang Keningau',
    district: 'Keningau',
    assessment_date: '2026-09-26',
    status: 'completed',
    current_step: 6,
    assessed_by: 'Nur Aisyah Rahman',
    result: { indicative_grade: 'B', result: 'further_inspection' },
  },
];
