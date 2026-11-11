import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, BookOpen, CheckCircle, ShieldCheck, AlertCircle } from "lucide-react";
import { getBook } from "../api/books";
import { addToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, refreshCart } = useAuth();
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const data = await getBook(id);
      setBook(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load book details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      setAdding(true);
      await addToCart(book.id, quantity);
      await refreshCart();
      setMessage(`Added ${quantity} ${quantity === 1 ? 'copy' : 'copies'} to your cart!`);
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-5xl w-full mx-auto p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-3xl w-full mx-auto p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800">Book Not Found</h2>
          <p className="text-gray-600 mt-1">{error || "The requested book could not be found."}</p>
          <Link
            to="/books"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const stock = book.stock ?? book.stock_quantity ?? 0;
  const inStock = stock > 0;
  const coverUrl = book.cover_image || book.cover_image_url;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Books
        </Link>

        {message && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Cover Image */}
          <div className="relative bg-gray-100 flex items-center justify-center min-h-[380px] p-8 border-b md:border-b-0 md:border-r border-gray-200">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="max-h-[420px] w-auto object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div className="text-center text-gray-400">
                <BookOpen className="w-20 h-20 mx-auto mb-2 text-gray-300" />
                <span className="text-sm font-medium">No Cover Image</span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                  {book.category || "General"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    inStock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {inStock ? `${stock} available` : "Out of stock"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{book.title}</h1>
              <p className="text-base text-gray-600 mt-1">by <span className="font-semibold text-gray-800">{book.author || "Unknown"}</span></p>

              <div className="mt-4 text-3xl font-extrabold text-blue-600">
                ${Number(book.price || 0).toFixed(2)}
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {book.description || "No overview available for this book."}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-500 block">ISBN</span>
                  <span className="font-semibold text-gray-800">{book.isbn || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Category</span>
                  <span className="font-semibold text-gray-800 capitalize">{book.category || "General"}</span>
                </div>
              </div>
            </div>

            {/* Purchase CTA */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-32">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !inStock}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold disabled:opacity-50"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={stock || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(stock || 1, parseInt(e.target.value) || 1)))}
                  className="w-full text-center text-sm font-semibold outline-none py-2"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
                  disabled={quantity >= (stock || 1) || !inStock}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock || adding}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white shadow-md transition ${
                  inStock
                    ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {adding ? "Adding to Cart..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

