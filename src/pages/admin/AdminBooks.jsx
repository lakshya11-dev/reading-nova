import { useState, useEffect } from "react";
import { BookOpen, Plus, Edit, Trash2, Upload, AlertCircle, CheckCircle, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getBooks, createBook, updateBook, deleteBook, uploadBookCover } from "../../api/books";
import Navbar from "../../components/Navbar";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalError, setModalError] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
      setFilteredBooks(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch book catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFilteredBooks(books);
    } else {
      const q = search.toLowerCase();
      setFilteredBooks(
        books.filter(
          (b) =>
            b.title?.toLowerCase().includes(q) ||
            b.author?.toLowerCase().includes(q) ||
            b.isbn?.toLowerCase().includes(q) ||
            b.category?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, books]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalItems = filteredBooks.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIdx = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIdx = Math.min(currentPage * pageSize, totalItems);
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenModal = (book = null) => {
    setEditingBook(book);
    setSelectedFile(null);
    setModalError(null);
    if (book) {
      setTitle(book.title || "");
      setAuthor(book.author || "");
      setIsbn(book.isbn || "");
      setDescription(book.description || "");
      setCategory(book.category || "General");
      setPrice(book.price ? String(book.price) : "0");
      const currentStock = book.stock !== undefined ? book.stock : (book.stock_quantity !== undefined ? book.stock_quantity : 0);
      setStockQuantity(String(currentStock));
    } else {
      setTitle("");
      setAuthor("");
      setIsbn("");
      setDescription("");
      setCategory("General");
      setPrice("9.99");
      setStockQuantity("10");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBook(null);
    setSelectedFile(null);
    setModalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!title.trim()) {
      setModalError("Please provide a book title.");
      return;
    }
    if (!author.trim()) {
      setModalError("Please provide an author name.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim() || undefined,
        category: category.trim()
          ? category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase()
          : "General",
        price: parseFloat(price) >= 0 ? parseFloat(price) : 0,
        stock: parseInt(stockQuantity, 10) >= 0 ? parseInt(stockQuantity, 10) : 0,
      };

      if (isbn.trim()) {
        payload.isbn = isbn.trim();
      }

      let bookId;
      if (editingBook) {
        const updated = await updateBook(editingBook.id, payload);
        bookId = updated.id;
        setSuccess("Book updated successfully!");
      } else {
        const created = await createBook(payload);
        bookId = created.id;
        setSuccess("Book created successfully!");
      }

      // If a cover image file was chosen, upload to Storj S3
      if (selectedFile && bookId) {
        try {
          await uploadBookCover(bookId, selectedFile);
        } catch (uploadErr) {
          console.error("Cover upload warning:", uploadErr);
        }
      }

      handleCloseModal();
      await fetchBooks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errorMsg = "Failed to save book. Please check the details.";

      if (typeof detail === "string") {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail
          .map((d) => {
            const field = d.loc && d.loc.length > 0 ? d.loc[d.loc.length - 1] : "field";
            return `${field}: ${d.msg}`;
          })
          .join(" | ");
      } else if (typeof detail === "object" && detail !== null) {
        errorMsg = JSON.stringify(detail);
      }

      setModalError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this book?")) return;
    try {
      await deleteBook(id);
      setSuccess("Book deleted successfully!");
      await fetchBooks();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete book");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-600" />
              Book Inventory Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Add new titles, edit pricing and stock, and upload book covers to Storj S3.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Book
          </button>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Search Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 hidden sm:block">
            {filteredBooks.length} books found
          </span>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Cover & Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      No books found in the inventory.
                    </td>
                  </tr>
                ) : (
                  paginatedBooks.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/75 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                            {b.cover_image_url ? (
                              <img
                                src={b.cover_image_url}
                                alt={b.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block line-clamp-1">{b.title}</span>
                            <span className="text-xs text-gray-400">ISBN: {b.isbn || "N/A"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-800">{b.author || "Unknown"}</td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                          {b.category || "General"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-extrabold text-gray-900">
                        ${Number(b.price || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        {(() => {
                          const stockCount = b.stock !== undefined ? b.stock : (b.stock_quantity !== undefined ? b.stock_quantity : 0);
                          return (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                stockCount > 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {stockCount} in stock
                            </span>
                          );
                        })()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(b)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit book"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{startIdx}</span> to{" "}
              <span className="font-bold text-gray-800">{endIdx}</span> of{" "}
              <span className="font-bold text-gray-800">{totalItems}</span> books
            </span>

            <div className="flex items-center gap-1.5">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="mr-2 px-2.5 py-1 text-xs font-semibold bg-white border border-gray-300 rounded-lg text-gray-700 outline-none"
              >
                <option value="5">5 / page</option>
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
              </select>

              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[32px] h-[32px] px-2 text-xs font-bold rounded-lg border transition ${
                      num === currentPage
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingBook ? "Edit Book" : "Add New Book"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 font-medium">{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Book Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. The Great Gatsby"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Author</label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. F. Scott Fitzgerald"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ISBN <span className="text-gray-400 font-normal">(Auto if blank)</span>
                    </label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="e.g. 9780743273565"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val) {
                          setCategory(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
                        }
                      }}
                      placeholder="e.g. Fiction, Classics"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Stock Qty</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Book Cover Image (Storj S3 Upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {editingBook?.cover_image_url && !selectedFile && (
                    <p className="text-[11px] text-gray-500 mt-1">Existing cover will be kept unless replaced.</p>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editingBook ? "Update Book" : "Create Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

