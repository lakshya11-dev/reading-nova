import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { getMyOrders, cancelOrder } from "../api/orders";
import Navbar from "../components/Navbar";

export default function Orders() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const isNewOrderSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data);
      if (data.length > 0 && isNewOrderSuccess) {
        setExpandedId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}? This will automatically restore the book stock.`)) {
      return;
    }

    try {
      setCancellingId(orderId);
      await cancelOrder(orderId);
      setActionMessage(`Order #${orderId} has been successfully cancelled.`);
      await fetchOrders();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || "Could not cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const totalPages = Math.ceil(orders.length / pageSize) || 1;
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-7 h-7 text-blue-600" />
          My Orders & Invoices
        </h1>

        {actionMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{actionMessage}</span>
          </div>
        )}

        {isNewOrderSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Thank you for your purchase!</p>
              <p className="text-xs text-emerald-700">
                Your order has been placed successfully and is being prepared for shipment.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">No Orders Placed Yet</h2>
            <p className="text-gray-500 text-sm mt-1">
              You haven't placed any book orders yet. Browse our catalog to get started.
            </p>
            <Link
              to="/books"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const isExpanded = expandedId === order.id;
              const status = order.order_status || order.status;
              const canCancel = status === "pending" || status === "processing";
              const dateStr = order.created_at
                ? new Date(order.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition hover:border-gray-300"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-base">
                            Order #{order.id}
                          </span>
                          {getStatusBadge(status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Placed on {dateStr} • {order.items?.length || 0} {(order.items?.length === 1 ? "item" : "items")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Total Amount</span>
                        <span className="text-base font-extrabold text-blue-600">
                          ${Number(order.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Order Items Details & Cancellation CTA */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">
                      {order.delivery_address && (
                        <div className="flex items-start gap-2 text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200">
                          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-gray-800">Shipping Address: </span>
                            {order.delivery_address}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                          Purchased Items (click item to view book)
                        </h4>
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-2">
                            {order.items.map((it) => {
                              const bookId = it.book_id || it.book?.id;
                              const coverImg = it.book_cover_image || it.book?.cover_image || it.cover_image;
                              const content = (
                                <>
                                  <div className="flex items-center gap-3">
                                    {coverImg ? (
                                      <img
                                        src={coverImg}
                                        alt={it.book_title || "Book"}
                                        className="w-12 h-16 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-50 transition flex-shrink-0">
                                        <BookOpen className="w-6 h-6" />
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition block">
                                        {it.book_title || it.book?.title || `Book #${bookId}`}
                                      </span>
                                      <span className="text-xs text-gray-500 font-medium">
                                        Qty: {it.quantity} × ${Number(it.price_at_purchase || it.unit_price || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-extrabold text-base text-gray-900 block">
                                      ${(Number(it.price_at_purchase || it.unit_price || 0) * it.quantity).toFixed(2)}
                                    </span>
                                    {bookId && (
                                      <span className="text-xs text-blue-600 font-medium group-hover:underline">
                                        View details &rarr;
                                      </span>
                                    )}
                                  </div>
                                </>
                              );

                              return bookId ? (
                                <Link
                                  key={it.id}
                                  to={`/books/${bookId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="group bg-white rounded-xl border border-gray-200 p-3.5 flex items-center justify-between gap-4 hover:border-blue-300 hover:shadow-sm transition block"
                                >
                                  {content}
                                </Link>
                              ) : (
                                <div
                                  key={it.id}
                                  className="bg-white rounded-xl border border-gray-200 p-3.5 flex items-center justify-between gap-4"
                                >
                                  {content}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No item details available.</p>
                        )}
                      </div>

                      {/* Cancel Order Action Bar */}
                      <div className="pt-2 flex items-center justify-between border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {canCancel
                            ? "Order is not yet shipped. You can cancel it and receive an immediate restock."
                            : `This order is ${status} and can no longer be cancelled.`}
                        </span>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id);
                            }}
                            disabled={cancellingId === order.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg border border-red-200 transition active:scale-95 disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-500">
                  Showing{" "}
                  <strong className="text-gray-900 font-semibold">
                    {(currentPage - 1) * pageSize + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-gray-900 font-semibold">
                    {Math.min(currentPage * pageSize, orders.length)}
                  </strong>{" "}
                  of <strong className="text-gray-900 font-semibold">{orders.length}</strong> orders
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    aria-label="First page"
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      if (
                        p === 1 ||
                        p === totalPages ||
                        (p >= currentPage - 1 && p <= currentPage + 1)
                      ) {
                        const isActive = p === currentPage;
                        return (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition ${
                              isActive
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === currentPage - 2 || p === currentPage + 2) {
                        return (
                          <span key={p} className="text-xs text-gray-400 px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last page"
                    className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
