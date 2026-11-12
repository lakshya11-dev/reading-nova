import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, BookOpen, AlertCircle, CheckCircle, Tag, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { getBooks } from "../api/books";
import { addToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Books() {
  const { isAuthenticated, refreshCart } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

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
      setError("Failed to load catalog. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Derive unique categories case-insensitively so "Tech" and "tech" are merged
  const categoryMap = new Map();
  books.forEach((b) => {
    if (b.category && b.category.trim()) {
      const lower = b.category.trim().toLowerCase();
      if (!categoryMap.has(lower)) {
        const formatted =
          b.category.trim().charAt(0).toUpperCase() + b.category.trim().slice(1).toLowerCase();
        categoryMap.set(lower, formatted);
      }
    }
  });
  const categories = ["all", ...Array.from(categoryMap.values()).sort()];

  useEffect(() => {
    let result = [...books];
    if (selectedCategory !== "all") {
      result = result.filter(
        (b) => (b.category || "").trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q)
      );
    }
    setFilteredBooks(result);
    setPage(1);
  }, [searchQuery, selectedCategory, books]);

  const totalItems = filteredBooks.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIdx = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const endIdx = Math.min(page * pageSize, totalItems);
  const paginatedBooks = filteredBooks.slice((page - 1) * pageSize, page * pageSize);

  const handleAddToCart = async (bookId) => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    try {
      setAddingId(bookId);
      await addToCart(bookId, 1);
      await refreshCart();
      setSuccessMessage("Added to your shopping cart!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not add book to cart");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-blue-100 mb-3">
              <BookOpen className="w-3.5 h-3.5" /> Book Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Discover Your Next Great Read
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base">
              Browse our curated collection of bestselling titles, academic texts, and literary classics.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl animate-fade-in shadow-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Tag className="w-5 h-5 text-gray-400 flex-shrink-0 hidden sm:block" />
            <span className="text-sm font-semibold text-gray-600 hidden sm:block">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 animate-pulse">
                <div className="h-64 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">No books found</h3>
            <p className="text-base text-gray-500 mt-2 max-w-md mx-auto">
              We couldn't find any books matching your criteria. Try adjusting your search or category filter.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedBooks.map((book) => {
              const stock = book.stock ?? book.stock_quantity ?? 0;
              const inStock = stock > 0;
              const coverUrl = book.cover_image || book.cover_image_url;
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  <Link to={`/books/${book.id}`} className="relative h-72 bg-gray-100 overflow-hidden block">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-5 bg-gradient-to-br from-gray-50 to-gray-200">
                        <BookOpen className="w-14 h-14 mb-2 text-gray-300" />
                        <span className="text-sm text-center font-medium line-clamp-2">{book.title}</span>
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        inStock ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {inStock ? `${stock} in stock` : "Out of stock"}
                    </span>
                    {book.category && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/70 backdrop-blur-sm text-white capitalize">
                        {book.category}
                      </span>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col">
                    <Link to={`/books/${book.id}`} className="hover:text-blue-600 transition">
                      <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-1">{book.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">by {book.author || "Unknown"}</p>

                    <p className="text-sm text-gray-600 mt-2.5 line-clamp-2 flex-1 leading-relaxed">
                      {book.description || "No description available."}
                    </p>

                    <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xl font-black text-gray-900">
                        ${Number(book.price || 0).toFixed(2)}
                      </span>

                      <button
                        onClick={() => handleAddToCart(book.id)}
                        disabled={!inStock || addingId === book.id}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm ${
                          inStock
                            ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {addingId === book.id ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">
                  Showing <span className="font-bold text-gray-900">{startIdx}</span> to{" "}
                  <span className="font-bold text-gray-900">{endIdx}</span> of{" "}
                  <span className="font-bold text-gray-900">{totalItems}</span> titles
                </span>
                <span className="text-gray-300">|</span>
                <label className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                  Per page:
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-2.5 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPage(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page <= 1}
                  className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                  title="First Page"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page <= 1}
                  className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setPage(num);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`min-w-[40px] h-[40px] px-3 text-sm font-bold rounded-xl border transition ${
                        num === page
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                <button
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page >= totalPages}
                  className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                  title="Next Page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setPage(totalPages);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page >= totalPages}
                  className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                  title="Last Page"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
        )}
      </main>
    </div>
  );
}

