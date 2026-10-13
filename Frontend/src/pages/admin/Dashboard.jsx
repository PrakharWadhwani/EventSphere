import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2, Eye, Send } from 'lucide-react';
import { getMyEvents, deleteEvent, updateEvent, getSocieties } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ErrorBanner, EmptyState } from '../../components/Spinner';
import { formatDate, formatTimeRange, todayISO } from '../../lib/format';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [societyName, setSocietyName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => getMyEvents().then(setEvents).catch((err) => setError(err.message));

  useEffect(() => {
    load();
    getSocieties()
      .then((list) => setSocietyName(list.find((s) => s.id === user.societyId)?.name || ''))
      .catch(() => {});
  }, [user.societyId]);

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    try {
      await deleteEvent(event.id);
      setEvents((list) => list.filter((e) => e.id !== event.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublish = async (event) => {
    try {
      const { notified } = await updateEvent(event.id, { status: 'Published' });
      setNotice(`"${event.title}" published. ${notified} follower device${notified === 1 ? '' : 's'} notified.`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const today = todayISO();
  const drafts = events?.filter((e) => e.status === 'Draft').length || 0;
  const upcoming = events?.filter((e) => e.status === 'Published' && e.date >= today).length || 0;

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Society Portal</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{societyName || 'Your society'}</h1>
          <p className="text-sm text-slate-400">
            {upcoming} upcoming published · {drafts} draft{drafts === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          to="/admin/create-event"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
        >
          <PlusCircle className="w-4 h-4" /> New event
        </Link>
      </div>

      <ErrorBanner message={error} />
      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">{notice}</div>
      )}

      {!events ? (
        <Spinner />
      ) : events.length === 0 ? (
        <EmptyState title="No events yet">Create your first event to get it in front of students.</EmptyState>
      ) : (
        <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          {events.map((e) => (
            <li key={e.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      e.status === 'Draft' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {e.status}
                  </span>
                  {e.date < today && <span className="text-[10px] text-slate-500">Past</span>}
                  <h2 className="text-sm font-semibold text-white truncate">{e.title}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDate(e.date)} · {formatTimeRange(e.startTime, e.endTime)} · {e.venue}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {e.status === 'Draft' && (
                  <button
                    onClick={() => handlePublish(e)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Publish
                  </button>
                )}
                <Link to={`/events/${e.id}`} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800" title="View" aria-label="View">
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  to={`/admin/events/${e.id}/edit`}
                  className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                  title="Edit"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(e)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  title="Delete"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
