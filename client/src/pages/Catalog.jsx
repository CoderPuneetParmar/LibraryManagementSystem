import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Search, Filter, BookOpen, Star, CheckCircle, Clock, Bookmark } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const Catalog = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedGenre) params.genre = selectedGenre;
      if (availableOnly) params.available = 'true';

      const response = await API.get('/books', { params });
      setBooks(response.data);
    } catch (err) {
      setToast({ message: 'Failed to load catalog books.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, selectedGenre, availableOnly]);

  const genres = ['Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Web Development', 'Computer Networks', 'Programming', 'Database Systems'];

  const handleReserve = async (bookId) => {
    try {
      await API.post('/reservations', { bookId });
      setToast({ message: 'Book reservation created successfully!', type: 'success' });
      fetchBooks();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Reservation failed.', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Library Catalog</h1>
        <p className="text-slate-600 text-sm mt-1">Browse physical library titles, reserve unavailable books, or read e-books online.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-navy focus:border-navy"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Genre Select */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:ring-navy focus:border-navy"
          >
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Available Only Checkbox */}
          <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-navy focus:ring-navy h-4 w-4"
            />
            <span>Available Now</span>
          </label>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : books.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-slate-500">
          No books found matching your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => {
            const isAvailable = book.available_copies > 0;

            return (
              <div key={book.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                
                <div>
                  {/* Cover Image Header */}
                  <div className="relative h-48 bg-slate-800 overflow-hidden">
                    <img
                      src={book.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'}
                      alt={book.title}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {book.ebook && (
                        <span className="bg-amber-accent text-navy text-[11px] font-bold px-2 py-0.5 rounded shadow flex items-center">
                          <Bookmark className="w-3 h-3 mr-1" /> E-BOOK
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {book.genre}
                    </span>

                    <h3 className="font-bold text-navy text-lg mt-2 line-clamp-1 hover:text-amber-700 transition-colors">
                      <Link to={`/books/${book.id}`}>{book.title}</Link>
                    </h3>

                    <p className="text-xs text-slate-600 font-medium mt-0.5">By {book.author}</p>

                    {/* Ratings */}
                    <div className="flex items-center space-x-1 mt-2 text-amber-500 text-xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{book.average_rating ? book.average_rating : 'New'}</span>
                      <span className="text-slate-400">({book.review_count} reviews)</span>
                    </div>

                    {/* Availability Tag */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      {isAvailable ? (
                        <span className="flex items-center font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> {book.available_copies} Copies Available
                        </span>
                      ) : (
                        <span className="flex items-center font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <Clock className="w-3.5 h-3.5 mr-1" /> All Copies Issued (0 Available)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex gap-2">
                  <Link
                    to={`/books/${book.id}`}
                    className="flex-1 text-center py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View Details
                  </Link>

                  {!isAvailable ? (
                    <button
                      onClick={() => handleReserve(book.id)}
                      className="flex-1 py-2 px-3 bg-amber-accent hover:bg-amber-600 text-navy font-bold text-xs rounded-lg transition-colors"
                    >
                      Reserve Hold
                    </button>
                  ) : (
                    <span className="flex-1 py-2 px-2 text-center text-[11px] text-slate-500 font-medium flex items-center justify-center bg-slate-100 rounded-lg">
                      Walk-in Issue
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;
