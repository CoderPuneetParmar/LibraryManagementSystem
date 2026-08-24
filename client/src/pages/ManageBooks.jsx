import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { BookPlus, Edit, Trash2, Search, Plus, Bookmark, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [availableCopies, setAvailableCopies] = useState(1);
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/books');
      setBooks(res.data);
    } catch (err) {
      setToast({ message: 'Failed to load books.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setGenre('Computer Science');
    setIsbn('');
    setDescription('');
    setCoverImageUrl('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500');
    setTotalCopies(3);
    setAvailableCopies(3);
    setFileUrl('');
    setFileType('pdf');
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setIsbn(book.isbn || '');
    setDescription(book.description || '');
    setCoverImageUrl(book.cover_image_url || '');
    setTotalCopies(book.total_copies);
    setAvailableCopies(book.available_copies);
    setFileUrl(book.ebook ? book.ebook.file_url : '');
    setFileType(book.ebook ? book.ebook.file_type : 'pdf');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      author,
      genre,
      isbn,
      description,
      cover_image_url: coverImageUrl,
      total_copies: parseInt(totalCopies, 10),
      available_copies: parseInt(availableCopies, 10),
      file_url: fileUrl,
      file_type: fileType
    };

    try {
      if (editingBook) {
        await API.put(`/books/${editingBook.id}`, payload);
        setToast({ message: 'Book updated successfully!', type: 'success' });
      } else {
        await API.post('/books', payload);
        setToast({ message: 'New book added to catalog!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchBooks();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error saving book.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await API.delete(`/books/${id}`);
      setToast({ message: 'Book deleted from catalog.', type: 'success' });
      fetchBooks();
    } catch (err) {
      setToast({ message: 'Failed to delete book.', type: 'error' });
    }
  };

  const filteredBooks = books.filter(b => {
    const term = search.toLowerCase();
    return b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term) || b.genre.toLowerCase().includes(term);
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Manage Books & E-Books</h1>
          <p className="text-slate-500 text-sm">Add, update, or remove physical inventory and digital e-book links.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-amber-accent hover:bg-amber-600 text-navy font-bold text-sm rounded-lg transition-colors shadow flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog by title, author, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-navy focus:border-navy"
          />
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold tracking-wider border-b">
                <th className="p-3">Cover & Title</th>
                <th className="p-3">Genre</th>
                <th className="p-3">ISBN</th>
                <th className="p-3">Copies (Available / Total)</th>
                <th className="p-3">E-Book Link</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBooks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="p-3 flex items-center space-x-3">
                    <img
                      src={b.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'}
                      alt={b.title}
                      className="w-10 h-12 object-cover rounded shadow-sm flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold text-navy">{b.title}</p>
                      <p className="text-xs text-slate-500">{b.author}</p>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium">{b.genre}</span>
                  </td>
                  <td className="p-3 font-mono text-xs text-slate-500">{b.isbn || '—'}</td>
                  <td className="p-3 font-semibold">
                    <span className={b.available_copies > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {b.available_copies}
                    </span> / {b.total_copies}
                  </td>
                  <td className="p-3">
                    {b.ebook ? (
                      <span className="inline-flex items-center text-xs text-navy font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Bookmark className="w-3 h-3 mr-1 text-amber-600" /> {b.ebook.file_type.toUpperCase()} Attached
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">No E-book</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 text-slate-600 hover:text-navy hover:bg-slate-100 rounded transition-colors"
                      title="Edit Book"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
            <div className="p-4 bg-navy text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingBook ? 'Edit Book Item' : 'Add New Book to Catalog'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Genre</label>
                  <input
                    type="text"
                    required
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN Number</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Physical Copies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={availableCopies}
                    onChange={(e) => setAvailableCopies(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-sm"
                />
              </div>

              {/* Optional E-Book Attachment */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-amber-900 block">Optional E-Book Attachment</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="E-book File URL (e.g. PDF link)"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                    />
                  </div>
                  <div>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                    >
                      <option value="pdf">PDF</option>
                      <option value="epub">EPUB</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded text-sm hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-navy hover:bg-navy-dark text-white font-semibold rounded text-sm transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Book'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBooks;
