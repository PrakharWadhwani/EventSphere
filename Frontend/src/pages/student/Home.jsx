import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllEvents, getEventsToday, getRecommendedEvents } from '../../api/events';
import { Calendar, Clock, MapPin, Sparkles, Flame, Tag, Filter, CheckCircle } from 'lucide-react';

export const StudentHome = () => {
  const { name, interests } = useAuth();
  
  const [allEvents, setAllEvents] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [eventsList, todayList, recommendedList] = await Promise.all([
        getAllEvents(),
        getEventsToday(),
        getRecommendedEvents(interests),
      ]);
      setAllEvents(eventsList);
      setTodayEvents(todayList);
      setRecommendedEvents(recommendedList);
      setIsLoading(false);
    };

    fetchData();
  }, [interests]);

  const filteredEvents = selectedCategory === 'All'
    ? allEvents
    : allEvents.filter((event) => event.category === selectedCategory);

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
            Discover upcoming tech hackathons, acoustic jams, MUN debates, and hands-on society workshops across KIIT campus.
          </p>

          {/* Active User Interest Badges */}
          {interests && interests.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-500/20">
              <span className="text-xs font-medium text-slate-400">Your Active Tags:</span>
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Happening Today Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Happening Today
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {todayEvents.length} Events Live
          </span>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-800 snap-x">
          {todayEvents.map((event) => (
            <div
              key={event.id}
              className="min-w-[290px] sm:min-w-[340px] max-w-[340px] snap-start bg-slate-900/90 border border-rose-500/30 rounded-2xl overflow-hidden shadow-xl hover:border-rose-500/60 transition-all flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={event.bannerImageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                  TODAY
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-indigo-400">{event.society}</span>
                  <span className="text-[11px] text-slate-400">{event.category}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended for You */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Recommended For You
          </h2>
          <span className="text-xs text-slate-400">
            Based on your interest tags
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={event.bannerImageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  {event.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                    {event.society}
                  </span>
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-1 mt-0.5 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-800/80 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          interests.includes(tag)
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {event.venue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Campus Events + Category Filter */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Explore All Campus Events
            </h2>
            <p className="text-xs text-slate-400">
              Browse through technical hackathons, cultural festivals, and skill workshops.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {['All', 'Technical', 'Cultural', 'Workshops'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden shadow duration-200 flex flex-col group"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={event.bannerImageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-800">
                  {event.society}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm line-clamp-1 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
