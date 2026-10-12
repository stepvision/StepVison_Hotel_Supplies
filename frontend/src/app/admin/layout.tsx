import type { Metadata } from 'next';
import { AdminApp } from '@/components/admin/AdminApp';
import { getAdminSession } from '@/server/auth/session';

export const metadata: Metadata = {
    title: 'Admin | StepVision Hotel Supplies',
    robots: { index: false, follow: false },
};

// Rendered on every request: the page depends on the login cookies, so it
// must never be prebuilt at build time.
export const dynamic = 'force-dynamic';

// Also applies to the admin server actions. A cold start connects to
// MongoDB and runs the start-up checks in db.ts, which can pass Vercel's
// 10 second default.
export const maxDuration = 60;

// The dashboard lives here rather than in the pages, so moving between
// /admin/products and /admin/categories keeps its state and loaded data.
// The login is checked on the server, so it opens straight onto the
// dashboard (or the sign-in form) without a loading round trip.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-root min-h-screen bg-neutral-50">
            <AdminApp initialSession={await readSession()} />
            {children}
        </div>
    );
}

// If the session cannot be read (database down, a cookie left by an older
// deployment), show the sign-in form instead of a 500 page. The real error
// still goes to the server logs.
async function readSession() {
    try {
        return await getAdminSession();
    } catch (err) {
        console.error('Could not read the admin session:', err);
        return null;
    }
}
