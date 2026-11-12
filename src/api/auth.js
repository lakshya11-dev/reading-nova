import api from "./client";

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const googleLogin = async (idToken) => {
  const response = await api.post("/auth/google", { id_token: idToken });
  return response.data;
};

export const socialLogin = async (provider, providerId, email, name) => {
  const response = await api.post("/auth/social", {
    provider,
    provider_id: providerId,
    email,
    name,
  });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

