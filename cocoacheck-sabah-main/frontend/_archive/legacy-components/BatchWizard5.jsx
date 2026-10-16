//just placeholder for now, will be used in the future

import React from 'react';

function BatchWizard5({ batchId = 'CB-046', onNext, onBack, onCancel }) {
  return (
    <div className="wizard-step-container">
      <div className="wizard-card-mobile">
        <div className="mobile-header">
          <button className="icon-btn-back" onClick={onBack}>←</button>
          <h2 className="mobile-title">Grade Assignment</h2>
          <button className="icon-btn-close" onClick={onCancel}>✕</button>
        </div>

        <div className="mobile-progress-row">
          <div className="step-info">
            <span className="step-tag">STEP 5 OF 6</span>
            <span className="batch-pill">{batchId}</span>
          </div>
          <span className="percent-tag">83% complete</span>
        </div>

        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: '83%' }}></div>
        </div>

        <div className="guidelines-card">
          <h3 className="guidelines-title">Recommended Grade</h3>
          <p className="guidelines-sub">Based on AI screening and moisture metrics</p>
          <h1 style={{ textAlign: 'center', color: '#4a2e1f', margin: '16px 0' }}>GRADE A</h1>
          <p className="subtitle" style={{ textAlign: 'center' }}>Meets export quality standard</p>
        </div>

        <div className="mobile-footer">
          <button className="btn-primary-block" onClick={() => onNext({ grade: 'Grade A' })}>
            Review & Finalize &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchWizard5;