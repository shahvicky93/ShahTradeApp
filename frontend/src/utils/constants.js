export const TRANSACTION_TYPES = {
  DEBIT: {
    label: 'Debit (Buying)',
    shortLabel: 'DEBIT',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
    description: 'Procurement of agricultural produce with tare deduction',
  },
  CREDIT: {
    label: 'Credit (Selling / Bills)',
    shortLabel: 'CREDIT',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'Sale of commodities to dealers with operational charges',
  },
  EXPENSE: {
    label: 'Expense',
    shortLabel: 'EXPENSE',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Operational and overhead expenditures',
  },
  FUND: {
    label: 'Capital / Fund',
    shortLabel: 'FUND',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Capital adjustments or credit fund injections',
  },
};

export const EXPENSE_CATEGORIES = [
  { value: 'DELIVERY_COST', label: 'Delivery Cost', icon: 'Truck' },
  { value: 'HOUSEHOLD', label: 'Household', icon: 'Home' },
  { value: 'PERSONAL', label: 'Personal', icon: 'User' },
  { value: 'CAR', label: 'Car Maintenance / Fuel', icon: 'Car' },
  { value: 'BIKE', label: 'Bike Maintenance / Fuel', icon: 'Bike' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous', icon: 'HelpCircle' },
];

export const PAYMENT_STATUSES = {
  FULLY_PAID: {
    label: 'Fully Paid',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  PARTIALLY_PAID: {
    label: 'Partially Paid',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  PENDING: {
    label: 'Pending',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

export const PRESET_USERS = [
  { username: 'admin', defaultPass: 'admin123', role: 'ADMIN' },
  { username: 'user1', defaultPass: 'user123', role: 'USER' },
  { username: 'user2', defaultPass: 'user123', role: 'USER' },
  { username: 'user3', defaultPass: 'user123', role: 'USER' },
];
