import apiClient from './client';

export const masterDataApi = {
  /**
   * Fetch all users.
   */
  async getUsers() {
    const res = await apiClient.get('/users');
    return res.data;
  },

  /**
   * Create a new user.
   * Payload: { username, password, role }
   */
  async createUser(data) {
    const res = await apiClient.post('/users', data);
    return res.data;
  },

  /**
   * Fetch all tradeable agricultural items.
   */
  async getItems() {
    const res = await apiClient.get('/items');
    return res.data;
  },

  /**
   * Create a new item (commodity).
   * Payload: { name, unit }
   */
  async createItem(data) {
    const res = await apiClient.post('/items', data);
    return res.data;
  },
};
