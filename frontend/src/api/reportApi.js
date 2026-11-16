import apiClient from './client';

export const reportApi = {
  /**
   * Daily Report: Opening & Closing balance for a given date (YYYY-MM-DD).
   */
  async getDailyReport(date) {
    const res = await apiClient.get('/reports/daily', {
      params: { date },
    });
    return res.data;
  },

  /**
   * Profit Report: Settled bills margins within date range (YYYY-MM-DD).
   */
  async getProfitReport(startDate, endDate) {
    const res = await apiClient.get('/reports/profit', {
      params: { startDate, endDate },
    });
    return res.data;
  },

  /**
   * Pending Funds Report: Outstanding receivables from dealers.
   */
  async getPendingFundsReport() {
    const res = await apiClient.get('/reports/pending-funds');
    return res.data;
  },

  /**
   * Expense Report: Categorized expense breakdown within date range (YYYY-MM-DD).
   */
  async getExpenseReport(startDate, endDate) {
    const res = await apiClient.get('/reports/expenses', {
      params: { startDate, endDate },
    });
    return res.data;
  },
};
