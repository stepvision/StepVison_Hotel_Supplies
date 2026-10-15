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



// Logging in or out changes the cookies the admin pages are rendered from,
// so these load the next page in full. A client-side navigation followed by
// router.refresh() could be cut short and leave a blank page.

// The sign-in form at /admin/login. A successful login opens the products page.
// The form keeps its spinner while that page loads.
export const AdminLoginPage: React.FC = () => {
    const handleLoggedIn = useCallback(() => window.location.replace('/admin/products'), []);

    return <AdminLogin onLoggedIn={handleLoggedIn} />;
};

// The dashboard. Logging out (or an expired session) goes back to /admin/login.
export const AdminApp: React.FC<{ session: AdminSessionInfo }> = ({ session }) => {
    const handleLoggedOut = useCallback(() => window.location.replace('/admin/login'), []);

    return <AdminDashboard session={session} onLoggedOut={handleLoggedOut} />;
};
