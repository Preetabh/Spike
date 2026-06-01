import api from "../lib/axios";

export const channelService = {
  getChannelMessages: async (channelId) => {
    const response = await api.get(`/messages/${channelId}`);
    return response.data;
  },

  sendChannelMessage: async (channelId, payload) => {
    const response = await api.post(`/messages/${channelId}`, payload);
    return response.data;
  },
};
