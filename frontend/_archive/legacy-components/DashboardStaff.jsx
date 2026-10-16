import React from 'react';

function DashboardStaff({ batches = [], onNewAssessment, onLogout, onSelectBatch }) {
  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. Scrollable Content Area */}
      <div 
        className="dashboard-container p-4" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: '70px', /* Reserve exact height for the nav bar */
          overflowY: 'auto'
        }}
      >
        {/* Top Header */}
        <header className="dashboard-header mb-4 flex items-center justify-between">
          <div className="header-brand">
            <strong className="text-amber-950">CocoaCheck Sabah</strong>
          </div>
          <div className="header-status flex items-center gap-2">
            <span className="status-badge rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
              ONLINE
            </span>
            <button
              type="button"
              className="icon-btn cursor-pointer border-none bg-transparent"
              onClick={onLogout}
              title="Logout"
            >
              🔒
            </button>
          </div>
        </header>

        {/* Greeting */}
        <section className="greeting-section mb-4">
          <span className="current-date block text-xs text-gray-500">
            THURSDAY, 1 OCTOBER 2026
          </span>
          <h2 className="text-xl font-bold text-amber-950">
            Good morning, Aisyah
          </h2>
        </section>

        {/* Metrics Grid */}
        <section className="metrics-grid mb-6 grid grid-cols-3 gap-2">
          <div className="metric-card rounded-lg bg-white p-3 text-center shadow-sm">
            <span className="metric-label block text-xs text-gray-500">
              Total Assessments
            </span>
            <span className="metric-value text-lg font-bold text-amber-950">
              {40 + batches.length}
            </span>
          </div>
          <div className="metric-card rounded-lg bg-white p-3 text-center shadow-sm">
            <span className="metric-label block text-xs text-gray-500">
              Drafts
            </span>
            <span className="metric-value text-lg font-bold text-amber-950">
              {batches.length}
            </span>
          </div>
          <div className="metric-card rounded-lg bg-white p-3 text-center shadow-sm">
            <span className="metric-label block text-xs text-gray-500">
              Completed
            </span>
            <span className="metric-value text-lg font-bold text-amber-950">
              11
            </span>
          </div>
        </section>

        {/* Dynamic Card List */}
        <section className="dashboard-section pb-4">
          <div className="section-header mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-950">
              Continue where you left off
            </h3>
            <span className="count-badge text-xs text-gray-500">
              {batches.length} pending
            </span>
          </div>

          <div className="card-list space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="draft-card cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                onClick={() => onSelectBatch && onSelectBatch(batch)}
              >
                <div className="card-top mb-1 flex items-center justify-between">
                  <strong className="text-amber-950">{batch.id}</strong>
                  <span className="status-tag draft rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    Draft
                  </span>
                </div>
                <p className="location-name mb-2 text-sm text-gray-600">
                  {batch.supplier}
                </p>
                <div className="progress-bar-bg mb-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="progress-bar-fill h-full bg-amber-700"
                    style={{ width: batch.progress }}
                  ></div>
                </div>
                <span className="progress-label text-xs text-gray-400">
                  Step {batch.step} • {batch.progress}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 2. Navigation Bar (Pinned to the absolute bottom edge) */}
      <nav 
        className="bottom-nav border-t border-[#e9e4dc] bg-white px-2"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          zIndex: 10
        }}
      >
        <button type="button" className="nav-item flex flex-col items-center text-xs font-semibold text-amber-900">
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button type="button" className="nav-item flex flex-col items-center text-xs text-gray-400">
          <span>📜</span>
          <small>History</small>
        </button>

        {/* Floating Action Button */}
        <button
          type="button"
          className="nav-fab -mt-7 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#5a3825] text-2xl text-white shadow-md transition-transform hover:scale-105"
          onClick={onNewAssessment}
          title="New Batch Intake"
        >
          +
        </button>

        <button type="button" className="nav-item flex flex-col items-center text-xs text-gray-400">
          <span>📊</span>
          <small>Reports</small>
        </button>
        <button type="button" className="nav-item flex flex-col items-center text-xs text-gray-400">
          <span>👤</span>
          <small>Profile</small>
        </button>
      </nav>
    </div>
  );
}

export default DashboardStaff;