'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';

const MIN_PASSWORD_LENGTH = 8; // matches changePasswordSchema on the server

interface ChangePasswordModalProps {
    saving: boolean;
    error: string;
    onSave: (currentPassword: string, newPassword: string) => void;
    onCancel: () => void;
}

const inputClass =
    'w-full px-4 py-2.5 pr-11 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all';
const labelClass = 'block text-sm font-medium text-neutral-700 mb-2';

// Asks for the current password before a new one is accepted.
export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ saving, error, onSave, onCancel }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !saving) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [saving, onCancel]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            setFormError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
            return;
        }
        if (newPassword !== confirmPassword) {
            setFormError('New passwords do not match');
            return;
        }
        if (newPassword === currentPassword) {
            setFormError('New password must be different from the current one');
            return;
        }
        setFormError('');
        onSave(currentPassword, newPassword);
    };

    const shownError = formError || error;
    const type = showPasswords ? 'text' : 'password';

    const field = (id: string, label: string, value: string, onChange: (v: string) => void, autoComplete: string) => (
        <div>
            <label htmlFor={id} className={labelClass}>
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    required
                    maxLength={128}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                    autoFocus={id === 'current-password'}
                />
                <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={() => !saving && onCancel()} />
            <form
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="change-password-title"
                className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-5"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <h2 id="change-password-title" className="text-lg font-bold text-neutral-900">
                        Change Password
                    </h2>
                </div>
                {field('current-password', 'Current Password', currentPassword, setCurrentPassword, 'current-password')}
                {field('new-password', 'New Password', newPassword, setNewPassword, 'new-password')}
                {field('confirm-password', 'Confirm New Password', confirmPassword, setConfirmPassword, 'new-password')}
                <p className="text-xs text-neutral-500">
                    At least {MIN_PASSWORD_LENGTH} characters. Other devices will be signed out.
                </p>
                {shownError && (
                    <div className="flex items-start gap-2 bg-red-50 text-red-700 border border-red-200 rounded-lg p-3" role="alert">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{shownError}</span>
                    </div>
                )}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Change Password
                    </Button>
                </div>
            </form>
        </div>
    );
};
