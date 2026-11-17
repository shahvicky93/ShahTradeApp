import apiClient, { setAuthCredentials, clearAuthCredentials } from './client';

export const authApi = {
  /**
   * Authenticates user with POST /api/auth/login.
   */
  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      const user = response.data;
      setAuthCredentials(username, password, user.token);
      return user;
    } catch (err) {
      clearAuthCredentials();
      throw err;
    }
  },

  /**
   * Fetches the currently authenticated user's profile from /api/auth/me.
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout() {
    clearAuthCredentials();
  },

  /**
   * Updates the current user's username and/or password.
   * Returns updated user + new token so session stays alive.
   */
  async updateProfile({ currentPassword, newUsername, newPassword }) {
    const response = await apiClient.put('/auth/me', { currentPassword, newUsername, newPassword });
    const user = response.data;
    // Update stored credentials with new username/password
    const resolvedUser = user.username;
    const resolvedPass = newPassword || currentPassword;
    setAuthCredentials(resolvedUser, resolvedPass, user.token);
    return user;
  },
};
