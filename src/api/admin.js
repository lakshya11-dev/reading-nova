import api from "./client";

export const listAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

export const getAdminUserDetails = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateAdminUserStatus = async (userId, isActive) => {
  const response = await api.patch(`/admin/users/${userId}/status`, {
    is_active: isActive,
  });
  return response.data;
};

