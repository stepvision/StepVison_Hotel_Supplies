import { NextResponse } from 'next/server';
import { connectDB } from '@/server/db';
import { configErrors } from '@/server/env';
import { checkCloudinary } from '@/server/uploads';

// Reports setup problems (names only, never values) so a broken deployment
// can be diagnosed from the browser.
export const dynamic = 'force-dynamic';

export async function GET() {
    if (configErrors.length > 0) {
        return NextResponse.json({ status: 'error', problems: configErrors }, { status: 500 });
    }

    const [database, cloudinary] = await Promise.all([
        connectDB().then(
            () => null,
            (err) => `Database: ${err instanceof Error ? err.message : String(err)}`
        ),
        checkCloudinary(),
    ]);

    const problems = [database, cloudinary].filter(Boolean);
    if (problems.length > 0) {
        return NextResponse.json({ status: 'error', problems }, { status: 500 });
    }
    return NextResponse.json({ status: 'ok', database: 'connected', cloudinary: 'connected' });
}
