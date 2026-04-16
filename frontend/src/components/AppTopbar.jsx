import { getAuthUser } from '../lib/auth';

function formatTodayLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());
}

function getInitials(username) {
  const value = String(username || 'employee').replace(/[^a-zA-Z]+/g, ' ').trim();
  if (!value) {
    return 'E';
  }

  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function AppTopbar({ title }) {
  const user = getAuthUser();
  const initials = getInitials(user?.username);

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="topbar-eyebrow">Executive Atelier</span>
        <h2>{title}</h2>
      </div>

      <div className="topbar-meta">
        <div className="topbar-chip topbar-chip-soft">
          <span className="material-symbols-outlined" aria-hidden="true">
            calendar_month
          </span>
          {formatTodayLabel()}
        </div>
        <div className="topbar-chip topbar-chip-icon">
          <span className="material-symbols-outlined" aria-hidden="true">
            notifications
          </span>
        </div>
        <div className="topbar-avatar" aria-label="Signed in user">
          {initials}
        </div>
      </div>
    </header>
  );
}
