import apiClient from './client';

export const transactionApi = {
  /**
   * Record a DEBIT (buying) transaction.
   * Payload: { itemId, userId, grossQty, tareWeight, ratePerUnit, description }
   */
  async recordDebit(data) {
    const res = await apiClient.post('/transactions/debit', data);
    return res.data;
  },

  /**
   * Record a CREDIT (selling / bill) transaction.
   * Payload: { dealerName, itemId, userId, grossQty, netQty, ratePerUnit, loadingCost, carrierCharges, paymentStatus, description }
   */
  async recordCredit(data) {
    const res = await apiClient.post('/transactions/credit', data);
    return res.data;
  },

  /**
   * Record an EXPENSE transaction.
   * Payload: { userId, expenseCategory, amount, description }
   */
  async recordExpense(data) {
    const res = await apiClient.post('/transactions/expense', data);
    return res.data;
  },

  /**
   * Record a FUND (capital injection) transaction.
   * Payload: { userId, amount, description }
   */
  async recordFund(data) {
    const res = await apiClient.post('/transactions/fund', data);
    return res.data;
  },

  /**
   * List all transactions.
   */
  async listAll() {
    const res = await apiClient.get('/transactions');
    return res.data;
  },

  /**
   * Get transaction by ID.
   */
  async getById(id) {
    const res = await apiClient.get(`/transactions/${id}`);
    return res.data;
  },

  /**
   * Filter transactions by type (DEBIT, CREDIT, EXPENSE, FUND).
   */
  async listByType(type) {
    const res = await apiClient.get(`/transactions/type/${type}`);
    return res.data;
  },
};
