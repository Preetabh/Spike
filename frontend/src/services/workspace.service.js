import api from "../lib/axios";

export const workspaceService = {
  getWorkspace: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
  },
};
