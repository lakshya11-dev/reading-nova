import { Link } from "react-router-dom";
import { BookOpen, ShoppingBag, Shield, Sparkles, ArrowRight, CheckCircle, Truck, Users } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      {/* Main Home Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> A perfect place for readers and writers
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight mb-5">
            Discover, Collect & Read Your Favorite Books
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Explore thousands of bestselling titles, manage your reading wishlist, order paperbacks to your doorstep, and enjoy exclusive reader discounts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
            <Link
              to="/books"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95"
            >
              <BookOpen className="w-4 h-4" /> Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-300 rounded-xl transition"
            >
              Reader Plans
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">10,000+</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Books Available</p>
            </div>
            <div className="border-x border-slate-100">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">Free</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Home Delivery</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">24/7</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Online Support</p>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="bg-white border-y border-slate-200/80 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-lg mx-auto mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">How It Works</h2>
              <p className="text-sm text-slate-500">Order your next favorite book in three simple steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Explore the Catalog</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Search by title, author, or genre with real-time stock levels and cloud-hosted book covers.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Cart & Smart Checkout</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Add items to your cart with instant total calculation and address auto-completion for swift delivery.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Doorstep Delivery</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Track your order status directly from your dashboard and download receipts in PDF or CSV formats.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Reading Nova. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/books" className="hover:text-slate-800 transition">Catalog</Link>
            <Link to="/pricing" className="hover:text-slate-800 transition">Membership</Link>
            <Link to="/profile" className="hover:text-slate-800 transition">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
