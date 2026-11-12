import api from "./client";

export const createRazorpayOrder = async (amount = null) => {
  const payload = amount ? { amount: Number(amount) } : {};
  const response = await api.post("/orders/create-razorpay-order", payload);
  return response.data;
};

export const placeOrder = async (orderData = {}) => {
  const response = await api.post("/orders/", orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/");
  return response.data;
};

export const getOrderDetails = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/orders/${orderId}/cancel`);
  return response.data;
};

// Admin order endpoints
export const getAdminOrders = async () => {
  const response = await api.get("/admin/orders/");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/admin/orders/${orderId}/status`, {
    status: status,
    order_status: status,
  });
  return response.data;
};
