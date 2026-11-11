import api from "./client";

export const getPlans = async () => {
  const response = await api.get("/plans");
  return response.data;
};

export const createPlanRazorpayOrder = async (planId) => {
  const response = await api.post(`/plans/create-razorpay-order/${planId}`);
  return response.data;
};

export const subscribeToPlan = async (payload) => {
  const data = typeof payload === "string" ? { plan_id: payload } : payload;
  const response = await api.post("/plans/subscribe", data);
  return response.data;
};

export const triggerPlanExpirationCron = async () => {
  const response = await api.post("/plans/cron/expire");
  return response.data;
};

