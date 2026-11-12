import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, Clock, XCircle, Search, ChevronDown, ChevronUp, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MapPin, Phone } from "lucide-react";
import { getAdminOrders, updateOrderStatus } from "../../api/orders";
import Navbar from "../../components/Navbar";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...orders];
    if (statusFilter) {
      result = result.filter(
        (o) => (o.order_status || o.status)?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          String(o.id).includes(q) ||
          String(o.user_id).includes(q) ||
          o.user?.email?.toLowerCase().includes(q) ||
          (o.user?.name || o.user?.full_name)?.toLowerCase().includes(q) ||
          o.delivery_address?.toLowerCase().includes(q) ||
          o.delivery_phone?.toLowerCase().includes(q) ||
          (o.order_status || o.status)?.toLowerCase().includes(q) ||
          o.payment_status?.toLowerCase().includes(q) ||
          o.items?.some((it) => it.book_title?.toLowerCase().includes(q) || it.book_author?.toLowerCase().includes(q))
      );
    }
    setFilteredOrders(result);
    setPage(1);
  }, [search, statusFilter, orders]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIdx = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const endIdx = Math.min(page * pageSize, totalItems);
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errMsg = "Failed to update order status.";
      if (typeof detail === "string") {
        errMsg = detail;
      } else if (Array.isArray(detail)) {
        errMsg = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
      } else if (detail && typeof detail === "object") {
        errMsg = detail.msg || JSON.stringify(detail);
      }
      alert(errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <Truck className="w-7 h-7 text-blue-600" />
              Customer Orders Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Fulfill bookstore orders, review purchased book lists, and update fulfillment tracking.
            </p>
          </div>
          <div className="text-sm font-semibold text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            Total Orders: <span className="text-blue-600 font-extrabold">{orders.length}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer, book..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg text-gray-700 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Shipping Destination</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status & Update</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                      No customer orders match the filters.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const isExpanded = expandedId === order.id;
                    const dateStr = order.created_at
                      ? new Date(order.created_at).toLocaleDateString()
                      : "N/A";
                    const orderStatus = order.order_status || order.status || "pending";
                    const shippingAddress = order.delivery_address || order.shipping_address;
                    const shippingPhone = order.delivery_phone || order.user?.phone_number;

                    return (
                      <>
                        <tr key={order.id} className="hover:bg-gray-50/75 transition">
                          <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-semibold text-gray-900 block">
                                {order.user?.name || order.user?.full_name || `User ID: ${order.user_id}`}
                              </span>
                              <span className="text-xs text-gray-400">{order.user?.email || ""}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            {shippingAddress ? (
                              <div className="space-y-1">
                                <div className="flex items-start gap-1.5 text-xs text-gray-800 leading-snug">
                                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span className="font-medium line-clamp-2" title={shippingAddress}>
                                    {shippingAddress}
                                  </span>
                                </div>
                                {shippingPhone && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                    <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <span>{shippingPhone}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No address provided</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{dateStr}</td>
                          <td className="px-6 py-4 font-extrabold text-blue-600 whitespace-nowrap">
                            ${Number(order.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={orderStatus.toLowerCase()}
                              disabled={updatingId === order.id}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : order.id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              {isExpanded ? "Hide" : "Items"}
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-gray-50/80">
                            <td colSpan="7" className="px-6 py-4">
                              <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                                  Shipping Destination & Contact
                                </span>
                                <p className="text-xs text-gray-800">
                                  <strong className="font-semibold">Address: </strong>
                                  {shippingAddress || "Not specified"}
                                </p>
                                {shippingPhone && (
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    <strong className="font-semibold">Phone: </strong>
                                    {shippingPhone}
                                  </p>
                                )}
                              </div>

                              <div className="text-xs font-semibold text-gray-600 uppercase mb-2">
                                Order Items Breakdown
                              </div>
                              <div className="space-y-2">
                                {order.items?.map((it) => {
                                  const coverImg = it.book_cover_image || it.book?.cover_image;
                                  return (
                                    <div
                                      key={it.id}
                                      className="bg-white p-2.5 rounded-lg border border-gray-200 flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        {coverImg ? (
                                          <img
                                            src={coverImg}
                                            alt={it.book_title || "Book"}
                                            className="w-8 h-10 object-cover rounded border border-gray-200 flex-shrink-0"
                                          />
                                        ) : (
                                          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        )}
                                        <span className="font-semibold text-gray-800">
                                          {it.book_title || it.book?.title || `Book ID: ${it.book_id}`}
                                        </span>
                                      </div>
                                      <div className="text-gray-600">
                                        Qty: <span className="font-bold">{it.quantity}</span> × $
                                        {Number(it.price_at_purchase || it.unit_price || 0).toFixed(2)} ={" "}
                                        <span className="font-bold text-gray-900">
                                          ${(Number(it.price_at_purchase || it.unit_price || 0) * it.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{startIdx}</span> to{" "}
              <span className="font-bold text-gray-800">{endIdx}</span> of{" "}
              <span className="font-bold text-gray-800">{totalItems}</span> orders
            </span>

            <div className="flex items-center gap-1.5">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="mr-2 px-2.5 py-1 text-xs font-semibold bg-white border border-gray-300 rounded-lg text-gray-700 outline-none"
              >
                <option value="5">5 / page</option>
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
              </select>

              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`min-w-[32px] h-[32px] px-2 text-xs font-bold rounded-lg border transition ${
                      num === page
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition"
                title="Last Page"
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

