//just placeholder for now, will be used in the future

import React from 'react';

function BatchWizard6({ batchId = 'CB-046', onNext, onBack, onCancel }) {
  return (
    <div className="wizard-step-container">
      <div className="wizard-card-mobile">
        <div className="mobile-header">
          <button className="icon-btn-back" onClick={onBack}>←</button>
          <h2 className="mobile-title">Final Assessment</h2>
          <button className="icon-btn-close" onClick={onCancel}>✕</button>
        </div>

        <div className="mobile-progress-row">
          <div className="step-info">
            <span className="step-tag">STEP 6 OF 6</span>
            <span className="batch-pill">{batchId}</span>
          </div>
          <span className="percent-tag">100% complete</span>
        </div>

        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: '100%' }}></div>
        </div>

        <div className="guidelines-card">
          <h3 className="guidelines-title">Ready to Submit</h3>
          <p className="guidelines-sub">Batch report will be generated and saved to the dashboard.</p>
          <ul className="guidelines-list">
            <li><span>✔️️</span> Traceability data recorded</li>
            <li><span>✔️</span> AI defect analysis attached</li>
            <li><span>✔️</span> Grade assigned</li>
          </ul>
        </div>

        <div className="mobile-footer">
          <button className="btn-primary-block" onClick={() => onNext({ status: 'Completed' })}>
            Finish & Save Batch
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchWizard6;