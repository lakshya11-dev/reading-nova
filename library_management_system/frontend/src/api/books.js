import api from "./client";

export const getBooks = async (params = {}) => {
  const response = await api.get("/books/", { params: { limit: 200, ...params } });
  return response.data;
};

export const getBook = async (bookId) => {
  const response = await api.get(`/books/${bookId}`);
  return response.data;
};

export const createBook = async (bookData) => {
  const response = await api.post("/books/", bookData);
  return response.data;
};

export const updateBook = async (bookId, bookData) => {
  const response = await api.put(`/books/${bookId}`, bookData);
  return response.data;
};

export const deleteBook = async (bookId) => {
  const response = await api.delete(`/books/${bookId}`);
  return response.data;
};

export const uploadBookCover = async (bookId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post(`/books/${bookId}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

