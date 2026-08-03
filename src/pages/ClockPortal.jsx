import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Clock, LogIn, LogOut, ArrowLeft } from 'lucide-react';

export default function ClockPortal() {
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClock = async (e) => {
    e.preventDefault();
    const id = employeeId.trim();
    if (!id) return;
    setLoading(true);
    setError('');
    setStatus(null);
    try {
      const entries = await base44.entities.TimeClock.filter(
        { employee_id: id },
        '-timestamp',
        1
      );
      const lastEntry = Array.isArray(entries) && entries[0];
      const nextAction =
        lastEntry?.action === 'clock_in' ? 'clock_out' : 'clock_in';

      const now = new Date();
      await base44.entities.TimeClock.create({
        employee_id: id,
        action: nextAction,
        timestamp: now.toISOString(),
        shift_date: now.toISOString().split('T')[0],
      });

      setStatus({
        action: nextAction,
        time: now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: now.toLocaleDateString(),
      });
      setEmployeeId('');
    } catch {
      setError('Unable to clock in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Shop Flow</h1>
          <p className="text-sm text-slate-500">Employee Time Clock</p>
        </div>

        {status ? (
          <div className="text-center space-y-4">
            <div
              className={`rounded-xl p-6 ${
                status.action === 'clock_in'
                  ? 'bg-green-50'
                  : 'bg-blue-50'
              }`}
            >
              {status.action === 'clock_in' ? (
                <LogIn className="w-12 h-12 text-green-600 mx-auto mb-2" />
              ) : (
                <LogOut className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              )}
              <p className="text-lg font-bold text-slate-900">
                {status.action === 'clock_in'
                  ? 'Clocked In'
                  : 'Clocked Out'}
              </p>
              <p className="text-sm text-slate-500">{status.time}</p>
              <p className="text-xs text-slate-400">{status.date}</p>
            </div>
            <button
              onClick={() => setStatus(null)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold active:bg-slate-800"
            >
              Done
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleClock} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your ID"
                className="w-full h-14 text-2xl text-center tracking-widest rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none px-4 mt-1"
                autoFocus
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !employeeId.trim()}
              className="w-full bg-amber-500 text-slate-900 h-14 rounded-xl font-bold text-lg active:bg-amber-600 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : 'Clock In / Out'}
            </button>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}