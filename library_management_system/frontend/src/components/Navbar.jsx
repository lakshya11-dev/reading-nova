import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.png";
import {
  ShoppingCart,
  User as UserIcon,
  Shield,
  LogOut,
  BookOpen,
  ChevronDown,
  Sparkles,
  Package,
  Layers,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, cartCount, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target)) {
        setAdminMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setAdminMenuOpen(false);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Left: Brand Logo & Title */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none flex-shrink-0"
          >
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-1 border border-slate-200/90 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200 overflow-hidden">
              <img
                src={logoImg}
                alt="Reading Nova Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                Reading <span className="text-blue-600">Nova</span>
              </span>
              <span className="text-xs text-slate-500 font-normal mt-1">
                A perfect place for readers and writers
              </span>
            </div>
          </Link>

          {/* 2. Middle: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive("/") && location.pathname === "/"
                  ? "text-blue-600 bg-blue-50/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              Home
            </Link>

            <Link
              to="/books"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive("/books")
                  ? "text-blue-600 bg-blue-50/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              Browse Books
            </Link>

            <Link
              to="/pricing"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive("/pricing")
                  ? "text-blue-600 bg-blue-50/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Reader Plans
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive("/orders")
                    ? "text-blue-600 bg-blue-50/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Package className="w-4 h-4 text-slate-500" />
                My Orders
              </Link>
            )}

            {/* Admin Portal Dropdown */}
            {isAdmin && (
              <div className="relative ml-2" ref={adminMenuRef}>
                <button
                  type="button"
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all border ${
                    adminMenuOpen || location.pathname.startsWith("/admin")
                      ? "bg-amber-100/90 text-amber-900 border-amber-300 shadow-xs"
                      : "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  Admin Panel
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
                </button>

                {adminMenuOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                    <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Management
                    </div>
                    <Link
                      to="/admin/books"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      Book Inventory
                    </Link>
                    <Link
                      to="/admin/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      Customer Orders
                    </Link>
                    <Link
                      to="/admin/users"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <Layers className="w-4 h-4 text-slate-400" />
                      Users & Members
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* 3. Right: Action Controls (Cart, User Avatar, Auth Buttons) */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Shopping Cart Button */}
                <Link
                  to="/cart"
                  className="relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition flex items-center justify-center group"
                  title="View Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-105" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm border-2 border-white animate-fade-in">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                {/* User Profile Dropdown Button */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-full transition focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {user?.profile_picture_url ? (
                        <img
                          src={user.profile_picture_url}
                          alt={user?.name || user?.full_name || "Profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (user?.name || user?.full_name || user?.email)?.[0]?.toUpperCase() || (
                          <UserIcon className="w-4 h-4 text-white" />
                        )
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate hidden md:inline">
                      {user?.name || user?.full_name || "My Account"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user?.name || user?.full_name || "Reading Nova Member"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          Account & Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          Orders & Invoices
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4.5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 active:scale-98 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden focus:outline-none"
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Slide-down Navigation Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in shadow-lg">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Home
          </Link>
          <Link
            to="/books"
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            Browse Books
          </Link>
          <Link
            to="/pricing"
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Reader Plans
          </Link>
          {isAuthenticated && (
            <Link
              to="/orders"
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              <Package className="w-4 h-4 text-slate-500" />
              My Orders
            </Link>
          )}

          {isAdmin && (
            <div className="pt-2 border-t border-slate-100">
              <span className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Admin Tools
              </span>
              <Link
                to="/admin/books"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <BookOpen className="w-4 h-4 text-slate-400" /> Books Inventory
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <Package className="w-4 h-4 text-slate-400" /> Customer Orders
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <Layers className="w-4 h-4 text-slate-400" /> Users & Permissions
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
