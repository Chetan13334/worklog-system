import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Leave() {
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [records, setRecords] = useState([]);

  const loadLeaves = async () => {
    try {
      const { data } = await api.get('/leave');
      setRecords(data.records || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to load leave requests.');
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const { data } = await api.post('/leave', form);
      setMessage(data.message);
      setForm({
        startDate: '',
        endDate: '',
        leaveType: 'casual',
        reason: ''
      });
      await loadLeaves();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to submit leave.');
    }
  };

  return (
    <div className="grid-2">
      <section className="panel">
        <h3 className="title" style={{ fontSize: '1.8rem' }}>
          Apply Leave
        </h3>
        <p className="subtitle">Submit a leave request and track its status below.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="startDate">Start Date</label>
            <div className="input-shell">
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="endDate">End Date</label>
            <div className="input-shell">
              <input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="leaveType">Leave Type</label>
            <div className="input-shell">
              <select
                id="leaveType"
                value={form.leaveType}
                onChange={(event) => setForm((current) => ({ ...current, leaveType: event.target.value }))}
              >
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="reason">Reason</label>
            <div className="input-shell">
              <textarea
                id="reason"
                rows="4"
                value={form.reason}
                onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
                placeholder="Brief reason for leave request"
              />
            </div>
          </div>

          <button className="button" type="submit">
            Submit Leave
          </button>

          {message ? <div className={message.includes('submitted') ? 'success' : 'error'}>{message}</div> : null}
        </form>
      </section>

      <section className="panel">
        <h3 className="title" style={{ fontSize: '1.8rem' }}>
          Leave History
        </h3>
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Dates</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="3">No leave requests found.</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td>{record.leaveType}</td>
                  <td>
                    {record.startDate} to {record.endDate}
                  </td>
                  <td>
                    <span className={`pill ${record.status === 'approved' ? 'success' : record.status === 'rejected' ? 'warning' : 'neutral'}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
