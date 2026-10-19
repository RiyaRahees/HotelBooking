import React, { useState } from 'react';
import { useHotelData } from '../hooks/useHotelData';
import { PageHeader } from '../components/common/PageHeader';
import { GuestAvatar } from '../components/common/GuestAvatar';
import { Modal } from '../components/common/Modal';
import { feedbackApi } from '../services/feedback';
import { useNotification } from '../context/NotificationContext';
import {
  MessageSquareQuote,
  Star,
  Sparkles,
  Search,
  MessageCircle,
  ThumbsUp,
  Award,
} from 'lucide-react';
import { Feedback as FeedbackType } from '../types';

export const Feedback: React.FC = () => {
  const { feedback, refreshAll } = useHotelData();
  const { showToast } = useNotification();

  const [ratingFilter, setRatingFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyModalFeedback, setReplyModalFeedback] = useState<FeedbackType | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roomNumber.includes(searchQuery);

    const matchesRating =
      ratingFilter === 'All' ||
      (ratingFilter === '5' && item.rating === 5) ||
      (ratingFilter === '4' && item.rating >= 4 && item.rating < 5) ||
      (ratingFilter === '3' && item.rating < 4);

    return matchesSearch && matchesRating;
  });

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalFeedback || !replyText) return;

    await feedbackApi.respond(replyModalFeedback.id, replyText);
    showToast('Reply Published', `Public response added to ${replyModalFeedback.guestName}'s review.`);
    setReplyModalFeedback(null);
    setReplyText('');
    refreshAll();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Guest Feedback &amp; Reviews"
        subtitle="Monitor guest satisfaction indices, department ratings, and publish official hospitality replies"
        icon={MessageSquareQuote}
      />

      {/* Top Rating Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-navy-400">Average Patron Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-bold font-serif text-navy-950">4.6</span>
              <span className="text-base text-navy-400 font-semibold">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-amber-300'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-navy-500 border-t border-cream-200 pt-3">
            Based on 342 verified guest stays over the past 90 days.
          </p>
        </div>

        {/* Category Breakdown (Cleanliness, Room, Staff, Service) */}
        <div className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400">Departmental Quality Breakdown</h3>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Cleanliness & Sanitization', score: 4.9, bar: '98%' },
              { label: 'Room Comfort & Aesthetics', score: 4.8, bar: '96%' },
              { label: 'Staff Courteousness & Reception', score: 4.7, bar: '94%' },
              { label: 'In-Room Dining & Concierge Service', score: 4.5, bar: '90%' },
            ].map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-navy-900">{cat.label}</span>
                  <span className="font-bold text-navy-950 font-serif">{cat.score} / 5.0</span>
                </div>
                <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gold-600 h-full rounded-full" style={{ width: cat.bar }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="luxury-card p-4 bg-white rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            placeholder="Search feedback by guest, room, comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs font-semibold text-navy-800 focus:outline-none"
          >
            <option value="All">All Star Ratings</option>
            <option value="5">5 Star Reviews (Excellent)</option>
            <option value="4">4 Star Reviews (Great)</option>
            <option value="3">Below 4 Stars</option>
          </select>
        </div>
      </div>

      {/* Feedback Reviews List */}
      <div className="space-y-4">
        {filteredFeedback.map((item) => (
          <div
            key={item.id}
            className="luxury-card p-6 bg-white rounded-2xl border border-cream-200 space-y-3"
          >
            {/* Top Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <GuestAvatar name={item.guestName} avatar={item.guestAvatar} size="md" vip={true} />
                <div>
                  <h4 className="text-sm font-bold text-navy-950">{item.guestName}</h4>
                  <p className="text-xs text-navy-500">
                    Stayed in Room {item.roomNumber} · Review date: {item.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(item.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            <p className="text-xs sm:text-sm text-navy-800 leading-relaxed italic bg-cream-50/50 p-3.5 rounded-xl border border-cream-100">
              "{item.comment}"
            </p>

            {/* Management Response (if exists) or Reply Action */}
            {item.response ? (
              <div className="p-3.5 bg-gold-50/60 border border-gold-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gold-900">
                  <Sparkles className="w-3.5 h-3.5 text-gold-700" />
                  <span>Official Royal Vista Response</span>
                </div>
                <p className="text-navy-800">{item.response}</p>
              </div>
            ) : (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setReplyModalFeedback(item);
                    setReplyText('');
                  }}
                  className="px-3 py-1.5 bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Respond to Guest</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={!!replyModalFeedback}
        onClose={() => setReplyModalFeedback(null)}
        title={`Respond to ${replyModalFeedback?.guestName}`}
        subtitle={`Room ${replyModalFeedback?.roomNumber} · Rating: ${replyModalFeedback?.rating}/5`}
        maxWidth="md"
      >
        <form onSubmit={handleSendReply} className="space-y-4">
          <p className="text-xs text-navy-600 italic bg-cream-50 p-3 rounded-xl border border-cream-200">
            "{replyModalFeedback?.comment}"
          </p>

          <div>
            <label className="block text-xs font-bold text-navy-900 mb-1">Hotel Management Reply</label>
            <textarea
              rows={4}
              required
              placeholder="Thank you for staying with us..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-cream-200">
            <button
              type="button"
              onClick={() => setReplyModalFeedback(null)}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-5 py-2 text-xs font-bold rounded-xl shadow-sm"
            >
              Publish Response
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
