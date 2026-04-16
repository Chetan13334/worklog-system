import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { getAuthUser } from '../lib/auth';

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatClock(dateLike) {
  if (!dateLike) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(dateLike));
}

function formatLongDate(date = new Date()) {
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  const dayNumber = date.getDate();
  const suffix = dayNumber % 10 === 1 && dayNumber !== 11 ? 'st' : dayNumber % 10 === 2 && dayNumber !== 12 ? 'nd' : dayNumber % 10 === 3 && dayNumber !== 13 ? 'rd' : 'th';
  return `${day}, ${month} ${dayNumber}${suffix}`;
}

function formatDuration(hours) {
  const totalMinutes = Math.max(0, Math.round((hours || 0) * 60));
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad(wholeHours)}:${pad(minutes)}`;
}

function formatLiveDuration(start, end = Date.now()) {
  if (!start) {
    return '00:00:00';
  }

  const startTime = new Date(start).getTime();
  const endTime = typeof end === 'number' ? end : new Date(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime < startTime) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor((endTime - startTime) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function startOfWeek(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfWeek(date = new Date()) {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

function getDisplayName(username) {
  if (!username) {
    return 'Julian';
  }

  const cleaned = String(username)
    .replace(/[_.-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .trim();

  if (!cleaned) {
    return 'Julian';
  }

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toDateKey(dateLike) {
  if (!dateLike) {
    return '';
  }

  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function getWeekDays(referenceDate = new Date()) {
  const monday = startOfWeek(referenceDate);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function ActivityItem({ icon, title, meta }) {
  return (
    <li className="activity-item">
      <span className="activity-icon">
        <span className="material-symbols-outlined" aria-hidden="true">
          {icon}
        </span>
      </span>
      <div>
        <strong>{title}</strong>
        <p>{meta}</p>
      </div>
    </li>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const [today, setToday] = useState(null);
  const [weekRecords, setWeekRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [clockNow, setClockNow] = useState(Date.now());

  const loadDashboard = async () => {
    setLoading(true);
    setMessage('');

    try {
      const weekStart = startOfWeek();
      const weekEnd = endOfWeek();
      const [todayResponse, weekResponse, leaveResponse] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance', {
          params: {
            from: weekStart.toISOString().slice(0, 10),
            to: weekEnd.toISOString().slice(0, 10)
          }
        }),
        api.get('/leave')
      ]);

      setToday(todayResponse.data);
      setWeekRecords(weekResponse.data?.records || []);
      setLeaves(leaveResponse.data?.records || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (today?.status !== 'checked_in' || !today?.attendance?.checkInAt) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setClockNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [today?.status, today?.attendance?.checkInAt]);

  const status = today?.status || 'not_checked_in';
  const attendance = today?.attendance;
  const statusLabel =
    status === 'checked_out' ? 'Checked out' : status === 'checked_in' ? 'Checked in' : 'Not checked in';

  const displayName = getDisplayName(user?.username);
  const todayLabel = formatLongDate(new Date());

  const sessionHours = useMemo(() => {
    if (!attendance?.checkInAt) {
      return '00:00:00';
    }

    const endTime = status === 'checked_in' ? clockNow : new Date(attendance.checkOutAt || clockNow).getTime();
    return formatLiveDuration(attendance.checkInAt, endTime);
  }, [attendance?.checkInAt, attendance?.checkOutAt, clockNow, status]);

  const weeklyHours = useMemo(
    () => weekRecords.reduce((total, record) => total + Number(record.totalHours || 0), 0),
    [weekRecords]
  );

  const weeklyChart = useMemo(() => {
    const recordMap = new Map(
      weekRecords.map((record) => [toDateKey(record.attendanceDate), Number(record.totalHours || 0)])
    );
    const days = getWeekDays();
    const todayKey = toDateKey(new Date());
    const values = days.map((date) => recordMap.get(toDateKey(date)) || 0);
    const maxValue = Math.max(1, ...values);

    return days.map((date, index) => ({
      key: toDateKey(date),
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      value: values[index],
      height: Math.max(8, (values[index] / maxValue) * 100),
      isToday: toDateKey(date) === todayKey,
      isFuture: toDateKey(date) > todayKey
    }));
  }, [weekRecords]);

  const weeklyTarget = 40;
  const weeklyProgress = Math.min(1, weeklyHours / weeklyTarget);
  const leaveBalance = Math.max(0, 12 - leaves.filter((leave) => leave.status === 'approved').length);

  const latestLeave = leaves[0];
  const recentActivities = [
    {
      icon: status === 'checked_in' ? 'radio_button_checked' : status === 'checked_out' ? 'task_alt' : 'login',
      title:
        status === 'checked_out'
          ? 'Checked out'
          : status === 'checked_in'
            ? 'Checked in'
            : 'Ready to start'
      ,
      meta:
        status === 'checked_out'
          ? `${formatClock(attendance?.checkOutAt)} today`
          : status === 'checked_in'
            ? `Since ${formatClock(attendance?.checkInAt)} today`
            : 'No attendance recorded yet'
    },
    {
      icon: 'schedule',
      title: 'Session token',
      meta: localStorage.getItem('attendance_token') ? 'Active and refreshing on use' : 'Missing'
    },
    latestLeave
      ? {
          icon: 'event_available',
          title: `Leave ${String(latestLeave.status || 'pending')}`,
          meta: `${latestLeave.leaveType || 'Leave'} from ${latestLeave.startDate} to ${latestLeave.endDate}`
        }
      : {
          icon: 'event_available',
          title: 'Leave requests',
          meta: 'No leave requests submitted yet'
        }
  ];

  const handleAction = async (path) => {
    setMessage('');
    setBusyAction(path);

    try {
      const { data: response } = await api.post(path);
      setToday((current) => ({
        ...current,
        status: path === '/checkin' ? 'checked_in' : 'checked_out',
        attendance: response.attendance
      }));
      setMessage(response.message);
      setClockNow(Date.now());
      await loadDashboard();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Action failed.');
      await loadDashboard();
    } finally {
      setBusyAction('');
    }
  };

  const primaryAction = status === 'checked_in' ? '/checkout' : '/checkin';
  const primaryLabel = loading
    ? 'Loading...'
    : status === 'checked_in'
      ? busyAction === '/checkout'
        ? 'Checking out...'
        : 'Check Out Now'
      : busyAction === '/checkin'
        ? 'Checking in...'
        : 'Check In Now';

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Hello, {displayName}.</h1>
          <p>
            Today is {todayLabel}. {status === 'checked_in' ? 'You are actively on the clock.' : 'Ready for a productive session?'}
          </p>
        </div>

        <div className="dashboard-header-meta">
          <div className="occupancy-pill">
            <span className="status-dot" />
            <div>
              <span>Office Occupancy</span>
              <strong>14 colleagues in studio</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <div className="dashboard-column dashboard-column-main">
          <section className="session-card">
            <div className="session-card-top">
              <span className="card-kicker">Current Session</span>
              <button className="session-icon-button" type="button" onClick={loadDashboard}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  fingerprint
                </span>
              </button>
            </div>

            <div className="session-time">
              {sessionHours}
              <span>hrs</span>
            </div>

            <p className="session-status">
              <span className="status-dot status-dot-large" />
              {status === 'checked_in'
                ? `Checked in since ${formatClock(attendance?.checkInAt)}`
                : status === 'checked_out'
                  ? `Checked out at ${formatClock(attendance?.checkOutAt)}`
                  : 'Not checked in yet'}
            </p>

            <div className="session-actions">
              <button
                className="button"
                type="button"
                onClick={() => handleAction(primaryAction)}
                disabled={loading || busyAction === primaryAction}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {status === 'checked_in' ? 'logout' : 'login'}
                </span>
                {primaryLabel}
              </button>
              <button className="button button-secondary" type="button" onClick={() => navigate('/leave')}>
                Take a Break
              </button>
            </div>

            {message ? <div className={message.toLowerCase().includes('success') ? 'success' : 'error'}>{message}</div> : null}
          </section>

          <section className="pulse-card">
            <div className="card-heading-row">
              <div>
                <span className="card-kicker">Weekly Pulse</span>
                <h3>Your productivity rhythm over the last 7 days</h3>
              </div>
              <div className="card-nav-buttons">
                <button type="button" aria-label="Previous week">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_left
                  </span>
                </button>
                <button type="button" aria-label="Next week">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            <div className="pulse-graph">
              <div className="pulse-grid" aria-hidden="true" />
              <div className="pulse-bars" aria-label="Weekly productivity rhythm">
                {weeklyChart.map((day) => (
                  <div
                    className={`pulse-bar${day.isToday ? ' active' : ''}${day.isFuture ? ' disabled' : ''}`}
                    key={day.key}
                  >
                    <div className="pulse-bar-track">
                      <div className="pulse-bar-fill" style={{ height: `${day.height}%` }} />
                    </div>
                    <span className="pulse-bar-value">{day.isFuture ? 'Future' : day.value ? `${day.value.toFixed(1)}h` : '0h'}</span>
                    <span className="pulse-bar-label">{day.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pulse-days">
              <span>Weekdays update from attendance records</span>
            </div>
          </section>

          <section className="collab-card">
            <div className="collab-copy">
              <span className="card-kicker">Team Spotlight</span>
              <h3>Collaborating with the Design Team today?</h3>
              <p>
                A few members of your core squad are currently active in the Creative Suite.
              </p>
              <div className="collab-avatars" aria-label="Team members">
                <span>AM</span>
                <span>SK</span>
                <span>JR</span>
                <span>+2</span>
              </div>
            </div>

            <div className="collab-visual" role="img" aria-label="Modern office interior" />
          </section>
        </div>

        <aside className="dashboard-column dashboard-column-side">
          <section className="mini-card mini-card-chart">
            <span className="card-kicker">Total This Week</span>
            <div className="mini-hours">
              <strong>{weeklyHours.toFixed(1)}</strong>
              <span>/ {weeklyTarget.toFixed(1)} hrs</span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${Math.max(8, weeklyProgress * 100)}%` }} />
            </div>
          </section>

          <section className="mini-card leave-balance-card">
            <span className="card-kicker">Leave Balance</span>
            <div className="leave-balance-value">
              <strong>{leaveBalance} Days</strong>
              <span>Available for Q4</span>
            </div>
            <button className="button button-light" type="button" onClick={() => navigate('/leave')}>
              Request Time Off
            </button>
          </section>

          <section className="mini-card activity-card">
            <span className="card-kicker">Recent Activity</span>
            <ul className="activity-list activity-list-tight">
              {recentActivities.map((item) => (
                <ActivityItem key={`${item.title}-${item.meta}`} {...item} />
              ))}
            </ul>
            <button className="activity-link" type="button" onClick={() => navigate('/timesheet')}>
              View all logs
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}
