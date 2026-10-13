import { redirect } from 'next/navigation';
import { AdminApp } from '@/components/admin/AdminApp';
import { readAdminSession } from '@/server/auth/session';

// /admin/products and /admin/categories. The dashboard lives here rather
// than in the pages, so moving between them keeps its state and loaded data.
// Without a login, both go to /admin/login.
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await readAdminSession();
    if (!session) redirect('/admin/login');

    return (
        <>
            <AdminApp session={session} />
            {children}
        </>
    );
}
