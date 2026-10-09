function ScanHistory() {
  return (
    <main className="main">
      <div className="page-header">
        <h1>Scan History</h1>
        <p>View your previous security scans.</p>
      </div>

      <div className="panel">
        <h2>Recent Scans</h2>

        <div className="activity">
          <div className="activity-icon safe">✓</div>

          <div>
            <strong>google.com</strong>
            <span>URL scanned</span>
          </div>

          <small>Safe</small>
        </div>

        <div className="activity">
          <div className="activity-icon danger">!</div>

          <div>
            <strong>Unknown website</strong>
            <span>URL scanned</span>
          </div>

          <small>Threat</small>
        </div>

        <div className="activity">
          <div className="activity-icon safe">✓</div>

          <div>
            <strong>Bank message</strong>
            <span>Message scanned</span>
          </div>

          <small>Safe</small>
        </div>
      </div>
    </main>
  );
}

export default ScanHistory;