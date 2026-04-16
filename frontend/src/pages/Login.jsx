import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { isAuthenticated, saveAuth } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    department: '',
    designation: '',
    password: '',
    confirmPassword: '',
    remember: false,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const canSubmit = useMemo(
    () => {
      if (mode === 'register') {
        return (
          form.fullName.trim() &&
          form.username.trim() &&
          form.email.trim() &&
          form.department.trim() &&
          form.designation.trim() &&
          form.password.trim() &&
          form.confirmPassword.trim() &&
          !loading
        );
      }

      return form.username.trim() && form.password.trim() && !loading;
    },
    [
      mode,
      form.fullName,
      form.username,
      form.email,
      form.department,
      form.designation,
      form.password,
      form.confirmPassword,
      loading
    ]
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password are required.');
      return;
    }

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post(mode === 'register' ? '/register' : '/login', {
        username: form.username,
        password: form.password,
        fullName: form.fullName,
        email: form.email,
        department: form.department,
        designation: form.designation,
        isActive: form.isActive
      });

      if (mode === 'register') {
        setSuccess('Account created successfully. Please log in.');
        setMode('login');
        setForm((current) => ({
          ...current,
          fullName: '',
          password: '',
          confirmPassword: '',
          remember: false,
          email: '',
          department: '',
          designation: '',
          isActive: true
        }));
        return;
      }

      saveAuth(data.token, data.user);
      if (!form.remember) {
        sessionStorage.setItem('attendance_session_only', '1');
      } else {
        sessionStorage.removeItem('attendance_session_only');
      }
      navigate('/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell">
      <main className="card">
        <section className="hero-panel">
          <div className="brand">
            <h1>Attendance Portal</h1>
            <p>Employee access</p>
          </div>

          <div className="hero-copy">
            <h2>Secure access for daily attendance and leave management.</h2>
            <p>
              A focused workspace to sign in, record time, review timesheets, and submit leave requests
              with session protection on the backend.
            </p>
            <div className="hero-meta">
              <div className="hero-line" />
              <span>15 minute inactivity timeout</span>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true" />
        </section>

        <section className="form-panel">
          <div key={mode} className={`form-wrap mode-${mode}`}>
            <div className="mobile-brand">
              <div className="brand">
                <h1>Attendance Portal</h1>
                <p>Employee access</p>
              </div>
            </div>

            <h3 className="title">{mode === 'register' ? 'Create Account' : 'Secure Access'}</h3>
            <p className="subtitle">
              {mode === 'register'
                ? 'Create a new employee account with profile details.'
                : 'Enter your username and password to continue to the dashboard.'}
            </p>

            <form onSubmit={handleSubmit}>
              {mode === 'register' ? (
                <div className="field">
                  <label htmlFor="fullName">Full Name</label>
                  <div className="input-shell">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Julian Smith"
                      value={form.fullName}
                      onChange={handleChange}
                    />
                    <span className="material-symbols-outlined input-icon" aria-hidden="true">
                      badge
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="field">
                <label htmlFor="username">Corporate ID</label>
                <div className="input-shell">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. employee"
                    value={form.username}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined input-icon" aria-hidden="true">
                    person
                  </span>
                </div>
              </div>

              {mode === 'register' ? (
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <div className="input-shell">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    <span className="material-symbols-outlined input-icon" aria-hidden="true">
                      mail
                    </span>
                  </div>
                </div>
              ) : null}

              {mode === 'register' ? (
                <div className="field">
                  <label htmlFor="department">Department</label>
                  <div className="input-shell">
                    <input
                      id="department"
                      name="department"
                      type="text"
                      placeholder="e.g. HR"
                      value={form.department}
                      onChange={handleChange}
                    />
                    <span className="material-symbols-outlined input-icon" aria-hidden="true">
                      apartment
                    </span>
                  </div>
                </div>
              ) : null}

              {mode === 'register' ? (
                <div className="field">
                  <label htmlFor="designation">Designation</label>
                  <div className="input-shell">
                    <input
                      id="designation"
                      name="designation"
                      type="text"
                      placeholder="e.g. HR Executive"
                      value={form.designation}
                      onChange={handleChange}
                    />
                    <span className="material-symbols-outlined input-icon" aria-hidden="true">
                      work
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="field">
                <div className="row">
                  <label htmlFor="password">{mode === 'register' ? 'New Password' : 'Key Access'}</label>
                  {mode === 'login' ? (
                    <a className="link" href="#">
                      Reset Credentials
                    </a>
                  ) : null}
                </div>
                <div className="input-shell">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <span className="material-symbols-outlined input-icon" aria-hidden="true">
                    lock
                  </span>
                </div>
              </div>

              {mode === 'register' ? (
                <div className="field">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-shell">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                    <span className="material-symbols-outlined input-icon" aria-hidden="true">
                      lock
                    </span>
                  </div>
                </div>
              ) : null}

              {mode === 'register' ? (
                <label className="check">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  Active account
                </label>
              ) : null}

              <label className="check">
                <input
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                onChange={handleChange}
              />
                Maintain persistent session
              </label>

              {error ? <div className="error">{error}</div> : null}
              {success ? <div className="success">{success}</div> : null}

              <div style={{ paddingTop: 18 }}>
                <button className="button" type="submit" disabled={!canSubmit}>
                  <span>
                    {loading
                      ? mode === 'register'
                        ? 'Creating Account...'
                        : 'Authorizing...'
                      : mode === 'register'
                        ? 'Create Account'
                        : 'Authorize Entrance'}
                  </span>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>

            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <button
                type="button"
                className="link"
                style={{ border: 0, background: 'transparent', cursor: 'pointer' }}
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setMode((current) => (current === 'login' ? 'register' : 'login'));
                  setForm((current) => ({
                    ...current,
                    password: '',
                    confirmPassword: ''
                  }));
                }}
              >
                {mode === 'login' ? 'Create a new account' : 'Back to login'}
              </button>
            </div>

            <footer className="footer">
              <p>Security Protocol EN-204</p>
              <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Compliance</a>
                <a href="#">Support</a>
              </div>
            </footer>
          </div>
        </section>
      </main>

      <button className="fab" type="button" aria-label="Help">
        ?
      </button>
    </div>
  );
}
