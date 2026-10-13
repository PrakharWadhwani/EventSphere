import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { getSocieties, getSociety } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { FollowButton } from '../../components/FollowButton';
import { EventGrid } from '../../components/EventCard';
import { Spinner, ErrorBanner, EmptyState } from '../../components/Spinner';

const Avatar = ({ name, size = 'w-12 h-12 text-lg' }) => (
  <div
    className={`${size} rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0`}
  >
    {name.charAt(0)}
  </div>
);

export const SocietiesList = () => {
  const [societies, setSocieties] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSocieties().then(setSocieties).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Societies</h1>
        <p className="text-sm text-slate-400">Follow societies to get notified about their new events.</p>
      </div>
      <ErrorBanner message={error} />
      {!societies && !error ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(societies || []).map((s) => (
            <div key={s.id} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-4">
              <Link to={`/societies/${s.id}`} className="flex items-start gap-3 group">
                <Avatar name={s.name} />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white group-hover:text-indigo-300">{s.name}</h2>
                  <p className="text-xs text-slate-400 line-clamp-2">{s.description}</p>
                </div>
              </Link>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {s.followers} follower{s.followers === 1 ? '' : 's'}
                </span>
                <FollowButton
                  societyId={s.id}
                  onChange={({ followers }) =>
                    setSocieties((list) => list.map((x) => (x.id === s.id ? { ...x, followers } : x)))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SocietyProfile = () => {
  const { id } = useParams();
  const { interests } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    getSociety(id).then(setData).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <ErrorBanner message={error} />;
  if (!data) return <Spinner />;
  const { society, events } = data;

  return (
    <div className="space-y-8 pb-12">
      <Link to="/societies" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> All societies
      </Link>

      <section className="rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/20 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
        <Avatar name={society.name} size="w-16 h-16 text-2xl" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{society.name}</h1>
          <p className="text-sm text-slate-300 mt-1">{society.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {society.tags.map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-3">
          <span className="text-xs text-slate-400">
            {society.followers} follower{society.followers === 1 ? '' : 's'}
          </span>
          <FollowButton
            societyId={society.id}
            onChange={({ followers }) => setData((d) => ({ ...d, society: { ...d.society, followers } }))}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Upcoming events</h2>
        {events.length > 0 ? (
          <EventGrid events={events} highlightTags={interests} />
        ) : (
          <EmptyState title="No upcoming events">Follow to hear about the next one.</EmptyState>
        )}
      </section>
    </div>
  );
};
