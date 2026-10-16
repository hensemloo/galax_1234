import { useState, useEffect } from "react";

function BatchWizard1({ batchId: initialBatchId, initialData = {}, onNext, onCancel }) {
  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [batchId, setBatchId] = useState(
    initialData.batchId || initialBatchId || "CB-046"
  );
  const [supplier, setSupplier] = useState(
    initialData.supplier || "Koperasi Pekebun Koko Tawau"
  );
  const [assessmentDate, setAssessmentDate] = useState(
    initialData.assessmentDate || getTodayString()
  );
  const [notes, setNotes] = useState(initialData.notes || "");

  // Sync state if user navigates back to Step 1 with existing data
  useEffect(() => {
    if (initialData.batchId || initialBatchId) {
      setBatchId(initialData.batchId || initialBatchId);
    }
    if (initialData.supplier) setSupplier(initialData.supplier);
    if (initialData.assessmentDate) setAssessmentDate(initialData.assessmentDate);
    if (initialData.notes !== undefined) setNotes(initialData.notes);
  }, [initialBatchId, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const stepData = { batchId, supplier, assessmentDate, notes };
    if (onNext) {
      onNext(stepData);
    }
  };

  return (
    <div className="app-viewport">
      <div className="wizard-card">
        {/* HEADER BAR */}
        <div className="mobile-header">
          <button className="icon-btn-back" type="button" onClick={onCancel} aria-label="Cancel Wizard">
            ←
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="mobile-progress-row" style={{ marginTop: "12px" }}>
          <div className="step-info">
            <span className="step-tag">STEP 1 OF 6</span>
            <span className="batch-pill">{batchId}</span>
          </div>
          <span className="percent-tag">16% complete</span>
        </div>

        <div className="progress-bar-bg" style={{ marginBottom: "16px" }}>
          <div className="progress-bar-fill" style={{ width: "16%" }}></div>
        </div>

        <h2>Batch details</h2>
        <p className="subtitle">
          Enter the initial traceability and intake details for this bean consignment.
        </p>

        <form onSubmit={handleSubmit} className="wizard-form">
          <div className="form-group">
            <label htmlFor="batchId">Batch ID *</label>
            <input
              id="batchId"
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="supplier">Source / Supplier *</label>
            <select
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="Koperasi Pekebun Koko Tawau">
                Koperasi Pekebun Koko Tawau
              </option>
              <option value="Ladang Kiulu">Ladang Kiulu</option>
              <option value="Pusat Koko Ranau">Pusat Koko Ranau</option>
              <option value="Ladang Sebatik Timur">Ladang Sebatik Timur</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Assessment Date *</label>
            <input
              id="date"
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              rows="3"
              placeholder="e.g. sample condition, delivery details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="save-btn">
            Save & Continue &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}

export default BatchWizard1;