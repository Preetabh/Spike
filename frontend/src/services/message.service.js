import api from "../lib/axios";

export const messageService = {
  editMessage: async (messageId, payload) => {
    const response = await api.patch(`/messages/${messageId}`, payload);
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  reactMessage: async (messageId, payload) => {
    const response = await api.post(`/messages/${messageId}/react`, payload);
    return response.data;
  },
};
