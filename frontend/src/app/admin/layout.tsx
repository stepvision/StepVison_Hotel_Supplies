import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin | StepVision Hotel Supplies',
    robots: { index: false, follow: false },
};

// Rendered on every request: the pages depend on the login cookies, so they
// must never be prebuilt at build time.
export const dynamic = 'force-dynamic';

// Also applies to the admin server actions. A cold start connects to
// MongoDB and runs the start-up checks in db.ts, which can pass Vercel's
// 10 second default.
export const maxDuration = 60;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <div className="admin-root min-h-screen bg-neutral-50">{children}</div>;
}
