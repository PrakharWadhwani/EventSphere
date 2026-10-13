import React, { useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FollowButton = ({ societyId, onChange, className = '' }) => {
  const { following, toggleFollow } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isFollowing = following.includes(societyId);

  const handleClick = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await toggleFollow(societyId);
      onChange?.(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={busy}
        aria-pressed={isFollowing}
        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-60 ${
          isFollowing
            ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-rose-500/50 hover:text-rose-300'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
        } ${className}`}
      >
        {isFollowing ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </>
  );
};
