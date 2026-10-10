function Settings() {
  return (
    <main className="main">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your CyberShield account and preferences.</p>
      </div>

      <div className="panel">
        <h2>Account Settings</h2>

        <div className="setting-row">
          <div>
            <strong>Profile</strong>
            <p>Manage your citizen profile information.</p>
          </div>

          <button className="text-btn">Edit</button>
        </div>

        <div className="setting-row">
          <div>
            <strong>Notifications</strong>
            <p>Manage security alerts and notifications.</p>
          </div>

          <button className="text-btn">Manage</button>
        </div>

        <div className="setting-row">
          <div>
            <strong>Privacy & Security</strong>
            <p>Manage your privacy and security preferences.</p>
          </div>

          <button className="text-btn">Manage</button>
        </div>
      </div>
    </main>
  );
}

export default Settings;