'use client';

import React, { useCallback } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import type { AdminSessionInfo } from '@/data/adminTypes';
console.log("sad");


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
