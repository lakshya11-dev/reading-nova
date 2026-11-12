import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle, ShieldCheck, MapPin, Truck, AlertCircle, ShoppingBag, ArrowLeft, Sparkles, CreditCard, Banknote } from "lucide-react";
import { getMyCart } from "../api/cart";
import { placeOrder, createRazorpayOrder } from "../api/orders";
import { autocompleteAddress, reverseGeocode } from "../api/profile";
import { getPlans } from "../api/plans";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import InteractiveMap from "../components/InteractiveMap";

export default function Checkout() {
  const navigate = useNavigate();
  const { user, refreshCart, refreshProfile } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Payment Mode Selection: "razorpay" (Online) or "cod" (Cash on Delivery)
  const [paymentMode, setPaymentMode] = useState("razorpay");

  // Address and Map Coordinates state
  const [addressInput, setAddressInput] = useState(user?.address || "");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    fetchCart();
    getPlans().then((p) => setUserPlan(p)).catch(() => {});
    if (user?.address) {
      setAddressInput(user.address);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getMyCart();
      if (!data.items || data.items.length === 0) {
        navigate("/cart");
        return;
      }
      setCart(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch cart for checkout.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = async (e) => {
    const val = e.target.value;
    setAddressInput(val);
    if (val.length >= 3) {
      try {
        const results = await autocompleteAddress(val);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (s) => {
    const formatted = s.formatted || s.description || s.text || (typeof s === "string" ? s : "");
    setAddressInput(formatted);
    if (s.latitude && s.longitude) {
      setLatitude(s.latitude);
      setLongitude(s.longitude);
    }
    setShowSuggestions(false);
  };

  const handleMapLocationSelect = async (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
    try {
      const data = await reverseGeocode(lat, lon);
      if (data && data.formatted) {
        setAddressInput(data.formatted);
      }
    } catch (err) {
      console.error("Reverse geocode failed:", err);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!addressInput.trim()) {
      setError("Please provide a shipping address.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Mode 1: Cash on Delivery (COD)
      if (paymentMode === "cod") {
        const order = await placeOrder({
          delivery_address: addressInput.trim(),
          latitude: latitude,
          longitude: longitude,
          payment_method: "cod",
        });
        if (refreshProfile) await refreshProfile();
        await refreshCart();
        navigate(`/orders?success=true&order_id=${order.id}`);
        return;
      }

      // Mode 2: Razorpay Online Payment
      // Step A: Create Razorpay Order on server
      const rpData = await createRazorpayOrder(finalTotal);

      // Verify Razorpay script is loaded
      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // Step B: Open Razorpay Checkout modal
      const options = {
        key: rpData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TsQGRnJ2ZXY1lB",
        amount: rpData.amount,
        currency: rpData.currency || "INR",
        name: "Reading Nova Bookstore",
        description: `Order Payment (${items.length} ${items.length === 1 ? "book" : "books"})`,
        image: "/logo.png",
        order_id: rpData.razorpay_order_id,
        prefill: {
          name: user?.name || user?.full_name || "Bookstore Customer",
          email: user?.email || "",
          contact: user?.phone_number || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response) {
          try {
            // Step C: Only after payment is verified by Razorpay, place the order on server
            const placedOrder = await placeOrder({
              delivery_address: addressInput.trim(),
              latitude: latitude,
              longitude: longitude,
              payment_method: "razorpay",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (refreshProfile) await refreshProfile();
            await refreshCart();
            navigate(`/orders?success=true&order_id=${placedOrder.id}`);
          } catch (err) {
            console.error("Order placement post-payment failed:", err);
            setError(err.response?.data?.detail || "Payment received but failed to record order. Please contact support.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (resp) {
        console.error("Razorpay Payment Failed:", resp.error);
        setError(`Payment failed: ${resp.error?.description || "Transaction declined"}`);
        setSubmitting(false);
      });
      razorpayInstance.open();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to initiate payment. Please try again.");
      setSubmitting(false);
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <Truck className="w-7 h-7 text-blue-600" />
          Checkout & Shipping
        </h1>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shipping & Payment Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Shipping Destination
                </h2>

                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address / Delivery Location
                  </label>
                  <input
                    type="text"
                    required
                    value={addressInput}
                    onChange={handleAddressChange}
                    placeholder="Search address or enter street, city, country..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {suggestions.map((s, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSelectSuggestion(s)}
                          className="px-4 py-2.5 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                        >
                          {s.formatted || s.description || s.text || (typeof s === "string" ? s : "")}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Interactive Map Preview & Pin Picker */}
                <div className="mt-4">
                  <InteractiveMap
                    latitude={latitude}
                    longitude={longitude}
                    address={addressInput}
                    onLocationSelect={handleMapLocationSelect}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.name || user?.full_name || ""}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || ""}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Mode of Payment Selector */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  Select Mode of Payment
                </h2>

                <div className="space-y-3">
                  {/* Option 1: Razorpay Online Payment */}
                  <label
                    onClick={() => setPaymentMode("razorpay")}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMode === "razorpay"
                        ? "border-blue-600 bg-blue-50/50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value="razorpay"
                      checked={paymentMode === "razorpay"}
                      onChange={() => setPaymentMode("razorpay")}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          Pay Online with Razorpay (UPI, Cards, NetBanking)
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-extrabold text-[10px] rounded-md tracking-wider uppercase">
                          Instant & Secure
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Secured by Razorpay. Orders are placed and confirmed instantly upon verified payment receipt.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMode("cod")}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMode === "cod"
                        ? "border-blue-600 bg-blue-50/50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value="cod"
                      checked={paymentMode === "cod"}
                      onChange={() => setPaymentMode("cod")}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-bold text-[10px] rounded-md">
                          Pay upon delivery
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Pay in cash or UPI directly to our delivery courier when your books arrive.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Items Review */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                  Review Items ({items.length})
                </h2>

                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 mb-4">
                  {items.map((it) => {
                    const coverImg = it.book?.cover_image || it.book?.cover_image_url;
                    return (
                      <div key={it.id} className="flex justify-between items-center gap-3 text-xs">
                        <div className="flex items-center gap-2.5 truncate">
                          {coverImg ? (
                            <img
                              src={coverImg}
                              alt={it.book?.title || "Book"}
                              className="w-8 h-11 object-cover rounded border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-11 bg-gray-100 rounded flex items-center justify-center text-gray-400 flex-shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-semibold text-gray-800 block truncate">
                              {it.book?.title}
                            </span>
                            <span className="text-gray-500">Qty: {it.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-800 flex-shrink-0">
                          ${((it.book ? Number(it.book.price) : 0) * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountPct > 0 && (
                    <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      <span className="flex items-center gap-1 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {userPlan?.current_plan} Discount ({discountPct}%)
                      </span>
                      <span className="font-extrabold text-xs">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600">
                      {isGold ? "Priority Next-Day (Free)" : isSilver ? "Express (Free)" : "Standard (Free)"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t pt-2">
                    <span>Total Due</span>
                    <span className="text-blue-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {paymentMode === "razorpay" ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {submitting ? "Opening Payment Gateway..." : `Pay $${finalTotal.toFixed(2)} with Razorpay`}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {submitting ? "Placing Order..." : "Confirm & Place COD Order"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

