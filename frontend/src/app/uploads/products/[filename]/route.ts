import { NextResponse } from 'next/server';

// Product images used to be served from the database here. They now live in
// Cloudinary (see @/server/uploads), so old /uploads/products URLs are gone.
export function GET() {
    return new NextResponse('Not found', { status: 404 });
}
