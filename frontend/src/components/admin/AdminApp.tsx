'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import type { AdminSessionInfo } from '@/data/adminTypes';

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
