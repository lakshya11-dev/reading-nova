import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../api/auth";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No verification token found in URL.");
      setLoading(false);
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setSuccess(true);
      } catch (err) {
        const msg = err.response?.data?.detail || "Invalid or expired verification link.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 w-full max-w-md text-center">
        {loading && (
          <div className="py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Verifying Your Email...</h2>
            <p className="text-xs text-slate-500 mt-1">Please wait while we confirm your account.</p>
          </div>
        )}

        {!loading && success && (
          <div className="py-6">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Your email address has been successfully verified. You can now sign in and explore the bookstore.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-200 transition"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {!loading && error && (
          <div className="py-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-xs text-red-600 leading-relaxed mb-6 font-medium">
              {error}
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

