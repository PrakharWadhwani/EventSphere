import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusCircle, Upload, CheckCircle, Link as LinkIcon, MapPin, Sparkles, Tag } from 'lucide-react';
import { createEvent, updateEvent, getEvent } from '../../api/events';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ErrorBanner } from '../../components/Spinner';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Downscales an uploaded image to a JPEG data URL (max 1200px wide) so it fits in the API payload. */
const fileToBannerDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1200 / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
  });

export const CreateEvent = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { config } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Technical',
    bannerImageUrl: '',
    venue: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    registrationLink: '',
    status: 'Published',
    tags: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    getEvent(id)
      .then((event) => {
        setFormData({
          title: event.title,
          category: event.category,
          bannerImageUrl: event.bannerImageUrl || '',
          venue: event.venue,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          description: event.description,
          registrationLink: event.registrationLink,
          status: event.status,
          tags: event.tags || [],
        });
        setImagePreview(event.bannerImageUrl || null);
      })
      .catch((err) => setSubmitError(err.message))
      .finally(() => setIsLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleTag = (tag) =>
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrors((prev) => ({ ...prev, bannerImageUrl: 'Image must be 5MB or smaller.' }));
      return;
    }
    try {
      const dataUrl = await fileToBannerDataUrl(file);
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, bannerImageUrl: dataUrl }));
      setErrors((prev) => ({ ...prev, bannerImageUrl: '' }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, bannerImageUrl: err.message }));
    }
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Event Title is required.';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required.';
    if (!formData.date) newErrors.date = 'Date is required.';
    if (!formData.startTime) newErrors.startTime = 'Start time is required.';
    if (!formData.endTime) newErrors.endTime = 'End time is required.';
    else if (formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time.';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    
    if (!formData.registrationLink.trim()) {
      newErrors.registrationLink = 'Registration Link is required.';
    } else if (!validateUrl(formData.registrationLink)) {
      newErrors.registrationLink = 'Please enter a valid URL (e.g. https://...)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const { event, notified } = isEdit ? await updateEvent(id, formData) : await createEvent(formData);
      const pushNote = notified ? ` ${notified} follower device${notified === 1 ? '' : 's'} notified.` : '';
      setSuccessMessage(
        `${event.status === 'Draft' ? 'Draft saved' : isEdit ? 'Event updated' : 'Event published'}.${pushNote}`
      );
      setTimeout(() => navigate('/admin'), 1200);
    } catch (err) {
      if (err.details) setErrors(err.details);
      setSubmitError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto py-6">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            Society Event Creator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isEdit ? 'Edit Event' : 'Create & Publish Event'}
          </h1>
          <p className="text-sm text-slate-400">
            Published events appear in the student feed and notify your followers.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-300">{successMessage}</h4>
            <p className="text-xs text-emerald-200/80 mt-0.5">Returning to your dashboard…</p>
          </div>
        </div>
      )}
      {submitError && (
        <div className="mb-6">
          <ErrorBanner message={submitError} />
        </div>
      )}

      {/* Creator Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Details Block */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Event Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Event Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. InnovateX 2026 Hackathon"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.title ? 'border-rose-500' : 'border-slate-800'
                } text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.title && <p className="text-[11px] text-rose-400">{errors.title}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Workshops">Workshops</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe event highlights, prizes, guidelines, and target audience..."
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                errors.description ? 'border-rose-500' : 'border-slate-800'
              } text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all`}
            />
            {errors.description && <p className="text-[11px] text-rose-400">{errors.description}</p>}
          </div>

          {/* Tags (drive "Recommended for You") */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Interest tags
              <span className="font-normal text-slate-500">(used to recommend this event)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(config.interestTags || []).map((tag) => {
                const on = formData.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      on
                        ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Banner Upload Block */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Upload className="w-4 h-4 text-purple-400" />
            Banner Image
          </h3>
          {errors.bannerImageUrl && <p className="text-[11px] text-rose-400">{errors.bannerImageUrl}</p>}

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2 h-44 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center p-4 text-center hover:border-indigo-500 bg-slate-950/60 transition-all relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-slate-500 mb-2" />
              <p className="text-xs font-semibold text-slate-300">Click to upload banner image</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG or WEBP up to 5MB</p>
            </div>

            <div className="w-full sm:w-1/2 h-44 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Banner Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-xs text-slate-500">Live image preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logistics & Time Block */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-rose-400" />
            Venue & Time Logistics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Venue */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Venue <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Campus 6 Auditorium"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.venue ? 'border-rose-500' : 'border-slate-800'
                } text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.venue && <p className="text-[11px] text-rose-400">{errors.venue}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.date ? 'border-rose-500' : 'border-slate-800'
                } text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.date && <p className="text-[11px] text-rose-400">{errors.date}</p>}
            </div>

            {/* Start Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Start Time <span className="text-rose-400">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.startTime ? 'border-rose-500' : 'border-slate-800'
                } text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.startTime && <p className="text-[11px] text-rose-400">{errors.startTime}</p>}
            </div>

            {/* End Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                End Time <span className="text-rose-400">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.endTime ? 'border-rose-500' : 'border-slate-800'
                } text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.endTime && <p className="text-[11px] text-rose-400">{errors.endTime}</p>}
            </div>
          </div>
        </div>

        {/* Link & Status Block */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <LinkIcon className="w-4 h-4 text-emerald-400" />
            Registration Link & Publication Status
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Registration Link */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Registration URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleChange}
                placeholder="https://eventsphere.kiit.ac.in/register/..."
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border ${
                  errors.registrationLink ? 'border-rose-500' : 'border-slate-800'
                } text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.registrationLink && (
                <p className="text-[11px] text-rose-400">{errors.registrationLink}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Publication Status <span className="text-rose-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
          >
            <PlusCircle className="w-5 h-5" />
            <span>
              {isSaving ? 'Saving…' : formData.status === 'Draft' ? 'Save Draft' : isEdit ? 'Save Changes' : 'Publish Event'}
            </span>
          </button>
        </div>

      </form>
    </div>
  );
};
