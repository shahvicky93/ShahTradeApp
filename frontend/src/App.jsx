import React, { useState } from 'react';
import { useUser } from './context/UserContext';
import { Navbar } from './components/common/Navbar';
import { TransactionList } from './components/transactions/TransactionList';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { MasterDataManager } from './components/master/MasterDataManager';
import { DebitModal } from './components/transactions/DebitModal';
import { CreditModal } from './components/transactions/CreditModal';
import { ExpenseModal } from './components/transactions/ExpenseModal';
import { FundModal } from './components/transactions/FundModal';
import { LoginPage } from './components/auth/LoginPage';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const { currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState('ledger');
  const [activeActionModal, setActiveActionModal] = useState(null); // 'DEBIT' | 'CREDIT' | 'EXPENSE' | 'FUND'
  const [ledgerRefreshTrigger, setLedgerRefreshTrigger] = useState(0);

  const handleTransactionSuccess = () => {
    setLedgerRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
        <div className="text-sm font-semibold text-emerald-100">Connecting to ShahTradeApp API...</div>
        <div className="text-xs text-slate-400 mt-1">Verifying user session & master data</div>
      </div>
    );
  }

  // If not logged in, render the Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenActionModal={(type) => setActiveActionModal(type)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ledger' && (
          <TransactionList
            key={ledgerRefreshTrigger}
            onOpenActionModal={(type) => setActiveActionModal(type)}
          />
        )}

        {activeTab === 'reports' && <ReportsDashboard />}

        {activeTab === 'master' && <MasterDataManager />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            🌾 <span className="font-semibold text-slate-700">ShahTradeApp</span> — Agricultural Trading, Inventory & Reports Engine
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Spring Boot 4.x • PostgreSQL Supabase • React 18 • Tailwind
          </div>
        </div>
      </footer>

      {/* Action Modals */}
      <DebitModal
        isOpen={activeActionModal === 'DEBIT'}
        onClose={() => setActiveActionModal(null)}
        onSuccess={handleTransactionSuccess}
      />

      <CreditModal
        isOpen={activeActionModal === 'CREDIT'}
        onClose={() => setActiveActionModal(null)}
        onSuccess={handleTransactionSuccess}
      />

      <ExpenseModal
        isOpen={activeActionModal === 'EXPENSE'}
        onClose={() => setActiveActionModal(null)}
        onSuccess={handleTransactionSuccess}
      />

      <FundModal
        isOpen={activeActionModal === 'FUND'}
        onClose={() => setActiveActionModal(null)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}
