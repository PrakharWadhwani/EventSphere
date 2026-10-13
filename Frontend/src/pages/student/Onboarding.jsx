import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSuggestedSocieties } from '../../api/events';
import { Sparkles, CheckCircle2, ArrowRight, UserPlus, Check } from 'lucide-react';
import { ErrorBanner } from '../../components/Spinner';

const TAG_META = {
  Coding: { name: 'Coding & CP', icon: '👨‍💻' },
  'AI/ML': { name: 'AI & Machine Learning', icon: '🤖' },
  'Web Dev': { name: 'Web & App Development', icon: '💻' },
  Robotics: { name: 'Robotics & Hardware', icon: '⚙️' },
  Photography: { name: 'Photography & Film', icon: '📷' },
  Drama: { name: 'Drama & Theatre', icon: '🎭' },
  Music: { name: 'Music & Bands', icon: '🎸' },
  Dance: { name: 'Dance', icon: '💃' },
  Debating: { name: 'Debating & MUN', icon: '🎙️' },
  Finance: { name: 'Finance & Markets', icon: '📈' },
  Quizzing: { name: 'Quizzing & Trivia', icon: '🧠' },
  'Public Speaking': { name: 'Public Speaking', icon: '📢' },
  Design: { name: 'Design & UI/UX', icon: '🎨' },
};

export const Onboarding = () => {
  const { interests, updateInterests, config, following, toggleFollow } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState(interests || []);
  const [step, setStep] = useState(1);
  const [suggested, setSuggested] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const tags = config.interestTags?.length ? config.interestTags : Object.keys(TAG_META);

  const toggleInterest = (id) =>
    setSelectedInterests((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return prev.length < 8 ? [...prev, id] : prev;
    });

  const isValidCount = selectedInterests.length >= 3 && selectedInterests.length <= 8;

  const handleContinue = async () => {
    if (!isValidCount) return;
    setBusy(true);
    setError('');
    try {
      await updateInterests(selectedInterests);
      setSuggested(await getSuggestedSocieties(selectedInterests));
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFollow = async (id) => {
    try {
      await toggleFollow(id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8">
      <div className="max-w-3xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Step {step} of 2: {step === 1 ? 'Pick your interests' : 'Follow societies'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {step === 1 ? 'What are you passionate about?' : 'Societies you might like'}
          </h1>
          <p className="text-sm text-slate-400">
            {step === 1 ? (
              <>
                Select <span className="text-indigo-400 font-semibold">3 to 8 interest tags</span> so we can recommend
                events for you.
              </>
            ) : (
              'Follow societies to get notified the moment they post a new event.'
            )}
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} />
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="flex justify-center mb-6">
              <div
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors ${
                  isValidCount
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                <span>Selected: {selectedInterests.length} / 8</span>
                {selectedInterests.length < 3 && (
                  <span className="text-[10px] text-slate-400">(need {3 - selectedInterests.length} more)</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
              {tags.map((id) => {
                const meta = TAG_META[id] || { name: id, icon: '✨' };
                const isSelected = selectedInterests.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleInterest(id)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-24 sm:h-28 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{meta.icon}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <h3 className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {meta.name}
                    </h3>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-3 mb-10">
            {suggested.length === 0 && (
              <p className="text-sm text-slate-400 text-center">No matching societies yet — explore them all later.</p>
            )}
            {suggested.map((s) => {
              const isFollowing = following.includes(s.id);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{s.description}</p>
                  </div>
                  <button
                    onClick={() => handleFollow(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
                      isFollowing
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isFollowing ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          {step === 1 ? (
            <p className="text-xs text-slate-500">You can change these later.</p>
          ) : (
            <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white">
              ← Back to interests
            </button>
          )}
          <button
            type="button"
            disabled={step === 1 && (!isValidCount || busy)}
            onClick={step === 1 ? handleContinue : () => navigate('/home')}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              step === 2 || isValidCount
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            <span>{step === 1 ? (busy ? 'Saving…' : 'Continue') : 'Go to my feed'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
