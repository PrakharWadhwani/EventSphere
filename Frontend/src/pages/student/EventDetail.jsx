import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink, Users, Pencil } from 'lucide-react';
import { getEvent } from '../../api/events';
import { assetUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FALLBACK_BANNER } from '../../components/EventCard';
import { FollowButton } from '../../components/FollowButton';
import { Spinner, ErrorBanner } from '../../components/Spinner';
import { formatDate, formatTimeRange } from '../../lib/format';

export const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setEvent(null);
    setError('');
    getEvent(id).then(setEvent).catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-4">
        <ErrorBanner message={error} />
        <Link to="/home" className="text-sm text-indigo-400 hover:underline">
          ← Back to feed
        </Link>
      </div>
    );
  }
  if (!event) return <Spinner />;

  const canEdit = user?.isAdmin && user.societyId === event.societyId;

  return (
    <article className="max-w-4xl mx-auto pb-12 space-y-6">
      <button
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/home'))}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/70">
        <div className="relative h-56 sm:h-80 bg-slate-800">
          <img
            src={assetUrl(event.bannerImageUrl) || FALLBACK_BANNER}
            alt=""
            onError={(e) => {
              e.currentTarget.src = FALLBACK_BANNER;
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white">
                {event.category}
              </span>
              {event.status !== 'Published' && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950">{event.status}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{event.title}</h1>
          </div>
        </div>

        <div className="p-5 sm:p-8 grid gap-8 md:grid-cols-[1fr_280px]">
          <div className="space-y-5 order-2 md:order-1">
            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-2">About this event</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4 order-1 md:order-2">
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <Calendar className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="sr-only">Date</dt>
                  <dd className="text-white font-medium">{formatDate(event.date)}</dd>
                  <dd className="text-xs text-slate-500">{event.date}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="sr-only">Time</dt>
                  <dd className="text-white font-medium">{formatTimeRange(event.startTime, event.endTime)}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <dt className="sr-only">Venue</dt>
                  <dd className="text-white font-medium">{event.venue}</dd>
                </div>
              </div>
            </dl>

            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              Register <ExternalLink className="w-4 h-4" />
            </a>

            {canEdit && (
              <Link
                to={`/admin/events/${event.id}/edit`}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Pencil className="w-4 h-4" /> Edit event
              </Link>
            )}

            {event.society && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" /> Organised by
                </div>
                <Link to={`/societies/${event.society.id}`} className="block text-sm font-semibold text-white hover:text-indigo-300">
                  {event.society.name}
                </Link>
                <FollowButton societyId={event.society.id} className="w-full justify-center" />
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
};
