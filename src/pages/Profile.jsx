import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, MapPin, Camera, Download, FileText, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { getProfile, updateProfile, uploadProfilePicture, downloadProfile, autocompleteAddress } from "../api/profile";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user: authUser, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setFullName(data.name || data.full_name || "");
      setAddress(data.address || "");
    } catch (err) {
      console.error(err);
      setError("Failed to load user profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = async (e) => {
    const val = e.target.value;
    setAddress(val);
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
    const addr = s.formatted || s.description || s.text || (typeof s === "string" ? s : "");
    setAddress(addr);
    setShowSuggestions(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await updateProfile({
        name: fullName,
        full_name: fullName,
        address: address,
      });
      if (res?.profile) {
        setProfile(res.profile);
        setFullName(res.profile.name || res.profile.full_name || fullName);
        setAddress(res.profile.address || address);
      } else {
        await fetchProfileData();
      }
      await refreshProfile();
      setMessage("Profile information updated successfully!");
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPic(true);
      setError(null);
      await uploadProfilePicture(file);
      await fetchProfileData();
      await refreshProfile();
      setMessage("Avatar picture updated in cloud storage!");
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload profile picture.");
    } finally {
      setUploadingPic(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      await downloadProfile(format);
    } catch (err) {
      alert("Failed to download profile report.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-7 h-7 text-blue-600" />
          My Profile & Settings
        </h1>

        {message && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Summary */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-center">
              <div className="relative inline-block mx-auto mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-2 border-blue-500 shadow-inner flex items-center justify-center">
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile?.name || profile?.full_name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition"
                  title="Upload profile picture"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploadingPic}
                />
              </div>

              {uploadingPic && (
                <p className="text-xs text-blue-600 font-semibold mb-2">Uploading picture...</p>
              )}

              <h2 className="text-lg font-bold text-gray-900">{profile?.name || profile?.full_name || "User"}</h2>
              <p className="text-xs text-gray-500">{profile?.email}</p>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                  Role: {profile?.role || "Customer"}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    (profile?.is_verified || profile?.is_active)
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {(profile?.is_verified || profile?.is_active) ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>

            {/* Profile Export Reports */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                Export Profile
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Download a PDF or CSV report of your account information.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("pdf")}
                  disabled={downloading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold border border-red-200 transition"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  disabled={downloading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Details Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                Personal Information
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">Email cannot be changed directly.</span>
                </div>

                {/* Autocomplete Address Field */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Shipping Address / Delivery Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={handleAddressChange}
                      placeholder="Start typing your street or city..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

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

                {/* Reader Plan Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Reader Membership Plan
                    </div>
                    <Link
                      to="/pricing"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      Manage / Upgrade &rarr;
                    </Link>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">Active Tier:</span>
                    <span className="font-bold text-gray-900 capitalize">
                      {profile?.plan_name || "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold capitalize ${
                      profile?.plan_status === "expired" ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {profile?.plan_status || "Active"}
                    </span>
                  </div>
                  {profile?.plan_expires_at && (
                    <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-gray-200/60">
                      <span className="text-gray-600">Expires At:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(profile.plan_expires_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

