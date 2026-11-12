import api from "./client";

export const getProfile = async () => {
  const response = await api.get("/profile/me");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/profile/me", profileData);
  return response.data;
};

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/profile/upload-picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const downloadProfile = async (format = "pdf") => {
  const response = await api.get(`/profile/download?format=${format}`, {
    responseType: "blob",
  });
  
  // Create a blob link and trigger automatic download
  const blob = new Blob([response.data], {
    type: format === "csv" ? "text/csv" : "application/pdf",
  });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `user_profile.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(link.href);
};

export const autocompleteAddress = async (text) => {
  if (!text || text.length < 3) return [];
  const response = await api.get(`/address/autocomplete?text=${encodeURIComponent(text)}`);
  return response.data.suggestions || [];
};

export const reverseGeocode = async (lat, lon) => {
  const response = await api.get(`/address/reverse-geocode?lat=${lat}&lon=${lon}`);
  return response.data;
};


