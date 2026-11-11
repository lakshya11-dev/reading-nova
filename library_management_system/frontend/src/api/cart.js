import api from "./client";

export const getMyCart = async () => {
  const response = await api.get("/cart/");
  return response.data;
};

export const addToCart = async (bookId, quantity = 1) => {
  const response = await api.post("/cart/add", {
    book_id: bookId,
    quantity: quantity,
  });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/items/${itemId}`, {
    quantity: quantity,
  });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete("/cart/clear");
  return response.data;
};

