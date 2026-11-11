import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, BookOpen, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { getMyCart, updateCartItem, removeCartItem, clearCart } from "../api/cart";
import { getPlans } from "../api/plans";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Cart() {
  const navigate = useNavigate();
  const { refreshCart } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [userPlan, setUserPlan] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const [cartData, plansData] = await Promise.all([
        getMyCart(),
        getPlans().catch(() => null),
      ]);
      setCart(cartData);
      if (plansData) {
        setUserPlan(plansData);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch shopping cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      setUpdatingId(itemId);
      await updateCartItem(itemId, newQty);
      await fetchCart();
      await refreshCart();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not update item quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      setUpdatingId(itemId);
      await removeCartItem(itemId);
      await fetchCart();
      await refreshCart();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    try {
      await clearCart();
      await fetchCart();
      await refreshCart();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not clear cart");
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (acc, item) => acc + (item.book ? Number(item.book.price) * item.quantity : 0),
    0
  );

  const currentPlanName = (userPlan?.current_plan || "").toLowerCase();
  const isGold = currentPlanName.includes("gold");
  const isSilver = currentPlanName.includes("silver");
  const discountPct = isGold ? 20 : isSilver ? 10 : 0;
  const discountAmount = (subtotal * discountPct) / 100;
  const finalTotal = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-blue-600" />
          Shopping Cart
        </h1>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Your Cart is Empty</h2>
            <p className="text-gray-500 text-sm mt-1">
              Looks like you haven't added any books to your cart yet.
            </p>
            <Link
              to="/books"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
            >
              Explore Books <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
                <button
                  onClick={handleClear}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  Clear Cart
                </button>
              </div>

              {items.map((item) => {
                const bookImage = item.book?.cover_image || item.book?.cover_image_url;
                return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 flex gap-4 items-center shadow-sm hover:shadow-md transition"
                >
                  <div className="w-16 h-20 sm:w-20 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                    {bookImage ? (
                      <img
                        src={bookImage}
                        alt={item.book?.title || "Book"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/books/${item.book_id}`}
                      className="font-bold text-gray-900 text-sm sm:text-base hover:text-blue-600 line-clamp-1"
                    >
                      {item.book?.title || "Book Title"}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">by {item.book?.author || "Unknown"}</p>
                    <div className="text-sm font-extrabold text-blue-600 mt-2">
                      ${Number(item.book?.price || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingId === item.id}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={
                          updatingId === item.id ||
                          (item.book &&
                            item.quantity >= (item.book.stock ?? item.book.stock_quantity ?? 9999))
                        }
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={updatingId === item.id}
                      className="text-gray-400 hover:text-red-600 transition p-1.5"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );})}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountPct > 0 ? (
                    <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <span className="flex items-center gap-1 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {userPlan?.current_plan} Discount ({discountPct}%)
                      </span>
                      <span className="font-extrabold text-xs">-${discountAmount.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-gray-500 text-xs py-1">
                      <span>Member Discount</span>
                      <Link to="/pricing" className="text-blue-600 font-semibold hover:underline">
                        Upgrade for up to 20% off
                      </Link>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">
                      {isGold ? "Priority Next-Day (Free)" : isSilver ? "Express (Free)" : "Standard (Free)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax</span>
                    <span className="font-semibold text-gray-900">$0.00</span>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-extrabold text-gray-900">
                    <span>Total</span>
                    <span className="text-blue-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md transition"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/books"
                  className="mt-3 block text-center text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

