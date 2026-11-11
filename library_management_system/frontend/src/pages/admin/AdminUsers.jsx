import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Users, Search, CheckCircle2, XCircle, Shield, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Calendar } from "lucide-react";
import { listAdminUsers, updateAdminUserStatus } from "../../api/admin";
import Navbar from "../../components/Navbar";

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven query state so refreshing page preserves filters and pagination
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "";
  const statusFilter = searchParams.get("status") || "";

  const [searchInput, setSearchInput] = useState(search);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // Helper to update search params while preserving other filters
  const updateParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        updated.set(k, String(v));
      } else {
        updated.delete(k);
      }
    });
    setSearchParams(updated);
  };

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== "") params.is_active = statusFilter === "active";

      const data = await listAdminUsers(params);
      setUsers(data.items || data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim(), page: 1 });
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    const confirmMsg = `Are you sure you want to ${newStatus ? "activate" : "deactivate"} ${user.email}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setTogglingId(user.id);
      await updateAdminUserStatus(user.id, newStatus);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update user status");
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIdx = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endIdx = Math.min(page * pageSize, total);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              User & Customer Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              View registered readers, track verification statuses, and toggle account activation.
            </p>
          </div>
          <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            Total Users: <span className="text-blue-600 font-extrabold">{total}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => updateParams({ role: e.target.value, page: 1 })}
              className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-700 outline-none"
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
              className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-700 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => updateParams({ limit: e.target.value, page: 1 })}
              className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-700 outline-none"
              title="Items per page"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Pricing Plan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verified</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                      No users match the search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/75 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {u.profile_picture_url ? (
                              <img
                                src={u.profile_picture_url}
                                alt={u.name || u.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-xs text-blue-600">
                                {(u.name || u.full_name)?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{u.name || u.full_name || "Anonymous User"}</div>
                            <div className="text-xs text-gray-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {u.role === "admin" && <Shield className="w-3 h-3" />}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {u.plan_name || "Free"}
                          </span>
                          {u.plan_status === "expired" && (
                            <span className="block text-[10px] text-amber-600 font-semibold">
                              (Expired)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {u.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400">
                            <XCircle className="w-4 h-4" /> No
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={togglingId === u.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
                            u.is_active
                              ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {togglingId === u.id
                            ? "Updating..."
                            : u.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{startIdx}</span> to{" "}
              <span className="font-bold text-gray-800">{endIdx}</span> of{" "}
              <span className="font-bold text-gray-800">{total}</span> users
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateParams({ page: 1 })}
                disabled={page <= 1}
                title="First Page"
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                disabled={page <= 1}
                title="Previous Page"
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((num) => (
                <button
                  key={num}
                  onClick={() => updateParams({ page: num })}
                  className={`min-w-[34px] h-[34px] px-2 text-xs font-bold rounded-lg border transition ${
                    num === page
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })}
                disabled={page >= totalPages}
                title="Next Page"
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateParams({ page: totalPages })}
                disabled={page >= totalPages}
                title="Last Page"
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

