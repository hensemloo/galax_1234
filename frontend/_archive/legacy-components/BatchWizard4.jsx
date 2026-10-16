//just placeholder for now, will be used in the future

import React from 'react';

function BatchWizard4({ batchId = 'CB-046', onNext, onBack, onCancel }) {
  return (
    <div className="wizard-step-container">
      <div className="wizard-card-mobile">
        <div className="mobile-header">
          <button className="icon-btn-back" onClick={onBack}>←</button>
          <h2 className="mobile-title">Manual Quality Check</h2>
          <button className="icon-btn-close" onClick={onCancel}>✕</button>
        </div>

        <div className="mobile-progress-row">
          <div className="step-info">
            <span className="step-tag">STEP 4 OF 6</span>
            <span className="batch-pill">{batchId}</span>
          </div>
          <span className="percent-tag">66% complete</span>
        </div>

        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: '66%' }}></div>
        </div>

        <div className="guidelines-card">
          <h3 className="guidelines-title">Physical Sample Inspection</h3>
          <p className="guidelines-sub">Confirm bean cut test parameters</p>
          <div className="wizard-form">
            <div className="form-group">
              <label>Moisture Content (%)</label>
              <input type="number" defaultValue="7.5" readOnly />
            </div>
            <div className="form-group">
              <label>Bean Count (per 100g)</label>
              <input type="number" defaultValue="98" readOnly />
            </div>
          </div>
        </div>

        <div className="mobile-footer">
          <button className="btn-primary-block" onClick={() => onNext({ step4Completed: true })}>
            Proceed to Grading &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchWizard4;