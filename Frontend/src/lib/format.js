const pad = (n) => String(n).padStart(2, '0');

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** "2026-10-14" -> "Wed, 14 Oct" (or "Today" / "Tomorrow"). */
export const formatDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(y !== today.getFullYear() && { year: 'numeric' }),
  });
};

/** "14:30" -> "2:30 PM" */
export const formatTime = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${pad(m)} ${suffix}`;
};

export const formatTimeRange = (start, end) =>
  end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
