import { NavLink } from 'react-router-dom';
import { getAuthUser } from '../lib/auth';

function SidebarLink({ to, icon, children }) {
  return (
    <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} to={to}>
      <span className="material-symbols-outlined" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </NavLink>
  );
}

export default function AppSidebar({ onLogout }) {
  const user = getAuthUser();

  return (
    <aside className="sidebar">
     

      <div className="sidebar-card">
        <span className="sidebar-kicker">Signed In</span>
        <strong>{user?.fullName || user?.username || 'employee'}</strong>
        <span>Session active</span>
      </div>

      <nav className="sidebar-nav">
        <SidebarLink to="/dashboard" icon="dashboard">
          Dashboard
        </SidebarLink>
        <SidebarLink to="/timesheet" icon="event_note">
          Timesheet
        </SidebarLink>
        <SidebarLink to="/leave" icon="event_available">
          Apply Leave
        </SidebarLink>
      </nav>

      <button className="sidebar-logout" type="button" onClick={onLogout}>
        <span className="material-symbols-outlined" aria-hidden="true">
          logout
        </span>
        Logout
      </button>
    </aside>
  );
}
