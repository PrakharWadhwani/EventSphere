import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff, CheckCircle2, Save, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSocieties } from '../../api/events';
import { enablePush, pushSupported } from '../../lib/push';
import { tagMeta } from '../../lib/tags';
import { FollowButton } from '../../components/FollowButton';
import { ErrorBanner } from '../../components/Spinner';

const card = 'bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4';

const notificationState = () => (pushSupported() ? Notification.permission : 'unsupported');

export const Profile = () => {
  const { user, config, following, updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [selected, setSelected] = useState(user.interests);
  const [societies, setSocieties] = useState([]);
  const [permission, setPermission] = useState(notificationState);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSocieties().then(setSocieties).catch(() => {});
  }, []);

  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 8 ? [...prev, id] : prev
    );

  const validCount = selected.length >= 3 && selected.length <= 8;

  const save = async () => {
    setBusy(true);
    setError('');
    setSaved('');
    try {
      await updateProfile({ name, interests: selected });
      setSaved('Profile saved. Your recommendations are updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const turnOnNotifications = async () => {
    setError('');
    try {
      await enablePush();
    } catch (err) {
      setError(err.message);
    }
    setPermission(notificationState());
  };

  const followed = societies.filter((s) => following.includes(s.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your profile</h1>
        <p className="text-sm text-slate-400">{user.email}</p>
      </div>

      <ErrorBanner message={error} />
      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {saved}
        </div>
      )}

      <section className={card}>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> Display name
        </h2>
        <input
          aria-label="Display name"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
        />
      </section>

      <section className={card}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Interests</h2>
          <span className={`text-xs font-semibold ${validCount ? 'text-emerald-400' : 'text-amber-400'}`}>
            {selected.length} / 8 (min 3)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(config.interestTags || []).map((id) => {
            const on = selected.includes(id);
            const meta = tagMeta(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  on
                    ? 'bg-indigo-600/25 border-indigo-500 text-indigo-100'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {meta.icon} {meta.name}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={!validCount || busy || !name.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold text-white">Notifications</h2>
        {permission === 'granted' ? (
          <p className="text-xs text-emerald-300 flex items-center gap-2">
            <Bell className="w-4 h-4" /> On. You'll be notified when societies you follow publish events.
          </p>
        ) : permission === 'denied' ? (
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <BellOff className="w-4 h-4" /> Blocked in your browser settings. Allow notifications for this site, then reload.
          </p>
        ) : permission === 'unsupported' ? (
          <p className="text-xs text-slate-400">This browser doesn't support push notifications.</p>
        ) : (
          <button
            onClick={turnOnNotifications}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
          >
            <Bell className="w-4 h-4" /> Enable notifications
          </button>
        )}
      </section>

      <section className={card}>
        <h2 className="text-sm font-bold text-white">Following ({followed.length})</h2>
        {followed.length === 0 ? (
          <p className="text-xs text-slate-400">
            You don't follow any societies yet.{' '}
            <Link to="/societies" className="text-indigo-400 hover:underline">
              Browse societies
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {followed.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                <Link to={`/societies/${s.id}`} className="text-sm text-slate-200 hover:text-white">
                  {s.name}
                </Link>
                <FollowButton societyId={s.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
