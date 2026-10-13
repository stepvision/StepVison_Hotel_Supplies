import { redirect } from 'next/navigation';
import { AdminLoginPage } from '@/components/admin/AdminApp';
import { readAdminSession } from '@/server/auth/session';

// Already signed in: go straight to the dashboard.
export default async function LoginPage() {
    if (await readAdminSession()) redirect('/admin/products');
    return <AdminLoginPage />;
}
