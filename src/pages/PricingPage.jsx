import { useState, useEffect } from "react";
import { Check, Sparkles, Clock, ShieldCheck, CheckCircle2, AlertCircle, CreditCard, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getPlans, subscribeToPlan, createPlanRazorpayOrder } from "../api/plans";

export default function PricingPage() {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [plansData, setPlansData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, [isAuthenticated]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const data = await getPlans();
        setPlansData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = (plan) => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/pricing");
      return;
    }
    setSelectedPlanForModal(plan);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlanForModal) return;
    try {
      setSubscribingId(selectedPlanForModal.id);
      setErrorMsg(null);

      // Case 1: Free Plan
      if (selectedPlanForModal.price === 0) {
        const res = await subscribeToPlan({
          plan_id: selectedPlanForModal.id,
          payment_method: "free",
        });
        setSuccessMsg(res.message || `Activated ${selectedPlanForModal.name}!`);
        setSelectedPlanForModal(null);
        await fetchPlans();
        if (refreshProfile) await refreshProfile();
        setTimeout(() => setSuccessMsg(null), 5000);
        return;
      }

      // Case 2: Paid Plan via Razorpay
      const rpData = await createPlanRazorpayOrder(selectedPlanForModal.id);

      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      const options = {
        key: rpData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TsQGRnJ2ZXY1lB",
        amount: rpData.amount,
        currency: rpData.currency || "INR",
        name: "Reading Nova Membership",
        description: `Upgrade to ${selectedPlanForModal.name} (${selectedPlanForModal.duration_label})`,
        image: "/logo.png",
        order_id: rpData.razorpay_order_id,
        prefill: {
          name: user?.name || user?.full_name || "Bookstore Reader",
          email: user?.email || "",
          contact: user?.phone_number || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response) {
          try {
            // Activate plan only after verified payment
            const res = await subscribeToPlan({
              plan_id: selectedPlanForModal.id,
              payment_method: "razorpay",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            setSuccessMsg(res.message || `Activated ${selectedPlanForModal.name}!`);
            setSelectedPlanForModal(null);
            await fetchPlans();
            if (refreshProfile) await refreshProfile();
            setTimeout(() => setSuccessMsg(null), 5000);
          } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.detail || "Plan payment verification failed.");
          } finally {
            setSubscribingId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setSubscribingId(null);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (resp) {
        setErrorMsg(`Payment failed: ${resp.error?.description || "Transaction declined"}`);
        setSubscribingId(null);
      });
      razorpayInstance.open();

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || "Payment processing failed. Please try again.");
      setSubscribingId(null);
    }
  };

  // Fallback static plans if guest or loading
  const fallbackPlans = [
    {
      id: "free",
      name: "Free",
      tier: "free",
      price: 0.0,
      duration_label: "Forever Free",
      description: "Standard access to bookstore catalog and regular checkout.",
      features: [
        "Access to all catalog books",
        "Standard shipping rates",
        "Order history and invoice tracking",
        "Basic customer support",
      ],
      popular: false,
    },
    {
      id: "silver_1h",
      name: "Silver (1 Hour Trial)",
      tier: "silver",
      price: 4.99,
      duration_label: "1 Hour Access",
      description: "Flash reader plan: 1 hour of express shipping & 10% book discount.",
      features: [
        "10% discount on all books",
        "Free express delivery",
        "Active for 1 hour from payment",
        "Auto-expires back to Free tier via cron",
      ],
      popular: false,
    },
    {
      id: "silver_6h",
      name: "Silver (6 Hours)",
      tier: "silver",
      price: 14.99,
      duration_label: "6 Hours Access",
      description: "Ideal for focused reading sessions with priority benefits.",
      features: [
        "10% discount on all books",
        "Free priority delivery",
        "Active for 6 hours from payment",
        "Auto-expires back to Free tier via cron",
      ],
      popular: true,
    },
    {
      id: "gold_12h",
      name: "Gold (12 Hours)",
      tier: "gold",
      price: 29.99,
      duration_label: "12 Hours Access",
      description: "Full VIP day pass with maximum 20% discount and concierge support.",
      features: [
        "20% discount on all books",
        "Guaranteed same-day/next-day dispatch",
        "Active for 12 hours from payment",
        "Concierge librarian support",
      ],
      popular: false,
    },
  ];

  const displayPlans = plansData?.plans || fallbackPlans;
  const currentPlan = plansData?.current_plan || "Free";
  const currentPlanId = plansData?.current_plan_id || "free";
  const remainingSeconds = plansData?.remaining_seconds;

  const formatRemainingTime = (totalSec) => {
    if (!totalSec || totalSec <= 0) return null;
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Time-Limited Reading Memberships
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Flexible Time-Limited Pricing Plans
          </h1>
          <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed">
            Choose a plan (Free, Silver, or Gold) tailored for your reading needs. Timed plans automatically expire via background worker after 1 hour, 6 hours, or 12 hours.
          </p>
        </div>

        {/* Active Plan Status Banner */}
        {isAuthenticated && (
          <div className="mb-10 max-w-2xl mx-auto p-4 sm:p-5 bg-white border border-blue-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Current Active Plan
                </span>
                <span className="text-lg font-black text-gray-900">{currentPlan}</span>
              </div>
            </div>

            {remainingSeconds && remainingSeconds > 0 ? (
              <div className="text-right bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Expires in {formatRemainingTime(remainingSeconds)}
              </div>
            ) : (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                Standard Access
              </span>
            )}
          </div>
        )}

        {/* Notifications */}
        {successMsg && (
          <div className="mb-8 max-w-2xl mx-auto p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span className="text-sm font-bold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span className="text-sm font-bold">{errorMsg}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {displayPlans.map((plan) => {
            const isCurrent =
              currentPlanId === plan.id ||
              (!currentPlanId && currentPlan.toLowerCase().trim() === plan.name.toLowerCase().trim());
            const isFree = plan.price === 0;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm transition hover:shadow-lg border ${
                  plan.popular
                    ? "border-2 border-blue-600 ring-4 ring-blue-50"
                    : isCurrent
                    ? "border-2 border-emerald-500"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 bg-blue-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                {isCurrent && (
                  <span className="absolute -top-3 left-6 bg-emerald-600 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                    Current Active
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black text-gray-900 mt-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4 min-h-[36px]">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-4 border-b border-gray-100">
                    <span className="text-3xl font-black text-gray-900">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-500 text-xs font-semibold">
                      / {plan.duration_label}
                    </span>
                  </div>

                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => handleOpenCheckout(plan)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default"
                      : plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                      : "bg-gray-900 hover:bg-gray-800 text-white active:scale-95"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Active Plan
                    </>
                  ) : (
                    <>
                      {isFree ? "Downgrade to Free" : `Upgrade to ${plan.name}`} <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Guarantee Note */}
        <div className="mt-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure checkout sandbox. Automatic plan expiration managed by cron worker.</span>
        </div>
      </main>

      {/* Payment Confirmation Modal */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Payment Checkout</h3>
              </div>
              <button
                onClick={() => setSelectedPlanForModal(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-900">
                  <span>{selectedPlanForModal.name}</span>
                  <span className="text-blue-600 font-extrabold text-lg">
                    ${selectedPlanForModal.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Access duration: <strong>{selectedPlanForModal.duration_label}</strong>
                </p>
              </div>

              {selectedPlanForModal.price > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-blue-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Razorpay Secure Payment
                    </span>
                    <span className="text-[10px] uppercase tracking-wider bg-blue-200/70 text-blue-800 px-1.5 py-0.5 rounded font-extrabold">
                      Instant
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Supports UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking. Plan activates immediately after payment confirmation.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlanForModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={subscribingId !== null}
                onClick={handleConfirmPayment}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {subscribingId
                  ? "Processing Payment..."
                  : selectedPlanForModal.price === 0
                  ? "Confirm Free Tier"
                  : `Pay $${selectedPlanForModal.price.toFixed(2)} & Activate`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
