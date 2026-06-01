import api from "../lib/axios";

export const dmService = {
  getDMs: async () => {
    const response = await api.get("/dm");
    return response.data;
  },

  getDMMessages: async (dmId) => {
    const response = await api.get(`/dm/${dmId}/messages`);
    return response.data;
  },

  sendDMMessage: async (dmId, payload) => {
    const response = await api.post(`/dm/${dmId}/messages`, payload);
    return response.data;
  },
};
