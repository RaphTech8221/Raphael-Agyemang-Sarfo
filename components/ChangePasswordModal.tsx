import React, { useState } from 'react';
import { User } from '../types';

interface ChangePasswordModalProps {
  currentUser: User;
  onClose: () => void;
  onPasswordUpdate: (newPassword: string) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ currentUser, onClose, onPasswordUpdate }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentPassword !== currentUser.password) {
      setError('Current password is incorrect.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    onPasswordUpdate(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all duration-300 ease-out animate-fade-in-up">
        <style>{`
          @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        `}</style>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Change Password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 focus:outline-none">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">{error}</div>}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <div className="flex justify-end pt-4 space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600 transition font-semibold">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
