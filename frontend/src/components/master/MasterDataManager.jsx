import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { masterDataApi } from '../../api/masterDataApi';
import { Modal } from '../common/Modal';
import { formatDateTime } from '../../utils/formatters';
import {
  Sprout,
  Users,
  Plus,
  Shield,
  CheckCircle2,
  Package,
} from 'lucide-react';

export function MasterDataManager() {
  const { users, items, refreshMasterData } = useUser();
  const { showToast } = useToast();

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('KG');
  const [savingItem, setSavingItem] = useState(false);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');
  const [savingUser, setSavingUser] = useState(false);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      showToast('Commodity name is required.', 'error');
      return;
    }

    setSavingItem(true);
    try {
      await masterDataApi.createItem({
        name: newItemName.trim(),
        unit: newItemUnit.trim().toUpperCase(),
      });
      showToast(`Commodity "${newItemName}" created successfully!`);
      setNewItemName('');
      setItemModalOpen(false);
      refreshMasterData();
    } catch (err) {
      showToast(err.userMessage || 'Failed to add commodity.', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      showToast('Username is required.', 'error');
      return;
    }

    setSavingUser(true);
    try {
      await masterDataApi.createUser({
        username: newUsername.trim().toLowerCase(),
        password: newUserPassword.trim() || 'user123',
        role: newUserRole,
      });
      showToast(`User "${newUsername}" created successfully!`);
      setNewUsername('');
      setNewUserPassword('');
      setUserModalOpen(false);
      refreshMasterData();
    } catch (err) {
      showToast(err.userMessage || 'Failed to create user.', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Commodities Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Tradeable Commodities ({items.length})
              </h3>
              <p className="text-xs text-slate-500">
                Managed items for purchase, billing, and inventory tracking
              </p>
            </div>
          </div>

          <button
            onClick={() => setItemModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Commodity
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{item.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-semibold">
                  {item.unit}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Added: {formatDateTime(item.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                System Operators & Users ({users.length})
              </h3>
              <p className="text-xs text-slate-500">
                Users authenticated via Basic Auth and tracked across every transaction
              </p>
            </div>
          </div>

          <button
            onClick={() => setUserModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400">#{u.id}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 capitalize flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-mono">
                      {u.username[0]}
                    </div>
                    {u.username}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-normal">
                    {formatDateTime(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Commodity Modal */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title="Add New Commodity"
        subtitle="Introduce a new tradeable grain, pulse, or agricultural produce"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Commodity Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. Mustard, Soybean, Maize"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trading Unit <span className="text-rose-500">*</span>
            </label>
            <select
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            >
              <option value="KG">KG (Kilograms)</option>
              <option value="QUINTAL">QUINTAL (100 KG)</option>
              <option value="BAGS">BAGS</option>
              <option value="TON">TON</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingItem}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              {savingItem ? 'Saving...' : 'Add Commodity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Add New User / Operator"
        subtitle="Create credentials for system access and ledger tracking"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="e.g. user4, manager"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password (defaults to 'user123' if blank)
            </label>
            <input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="USER">USER (Operator)</option>
              <option value="ADMIN">ADMIN (Full Access)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingUser}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              {savingUser ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
