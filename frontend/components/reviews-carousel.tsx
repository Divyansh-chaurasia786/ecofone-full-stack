'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedProduct?: string;
  adminReply?: string;
  isVerified?: boolean;
  createdAt: string;
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aggregateRating, setAggregateRating] = useState<any>(null);

  // Write a Review modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [newReview, setNewReview] = useState({
    authorName: '',
    rating: 0,
    comment: '',
    verifiedProduct: '',
  });

  async function loadReviews() {
    try {
      const res = await api.getReviews();
      setReviews(res.reviews || []);
      setAggregateRating(res.aggregateRating || null);
    } catch (err) {
      console.error('Failed to load customer reviews:', err);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const nextSlide = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.authorName.trim() || !newReview.comment.trim()) {
      setErrorMsg('Please fill in your name and comment.');
      return;
    }
    if (newReview.rating < 1 || newReview.rating > 5) {
      setErrorMsg('Please select a rating (1 to 5 stars).');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.submitReview({
        authorName: newReview.authorName,
        rating: newReview.rating,
        comment: newReview.comment,
        verifiedProduct: newReview.verifiedProduct || undefined,
      });
      setSubmitSuccess(true);
      await loadReviews(); // refresh carousel
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setNewReview({
          authorName: '',
          rating: 0,
          comment: '',
          verifiedProduct: '',
        });
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reviews.length) {
    return <div className="text-center text-slate-500 py-8">Loading customer reviews...</div>;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "EcoFone India",
    "image": "https://www.ecofone.co.in/logo.jpg",
    "@id": "https://www.ecofone.co.in/#local-business",
    "url": "https://www.ecofone.co.in",
    "telephone": "+919999988888",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Andheri West",
      "addressLocality": "Mumbai",
      "addressRegion": "MH",
      "postalCode": "400053",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 19.1136,
      "longitude": 72.8697
    },
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": aggregateRating.bestRating,
        "worstRating": aggregateRating.worstRating
      }
    })
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="overflow-hidden bg-white rounded-3xl p-8 md:p-12 border border-slate-100 relative min-h-[220px] flex flex-col justify-between shadow-sm">
        <div className="transition-all duration-500 ease-in-out">
          {/* Star rating rendering */}
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={i < reviews[currentIndex].rating ? 'text-amber-500 text-lg' : 'text-slate-200 text-lg'}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-slate-700 text-sm md:text-base italic leading-relaxed mb-4 font-medium">
            "{reviews[currentIndex].comment}"
          </p>
          {reviews[currentIndex].adminReply && (
            <div className="mb-6 p-4 bg-emerald-50/20 border border-emerald-500/10 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">
                Response from EcoFone:
              </span>
              <p className="text-xs text-slate-650 leading-relaxed italic">
                "{reviews[currentIndex].adminReply}"
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{reviews[currentIndex].authorName}</h4>
            {reviews[currentIndex].isVerified && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold mt-1 inline-block border border-emerald-100">
                ✓ {reviews[currentIndex].verifiedProduct ? `Verified Purchaser of ${reviews[currentIndex].verifiedProduct}` : 'Verified Customer'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls & Write a Review Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="order-2 sm:order-1 text-xs font-bold text-ecoOrange-600 hover:text-white border border-ecoOrange-600 hover:bg-ecoOrange-600 px-5 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
        >
          Write a Customer Review
        </button>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-4 order-1 sm:order-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
            aria-label="Previous Review"
          >
            ←
          </button>
          <div className="text-xs text-slate-500 self-center font-medium">
            {currentIndex + 1} / {reviews.length}
          </div>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
            aria-label="Next Review"
          >
            →
          </button>
        </div>
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-100 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5">
              <span className="text-[9px] text-ecoOrange-600 bg-ecoOrange-50 border border-ecoOrange-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
                Share Your Experience
              </span>
              <h3 className="font-display font-black text-slate-900 text-xl">Write a Review</h3>
              <p className="text-[11px] text-slate-400">Tell us what you think about our services and products.</p>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3">
                <svg className="w-10 h-10 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-bold text-emerald-800 text-base">Review Submitted!</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Thank you! Your feedback is highly valuable and will be displayed on the platform shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="text-red-600 bg-red-50 text-[11px] font-bold p-2.5 rounded-xl border border-red-100 text-center">
                    {errorMsg}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={newReview.authorName}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, authorName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-ecoOrange-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 text-center">Rating</label>
                    
                    {/* SVG Definitions for 3D Gradients */}
                    <svg width="0" height="0" className="absolute">
                      <defs>
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="40%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                        <linearGradient id="blankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" />
                          <stop offset="60%" stopColor="#e2e8f0" />
                          <stop offset="100%" stopColor="#94a3b8" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="flex gap-2 justify-center py-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isHighlighted = hoverRating !== null ? star <= hoverRating : star <= newReview.rating;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="transition-transform hover:scale-125 focus:outline-none"
                          >
                            <svg 
                              className={`w-9 h-9 ${
                                isHighlighted 
                                  ? 'drop-shadow-[0_3px_5px_rgba(245,158,11,0.45)]' 
                                  : 'drop-shadow-[0_2.5px_3.5px_rgba(0,0,0,0.18)]'
                              }`}
                              viewBox="0 0 24 24" 
                              strokeWidth="1.2"
                              stroke={isHighlighted ? "#d97706" : "#64748b"}
                              fill={isHighlighted ? "url(#goldGrad)" : "url(#blankGrad)"}
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Verified Purchase / Product Model (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 13 or Screen Diagnostic Service"
                      value={newReview.verifiedProduct}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, verifiedProduct: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-ecoOrange-500 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Your Review</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share details of your experience with EcoFone..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-ecoOrange-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-ecoOrange-600 hover:bg-ecoOrange-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting review...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
