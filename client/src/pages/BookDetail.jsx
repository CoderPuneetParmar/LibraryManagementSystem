import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Star, CheckCircle, Clock, ArrowLeft, Bookmark, Send, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import formatDate from '../utils/formatDate';

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/books/${id}`);
      setBook(res.data);
    } catch (err) {
      setToast({ message: 'Failed to load book details.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const handleReserve = async () => {
    try {
      await API.post('/reservations', { bookId: book.id });
      setToast({ message: 'Reservation created successfully!', type: 'success' });
      fetchBookDetails();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Reservation failed.', type: 'error' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;
    setSubmittingReview(true);

    try {
      await API.post('/reviews', {
        bookId: book.id,
        rating,
        comment
      });
      setToast({ message: 'Thank you! Review submitted successfully.', type: 'success' });
      setComment('');
      fetchBookDetails();
    } catch (err) {
      setToast({ message: 'Failed to submit review.', type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!book) return <div className="p-8 text-center text-slate-600">Book not found.</div>;

  const isAvailable = book.available_copies > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Back Link */}
      <Link to="/catalog" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-navy mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Catalog
      </Link>

      {/* Main Book Card */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 lg:p-8">
          
          {/* Cover Column */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src={book.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'}
                alt={book.title}
                className="w-full h-80 object-cover"
              />
            </div>

            {book.ebook && (
              <div className="w-full max-w-xs mt-4">
                <a
                  href={book.ebook.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-navy hover:bg-navy-dark text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>Read E-Book ({book.ebook.file_type.toUpperCase()})</span>
                </a>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  {book.genre}
                </span>
                {book.isbn && <span className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</span>}
              </div>

              <h1 className="text-3xl font-extrabold text-navy mt-3">{book.title}</h1>
              <p className="text-slate-600 font-medium text-base mt-1">Author: <strong className="text-slate-800">{book.author}</strong></p>

              {/* Rating Header */}
              <div className="flex items-center space-x-2 mt-3 text-amber-500">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(book.average_rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-800 text-sm">{book.average_rating || 'No ratings'}</span>
                <span className="text-slate-400 text-xs">({book.review_count} reviews)</span>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider">Book Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed mt-2 whitespace-pre-line">
                  {book.description || 'No description available for this catalog entry.'}
                </p>
              </div>

              {/* Inventory status */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">PHYSICAL COPIES STATUS</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {isAvailable ? (
                      <span className="font-bold text-emerald-700 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> {book.available_copies} of {book.total_copies} available at desk
                      </span>
                    ) : (
                      <span className="font-bold text-rose-700 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-rose-600" /> 0 of {book.total_copies} available (All checked out)
                      </span>
                    )}
                  </div>
                </div>

                {user && user.role === 'member' && (
                  <div>
                    {!isAvailable ? (
                      <button
                        onClick={handleReserve}
                        className="px-5 py-2.5 bg-amber-accent hover:bg-amber-600 text-navy font-bold text-sm rounded-lg transition-colors shadow"
                      >
                        Reserve Hold
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic bg-white px-3 py-1.5 rounded border border-slate-200">
                        Visit desk for walk-in issue
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Review Form */}
        {user && user.role === 'member' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
            <h3 className="text-lg font-bold text-navy mb-4">Write a Member Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review / Comments</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts on the content, readability, or academic usefulness..."
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-navy focus:border-navy"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-navy hover:bg-navy-dark text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Existing Reviews List */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${user && user.role === 'member' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <h3 className="text-lg font-bold text-navy mb-4">Member Reviews & Feedback ({book.reviews?.length || 0})</h3>
          
          {(!book.reviews || book.reviews.length === 0) ? (
            <p className="text-slate-500 text-sm italic py-4">No reviews posted yet for this title. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {book.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="bg-navy p-1.5 rounded-full text-white">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-navy text-sm">{rev.user?.name || 'Anonymous Member'}</span>
                        <span className="text-[11px] text-slate-400 block">{formatDate(rev.date)}</span>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm mt-3 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookDetail;
