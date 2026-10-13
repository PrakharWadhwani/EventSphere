import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { enablePush, pushSupported, syncPushSubscription } from '../lib/push';

const DISMISS_KEY = 'eventsphere_push_dismissed';

const wasDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

/** Banner asking followers to enable "new event from a followed society" notifications. */
export const PushPrompt = () => {
  const { user, following } = useAuth();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported()) return;
    if (Notification.permission === 'granted') {
      syncPushSubscription().catch(() => {});
      return;
    }
    setVisible(Notification.permission === 'default' && following.length > 0 && !wasDismissed());
  }, [user?.id, following.length]);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const enable = async () => {
    setBusy(true);
    setError('');
    try {
      await enablePush();
      setVisible(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-indigo-600/15 border-b border-indigo-500/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 text-xs">
        <Bell className="w-4 h-4 text-indigo-300 shrink-0" />
        <p className="flex-1 min-w-[200px] text-indigo-100">
          Get notified when societies you follow post new events.
          {error && <span className="block text-rose-300 mt-0.5">{error}</span>}
        </p>
        <button
          onClick={enable}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-60"
        >
          {busy ? 'Enabling…' : 'Enable notifications'}
        </button>
        <button onClick={dismiss} className="p-1 text-slate-400 hover:text-white" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
