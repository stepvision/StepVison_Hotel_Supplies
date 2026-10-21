'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { AdminSessionInfo } from '@/data/adminTypes';

// Loaded separately, so the login page never downloads the dashboard and
// the dashboard never downloads the login form.
const PageSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" aria-label="Loading" />
    </div>
);
const AdminLogin = dynamic(() => import('./AdminLogin').then((m) => m.AdminLogin), { loading: PageSpinner });
const AdminDashboard = dynamic(() => import('./AdminDashboard').then((m) => m.AdminDashboard), { loading: PageSpinner });



import { useRouter } from 'next/navigation';

// The sign-in form at /admin/login. A successful login opens the products page.
export const AdminLoginPage: React.FC = () => {
    const router = useRouter();
    const handleLoggedIn = useCallback(() => {
        router.replace('/admin/products');
        router.refresh();
    }, [router]);

    return <AdminLogin onLoggedIn={handleLoggedIn} />;
};

// The dashboard. Logging out (or an expired session) goes back to /admin/login.
export const AdminApp: React.FC<{ session: AdminSessionInfo }> = ({ session }) => {
    const router = useRouter();
    const handleLoggedOut = useCallback(() => {
        router.replace('/admin/login');
        router.refresh();
    }, [router]);

    return <AdminDashboard session={session} onLoggedOut={handleLoggedOut} />;
};
