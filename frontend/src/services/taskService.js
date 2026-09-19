import apiClient from '../api/axios';

export const taskService = {
  async getTasks(params = {}) {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  async createTask(taskData) {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  async getTask(taskId) {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  },

  async updateTask(taskId, taskData) {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },
};
