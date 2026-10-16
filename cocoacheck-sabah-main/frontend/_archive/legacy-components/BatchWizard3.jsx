import { useState, useEffect } from "react";

function BatchWizard3({
  batchId = "CB-046",
  initialData = {},
  onNext,
  onBack,
  onCancel,
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Simulate AI analysis loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (onNext) {
      onNext({
        aiScreeningCompleted: true,
        aiBeanCount: 124,
        aiQualityScore: "Good",
      });
    }
  };

  return (
    <div className="app-viewport">
      <div className="wizard-card">
        {/* HEADER BAR */}
        <div className="mobile-header">
          <button className="icon-btn-back" type="button" onClick={onBack}>
            ←
          </button>
          <h2>AI Screening</h2>
          <button className="icon-btn-close" type="button" onClick={onCancel}>
            ✕
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="mobile-progress-row" style={{ marginTop: "12px" }}>
          <div className="step-info">
            <span className="step-tag">STEP 3 OF 6</span>
            <span className="batch-pill">{batchId}</span>
          </div>
          <span className="percent-tag">50% complete</span>
        </div>

        <div className="progress-bar-bg" style={{ marginBottom: "16px" }}>
          <div className="progress-bar-fill" style={{ width: "50%" }}></div>
        </div>

        {/* STATUS BAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: "#6c757d",
            fontWeight: "600",
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>🔄</span>
          <span>{isAnalyzing ? "Processing image via Neural Vision API" : "Analysis Complete"}</span>
        </div>

        {/* AI IMAGE ANALYZING CARD / PREVIEW */}
        <div
          style={{
            width: "100%",
            height: "200px",
            backgroundColor: "#a8a29e",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            textAlign: "center",
            padding: "20px",
            marginBottom: "16px",
            position: "relative",
          }}
        >
          {isAnalyzing ? (
            <>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                  color: "#d97706",
                  fontSize: "20px",
                }}
              >
                🔄
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 6px 0" }}>
                Analyzing cocoa beans...
              </h3>
              <p style={{ fontSize: "12px", color: "#e7e5e4", margin: 0, maxWidth: "240px" }}>
                This may take a few seconds. Neural model evaluating count, surface uniformness and defects.
              </p>
              <div
                className="progress-bar-bg"
                style={{ width: "60%", marginTop: "16px", height: "4px", backgroundColor: "rgba(255,255,255,0.3)" }}
              >
                <div
                  className="progress-bar-fill"
                  style={{ width: "45%", backgroundColor: "#d97706", height: "100%" }}
                ></div>
              </div>
            </>
          ) : (
            <>
              {initialData.sampleImage ? (
                <img
                  src={initialData.sampleImage}
                  alt="Analyzed cocoa beans"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px" }}
                />
              ) : (
                <div>
                  <span style={{ fontSize: "28px" }}>✅</span>
                  <p style={{ marginTop: "8px", fontSize: "14px", fontWeight: "600" }}>Analysis Finished</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* RESULTS SKELETON / SUMMARY CARD */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "16px",
            backgroundColor: "#ffffff",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {isAnalyzing ? (
            // Placeholder skeletons
            <>
              <div style={{ height: "16px", width: "40%", backgroundColor: "#e5e7eb", borderRadius: "4px" }}></div>
              <div style={{ height: "36px", width: "100%", backgroundColor: "#f3f4f6", borderRadius: "8px" }}></div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ height: "50px", flex: 1, backgroundColor: "#f3f4f6", borderRadius: "8px" }}></div>
                <div style={{ height: "50px", flex: 1, backgroundColor: "#f3f4f6", borderRadius: "8px" }}></div>
                <div style={{ height: "50px", flex: 1, backgroundColor: "#f3f4f6", borderRadius: "8px" }}></div>
              </div>
            </>
          ) : (
            // Formatted AI output details
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#6c757d" }}>Detected Bean Count:</span>
                <strong>124 beans</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#6c757d" }}>Uniformity Score:</span>
                <strong>88%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "#6c757d" }}>Estimated Defect Rate:</span>
                <strong style={{ color: "#28a745" }}>Low (&lt; 3%)</strong>
              </div>
            </>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            type="button"
            className="save-btn"
            disabled={isAnalyzing}
            onClick={handleContinue}
            style={{
              opacity: isAnalyzing ? 0.6 : 1,
              cursor: isAnalyzing ? "not-allowed" : "pointer",
            }}
          >
            Continue to Measurements &rarr;
          </button>

          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#4b5563",
              fontSize: "13px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            🔄 Re-upload image
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchWizard3;