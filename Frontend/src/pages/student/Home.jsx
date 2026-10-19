import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEventsToday, getRecommendedEvents, getEventsByCategory } from '../../api/events';
import { Sparkles, Flame, Search } from 'lucide-react';
import { EventCard, EventGrid } from '../../components/EventCard';
import { Spinner, ErrorBanner, EmptyState } from '../../components/Spinner';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Workshops'];

export const StudentHome = () => {
  const { name, interests, following } = useAuth();

  const [todayEvents, setTodayEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [error, setError] = useState('');

  const feedKey = `${interests.join(",")}|${following.join(",")}`;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([getEventsToday(), getRecommendedEvents()])
      .then(([today, recommended]) => {
        if (cancelled) return;
        setTodayEvents(today);
        setRecommendedEvents(recommended);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [feedKey]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingUpcoming(true);
    getEventsByCategory(selectedCategory)
      .then((list) => !cancelled && setUpcoming(list))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoadingUpcoming(false));
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Banner */}
      <section className="relative rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/20 p-6 md:p-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Live KIIT Campus Feed
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            Hey, {name || 'KIITian'}! 👋
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4">
            Hackathons, jams, MUNs and workshops from every society — no more digging through email.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-slate-300 hover:border-indigo-500 hover:text-white transition-all"
          >
            <Search className="w-4 h-4" />
            Search events or societies
          </Link>

          {interests.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-indigo-500/20">
              <span className="text-xs font-medium text-slate-400">Your tags:</span>
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
              <Link to="/profile" className="text-[11px] text-slate-400 underline hover:text-white">
                Edit
              </Link>
            </div>
          )}
        </div>
      </section>

      <ErrorBanner message={error} />

      {isLoading ? (
        <Spinner label="Loading your feed…" />
      ) : (
        <>
          {/* Happening Today */}
          {todayEvents.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Happening Today
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {todayEvents.length} events
                </span>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x -mx-4 px-4">
                {todayEvents.map((event) => (
                  <div key={event.id} className="min-w-[280px] max-w-[320px] snap-start flex">
                    <EventCard event={event} highlightTags={interests} badge="Today" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommended for You */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Recommended For You
              </h2>
              <span className="text-xs text-slate-400 hidden sm:inline">Based on your interests & follows</span>
            </div>
            {recommendedEvents.length > 0 ? (
              <EventGrid events={recommendedEvents} highlightTags={interests} />
            ) : (
              <EmptyState title="No matches yet">Try adding more interest tags or following societies.</EmptyState>
            )}
          </section>
        </>
      )}

      {/* All upcoming events + Category tabs */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Upcoming Events</h2>
            <p className="text-xs text-slate-400">Soonest first, across all KIIT societies.</p>
          </div>
          <div
            role="tablist"
            className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoadingUpcoming ? (
          <Spinner />
        ) : upcoming.length > 0 ? (
          <EventGrid events={upcoming} highlightTags={interests} />
        ) : (
          <EmptyState title="No upcoming events in this category" />
        )}
      </section>
    </div>
  );
};
