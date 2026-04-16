import { useState } from 'react';
import api from '../lib/api';

export default function Timesheet() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRecords = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await api.get('/attendance', {
        params: { month }
      });
      setRecords(data.records || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to load timesheet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h3 className="title" style={{ fontSize: '1.8rem' }}>
        Timesheet
      </h3>
      <p className="subtitle">Browse attendance history by month.</p>

      <form className="row" onSubmit={loadRecords} style={{ alignItems: 'end', flexWrap: 'wrap' }}>
        <div className="field" style={{ marginBottom: 0, minWidth: 220 }}>
          <label htmlFor="month">Month</label>
          <div className="input-shell">
            <input id="month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </div>
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Load Records'}
        </button>
      </form>

      {message ? <div className="error">{message}</div> : null}

      <div style={{ marginTop: 24, overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="5">No attendance records found for the selected month.</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={`${record.id}-${record.attendanceDate}`}>
                  <td>{record.attendanceDate}</td>
                  <td>{record.checkInAt ? new Date(record.checkInAt).toLocaleTimeString() : '--'}</td>
                  <td>{record.checkOutAt ? new Date(record.checkOutAt).toLocaleTimeString() : '--'}</td>
                  <td>
                    <span className={`pill ${record.checkOutAt ? 'success' : 'warning'}`}>
                      {record.checkOutAt ? 'checked out' : 'checked in'}
                    </span>
                  </td>
                  <td>{record.totalHours ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
