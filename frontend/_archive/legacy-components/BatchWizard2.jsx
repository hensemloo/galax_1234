import { useState, useEffect } from "react";

function BatchWizard2({
  batchId = "CB-046",
  initialData = {},
  onNext,
  onBack,
  onCancel,
}) {
  const [selectedImage, setSelectedImage] = useState(
    initialData.sampleImage || null
  );

  // Sync state if user navigates back to Step 2 with existing data
  useEffect(() => {
    if (initialData.sampleImage) {
      setSelectedImage(initialData.sampleImage);
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleDummyUpload = () => {
    // Fallback/Mock image for rapid demo testing
    setSelectedImage(
      "https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=500&auto=format&fit=crop"
    );
  };

  const handleNext = () => {
    if (selectedImage && onNext) {
      onNext({ sampleImage: selectedImage });
    }
  };

  return (
    <div
      className="app-viewport"
      style={{
        height: "100%",
        width: "100%",
        maxHeight: "720px",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        className="wizard-card"
        style={{
          padding: "20px",
          paddingBottom: "40px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          minHeight: "min-content",
        }}
      >
        {/* HEADER BAR */}
        <div className="mobile-header">
          <button className="icon-btn-back" type="button" onClick={onBack}>
            ←
          </button>
          <button className="icon-btn-close" type="button" onClick={onCancel}>
            ✕
          </button>
        </div>

        {/* PROGRESS METRICS */}
        <div className="mobile-progress-row" style={{ marginTop: "12px" }}>
          <div className="step-info">
            <span className="step-tag">STEP 2 OF 6</span>
            <span className="batch-pill">{batchId}</span>
          </div>
          <span className="percent-tag">33% complete</span>
        </div>

        <div className="progress-bar-bg" style={{ marginBottom: "16px" }}>
          <div className="progress-bar-fill" style={{ width: "33%" }}></div>
        </div>

        <h2>Upload Image</h2>
        <p className="subtitle">
          Follow standard procedure for accurate AI defect screening.
        </p>

        {/* GUIDELINES CARD */}
        <div
          className="guidelines-card"
          style={{
            background: "#f8f9fa",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          <ul
            className="guidelines-list"
            style={{
              listStyle: "none",
              padding: 0,
              fontSize: "13px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <li>✔️ Use a plain, light background</li>
            <li>☀️ Even lighting, no harsh shadows</li>
            <li>░ Spread cocoa beans out, not overlapping</li>
            <li>⛶ Fit the full 100g sample in the frame</li>
          </ul>
        </div>

        {/* IMAGE PREVIEW FRAME */}
        <div
          className="image-frame"
          style={{
            width: "100%",
            height: "180px",
            border: "2px dashed #ccc",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor: "#fafafa",
            marginBottom: "16px",
          }}
        >
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Cocoa Sample Tray"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#888", fontSize: "14px" }}>
              Sample reference frame (100g tray)
            </span>
          )}
        </div>

        {/* UPLOAD BUTTONS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {/* CAMERA CAPTURE BUTTON WITH FALLBACK */}
          <label
            className="save-btn"
            style={{
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#212529",
            }}
          >
            📷 Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          {/* GALLERY PICKER */}
          <label
            className="save-btn"
            style={{
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#6c757d",
            }}
          >
            🖼️ Choose from Gallery
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          {/* DEMO PRESET BUTTON */}
          <button
            type="button"
            onClick={handleDummyUpload}
            style={{
              background: "none",
              border: "none",
              color: "#0d6efd",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Use sample test image
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: "1",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <button
            type="button"
            className="save-btn"
            style={{
              flex: "2",
              opacity: !selectedImage ? 0.5 : 1,
              cursor: !selectedImage ? "not-allowed" : "pointer",
            }}
            disabled={!selectedImage}
            onClick={handleNext}
          >
            Analyze Image →
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchWizard2;