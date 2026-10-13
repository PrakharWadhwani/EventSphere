import { api } from './client';

/**
 * API service layer for events and societies (backed by the Express API).
 */

export const searchEvents = async (filters = {}) => (await api('/events', { query: filters })).events;

export const getAllEvents = async () => searchEvents();

export const getEventsToday = async () => searchEvents({ date: 'today' });

export const getEventsByCategory = async (category) =>
  searchEvents({ type: category === 'All' ? undefined : category });

export const getRecommendedEvents = async () => (await api('/events/recommended')).events;

export const getEvent = async (id) => (await api(`/events/${encodeURIComponent(id)}`)).event;

export const getSocieties = async () => (await api('/societies')).societies;

export const getSuggestedSocieties = async (tags = []) =>
  (await api('/societies/suggested', { query: { tags: tags.join(',') } })).societies;

export const getSociety = async (id) => api(`/societies/${encodeURIComponent(id)}`);

export const followSociety = async (id) => api(`/societies/${encodeURIComponent(id)}/follow`, { method: 'POST' });

export const unfollowSociety = async (id) => api(`/societies/${encodeURIComponent(id)}/follow`, { method: 'DELETE' });

// ---- Admin ----

export const getMyEvents = async () => (await api('/admin/events')).events;

export const createEvent = async (payload) => api('/admin/events', { method: 'POST', body: payload });

export const updateEvent = async (id, payload) =>
  api(`/admin/events/${encodeURIComponent(id)}`, { method: 'PUT', body: payload });

export const deleteEvent = async (id) => api(`/admin/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
