import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, CheckCircle2, ArrowRight, Compass } from 'lucide-react';

const AVAILABLE_INTERESTS = [
  { id: 'AI/ML', name: 'AI & Machine Learning', icon: '🤖' },
  { id: 'Web Dev', name: 'Web & App Development', icon: '💻' },
  { id: 'Robotics', name: 'Robotics & Hardware', icon: '⚙️' },
  { id: 'Photography', name: 'Photography & Filmmaking', icon: '📷' },
  { id: 'Drama', name: 'Drama & Theatre', icon: '🎭' },
  { id: 'Music', name: 'Music & Instrumental', icon: '🎸' },
  { id: 'Debating', name: 'Debating & MUN', icon: '🎙️' },
  { id: 'Finance', name: 'Finance & Stock Trading', icon: '📈' },
  { id: 'Quizzing', name: 'Quizzing & Trivia', icon: '🧠' },
  { id: 'Public Speaking', name: 'Public Speaking & Anchoring', icon: '📢' },
];

export const Onboarding = () => {
  const { interests, updateInterests } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState(interests || []);
  const navigate = useNavigate();

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      if (selectedInterests.length < 8) {
        setSelectedInterests([...selectedInterests, id]);
      }
    }
  };

  const isValidCount = selectedInterests.length >= 3 && selectedInterests.length <= 8;

  const handleContinue = () => {
    if (isValidCount) {
      updateInterests(selectedInterests);
      navigate('/home');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8">
      <div className="max-w-3xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Step 2 of 2: Personalize Feed
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            What are you passionate about?
          </h1>
          <p className="text-sm text-slate-400">
            Select <span className="text-indigo-400 font-semibold">3 to 8 interest tags</span> so EventSphere can curate customized recommendations for your campus feed.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex justify-center mb-6">
          <div className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors ${
            isValidCount 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            <span>Selected: {selectedInterests.length} / 8</span>
            {!isValidCount && (
              <span className="text-[10px] text-slate-400">
                (Need {selectedInterests.length < 3 ? `at least ${3 - selectedInterests.length} more` : 'maximum 8'})
              </span>
            )}
          </div>
        </div>

        {/* Tag Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 mb-10">
          {AVAILABLE_INTERESTS.map((tag) => {
            const isSelected = selectedInterests.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleInterest(tag.id)}
                className={`relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-28 group ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tag.icon}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <div>
                  <h3 className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {tag.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            You can always update your preferences later from your profile.
          </p>
          <button
            type="button"
            disabled={!isValidCount}
            onClick={handleContinue}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isValidCount
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            <span>Continue to Event Home</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
