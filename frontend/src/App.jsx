import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timesheet from './pages/Timesheet';
import Leave from './pages/Leave';
import { getAuthUser, isAuthenticated, logout } from './lib/auth';
import AppSidebar from './components/AppSidebar';
import AppTopbar from './components/AppTopbar';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppShell() {
  const user = getAuthUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <AppSidebar onLogout={handleLogout} />

      <div className="workspace">
        <AppTopbar title={user?.fullName ? `Welcome, ${user.fullName}` : user?.username ? `Welcome, ${user.username}` : 'Welcome'} />

        <main className="workspace-body">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timesheet" element={<Timesheet />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
