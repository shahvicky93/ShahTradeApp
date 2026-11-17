import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { Eye, EyeOff, User, Lock, Shield } from 'lucide-react';

export function ProfileModal({ isOpen, onClose }) {
  const { currentUser, setCurrentUser } = useUser();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setCurrentPassword('');
    setNewUsername('');
    setNewPassword('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Current password is required to save changes.');
      return;
    }
    if (!newUsername && !newPassword) {
      setError('Enter a new username or new password to update.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await authApi.updateProfile({ currentPassword, newUsername, newPassword });
      setCurrentUser(updated);
      showToast('Profile updated successfully!');
      handleClose();
    } catch (err) {
      setError(err.userMessage || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profile" subtitle="Update your username or password" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current user info */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold uppercase">
            {currentUser?.username?.[0] || 'U'}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{currentUser?.username}</div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold uppercase">
              <Shield className="w-3 h-3" />
              {currentUser?.role?.replace('ROLE_', '') || 'USER'}
            </div>
          </div>
        </div>

        {/* Current Password (required to authorize) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Current Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
            />
            <button type="button" onClick={() => setShowCurrent((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* New Username */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            New Username <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value.toLowerCase().trim())}
              placeholder={`Keep current: ${currentUser?.username}`}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            New Password <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
            />
            <button type="button" onClick={() => setShowNew((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={handleClose} className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
