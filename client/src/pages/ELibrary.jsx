import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Bookmark, FileText, Download, ExternalLink, Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const ELibrary = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null); // For reader modal
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        setLoading(true);
        const res = await API.get('/ebooks');
        setEbooks(res.data);
      } catch (err) {
        setToast({ message: 'Failed to load e-books catalog.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, []);

  const filteredEbooks = ebooks.filter(e => {
    const titleMatch = e.book?.title.toLowerCase().includes(search.toLowerCase());
    const authorMatch = e.book?.author.toLowerCase().includes(search.toLowerCase());
    const genreMatch = e.book?.genre.toLowerCase().includes(search.toLowerCase());
    return titleMatch || authorMatch || genreMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-navy p-2 rounded-xl text-amber-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-navy tracking-tight">Digital E-Library</h1>
            <p className="text-slate-600 text-sm">Access 24/7 digital textbooks, PDF standard documents, and EPUB materials.</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search e-books by title, author, or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-navy focus:border-navy"
          />
        </div>
      </div>

      {/* E-Books Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredEbooks.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-slate-500">
          No digital e-books found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEbooks.map((ebook) => (
            <div key={ebook.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              
              <div>
                <div className="relative h-44 bg-slate-800">
                  <img
                    src={ebook.book?.cover_image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'}
                    alt={ebook.book?.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-navy text-amber-300 text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow uppercase">
                      {ebook.file_type}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {ebook.book?.genre}
                  </span>

                  <h3 className="font-bold text-navy text-base mt-2 line-clamp-2">
                    {ebook.book?.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">By {ebook.book?.author}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex gap-2">
                <button
                  onClick={() => setSelectedPdf(ebook)}
                  className="flex-1 py-2 px-3 bg-navy hover:bg-navy-dark text-white font-semibold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Read Online</span>
                </button>

                <a
                  href={ebook.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-semibold flex items-center justify-center transition-colors border border-slate-200"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Embedded PDF Reader Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-navy text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{selectedPdf.book?.title}</h3>
                <p className="text-xs text-amber-300 font-mono">Format: {selectedPdf.file_type.toUpperCase()}</p>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={selectedPdf.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-amber-accent text-navy px-3 py-1.5 rounded font-bold flex items-center space-x-1"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Reader Frame */}
            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={selectedPdf.file_url}
                title={selectedPdf.book?.title}
                className="w-full h-full rounded border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ELibrary;
