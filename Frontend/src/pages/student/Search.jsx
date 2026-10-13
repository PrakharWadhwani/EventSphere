import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchEvents, getSocieties } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { todayISO } from '../../lib/format';
import { EventGrid } from '../../components/EventCard';
import { Spinner, ErrorBanner, EmptyState } from '../../components/Spinner';

const selectClass =
  'px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500';

export const SearchPage = () => {
  const { interests } = useAuth();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [societies, setSocieties] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = {
    q: params.get('q') || '',
    society: params.get('society') || '',
    date: params.get('date') || '',
    type: params.get('type') || '',
  };

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  useEffect(() => {
    getSocieties().then(setSocieties).catch(() => {});
  }, []);

  // Debounce typing into the URL so results update as you type.
  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== filters.q) setFilter('q', query.trim());
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const paramKey = params.toString();
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    searchEvents(filters)
      .then((list) => {
        if (!cancelled) {
          setResults(list);
          setError('');
        }
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [paramKey]);

  const isCustomDate = filters.date && !['today', 'week'].includes(filters.date);
  const hasFilters = filters.q || filters.society || filters.date || filters.type;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Search Events</h1>
        <p className="text-sm text-slate-400">Find events by title, society or tag.</p>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <SearchIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. hackathon, Music Club, robotics…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Society"
            value={filters.society}
            onChange={(e) => setFilter('society', e.target.value)}
            className={`${selectClass} flex-1 min-w-[160px]`}
          >
            <option value="">All societies</option>
            {societies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Event type"
            value={filters.type}
            onChange={(e) => setFilter('type', e.target.value)}
            className={`${selectClass} flex-1 min-w-[130px]`}
          >
            <option value="">All types</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Workshops">Workshops</option>
          </select>
          <select
            aria-label="Date"
            value={isCustomDate ? 'custom' : filters.date}
            onChange={(e) =>
              setFilter('date', e.target.value === 'custom' ? todayISO() : e.target.value)
            }
            className={`${selectClass} flex-1 min-w-[130px]`}
          >
            <option value="">Any upcoming date</option>
            <option value="today">Today</option>
            <option value="week">Next 7 days</option>
            <option value="custom">Pick a date…</option>
          </select>
          {isCustomDate && (
            <input
              type="date"
              aria-label="Specific date"
              value={filters.date}
              onChange={(e) => setFilter('date', e.target.value)}
              className={selectClass}
            />
          )}
          {hasFilters && (
            <button
              onClick={() => {
                setQuery('');
                setParams({}, { replace: true });
              }}
              className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      {isLoading ? (
        <Spinner label="Searching…" />
      ) : (
        <>
          <p className="text-xs text-slate-500">
            {results.length} event{results.length === 1 ? '' : 's'} found
          </p>
          {results.length > 0 ? (
            <EventGrid events={results} highlightTags={interests} />
          ) : (
            <EmptyState title="No events match your search">Try a different keyword or clear filters.</EmptyState>
          )}
        </>
      )}
    </div>
  );
};
