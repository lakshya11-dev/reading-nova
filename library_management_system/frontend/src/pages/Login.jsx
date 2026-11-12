import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin, facebookLogin } from "../api/auth";
import { initFacebookSDK, loginWithFacebook } from "../utils/facebookAuth";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/books";

  useEffect(() => {
    initFacebookSDK().catch((e) => console.log("Facebook SDK prefetch:", e));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(email, password);
      await login(res.access_token);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      setLoading(true);
      const res = await googleLogin(credentialResponse.credential);
      await login(res.access_token);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || "Google login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was unsuccessful. Please try again.");
  };

  const handleFacebookLogin = async () => {
    setError("");
    try {
      setFbLoading(true);
      const token = await loginWithFacebook();
      const res = await facebookLogin(token);
      await login(res.access_token);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Facebook login was unsuccessful. Please try again.";
      setError(msg);
    } finally {
      setFbLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl inline-flex items-center justify-center p-1.5 mb-3 shadow-md shadow-slate-100 overflow-hidden hover:scale-105 transition-transform">
              <img src={logoImg} alt="Reading Nova logo" className="w-full h-full object-contain" />
            </div>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to your Reading Nova account</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <span>⚠️</span>
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {/* Standard Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Social Login Separator */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs uppercase font-bold text-slate-400">or sign in with</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Social OAuth Buttons (Google & Facebook Sign-In) */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="pill"
              width="320"
              text="signin_with"
            />
          </div>

          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={fbLoading || loading}
            className="w-full max-w-[320px] mx-auto py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-60"
          >
            {fbLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{" "}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
