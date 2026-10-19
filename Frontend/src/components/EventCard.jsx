import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { assetUrl } from '../api/client';
import { formatDate, formatTimeRange } from '../lib/format';

export const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

export const EventCard = ({ event, highlightTags = [], badge }) => (
  <Link
    to={`/events/${event.id}`}
    className="bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
  >
    <div className="relative h-40 overflow-hidden bg-slate-800">
      <img
        src={assetUrl(event.bannerImageUrl) || FALLBACK_BANNER}
        alt=""
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_BANNER;
        }}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
        {event.category}
      </div>
      {badge && (
        <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
          {badge}
        </div>
      )}
    </div>

    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
      <div>
        <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wide">
          {event.society?.name}
        </span>
        <h3 className="font-bold text-white text-base leading-snug line-clamp-1 mt-0.5 mb-1.5">{event.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{event.description}</p>
      </div>

      <div className="space-y-2 border-t border-slate-800/80 pt-3">
        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  highlightTags.includes(tag)
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {formatTimeRange(event.startTime, event.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
      </div>
    </div>
  </Link>
);

export const EventGrid = ({ events, highlightTags }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {events.map((event) => (
      <EventCard key={event.id} event={event} highlightTags={highlightTags} />
    ))}
  </div>
);
