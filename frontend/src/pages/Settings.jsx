
import { useState } from "react";

const settingsItems = [
  {
    icon: "👤",
    title: "Profile",
    description: "Manage your citizen profile information.",
    button: "Edit profile",
  },
  {
    icon: "🔔",
    title: "Notifications",
    description: "Manage security alerts and notification preferences.",
    button: "Manage",
  },
  {
    icon: "🛡️",
    title: "Privacy & Security",
    description: "Review your privacy and account security preferences.",
    button: "Manage",
  },
];

function Settings() {
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <main className="main settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your CyberShield account and preferences.</p>
      </div>

      <section className="settings-intro">
        <div className="settings-intro-icon">⚙️</div>
        <div>
          <h2>Account preferences</h2>
          <p>
            Customize your experience and review your security preferences.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <h2>Account Settings</h2>
          <p>Manage your account and security options.</p>
        </div>

        <div className="settings-grid">
          {settingsItems.map((item) => (
            <article className="setting-card" key={item.title}>
              <div className="setting-card-icon">{item.icon}</div>

              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <button
                className="setting-action-btn"
                onClick={() => setSelectedSetting(item.title)}
              >
                {item.button} <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="settings-section notification-settings">
        <div>
          <h2>Security Notifications</h2>
          <p>
            Control whether this interface displays your notification
            preference as enabled or disabled.
          </p>
        </div>

        <button
          type="button"
          className={`notification-toggle ${
            notificationsEnabled ? "enabled" : ""
          }`}
          onClick={() =>
            setNotificationsEnabled((previous) => !previous)
          }
          aria-pressed={notificationsEnabled}
        >
          <span className="toggle-knob" />
          {notificationsEnabled ? "Enabled" : "Disabled"}
        </button>
      </section>

      {selectedSetting && (
        <div className="settings-modal-overlay">
          <div
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
          >
            <button
              className="settings-modal-close"
              onClick={() => setSelectedSetting(null)}
              aria-label="Close dialog"
            >
              ×
            </button>

            <div className="settings-modal-icon">⚙️</div>
            <h2 id="settings-modal-title">{selectedSetting}</h2>
            <p>
              This section is ready for integration with your account
              settings and backend.
            </p>

            <button
              className="setting-action-btn modal-done-btn"
              onClick={() => setSelectedSetting(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Settings;
