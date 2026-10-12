import 'server-only';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';
import type { ImageUploadTicket, UploadedImage } from '@/data/adminTypes';
import { env } from './env';
import { HttpError } from './errors';

// Product images are stored in Cloudinary under stepvision/hotel/products.
// The product keeps the Cloudinary public id as `filename` (used to delete
// it later) and a delivery URL as `url`.
//
// The browser uploads the file straight to Cloudinary with a signature made
// here, and the product action only receives the result. Sending the file
// through the server instead would hit Vercel's 4.5 MB body limit and
// function time limit.

cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
});

export interface StoredImage {
    filename: string;
    url: string;
}

// The signed parameters can't be changed by the browser, so uploads always
// land in the products folder, under a random name, as an image.
const ALLOWED_FORMATS = 'jpg,png,webp,gif';

// f_auto/q_auto serve WebP/AVIF at a sensible quality to browsers that
// support it, so the original is uploaded as-is.
function deliveryUrl(publicId: string, version: number) {
    return cloudinary.url(publicId, { version, fetch_format: 'auto', quality: 'auto' });
}

// Permission for one upload, valid for an hour (Cloudinary's limit).
export function createProductImageUpload(): ImageUploadTicket {
    const params = {
        folder: CLOUDINARY_FOLDERS.products,
        allowed_formats: ALLOWED_FORMATS,
        timestamp: String(Math.round(Date.now() / 1000)),
    };
    return {
        url: `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`,
        fields: {
            ...params,
            api_key: env.cloudinary.apiKey,
            signature: cloudinary.utils.api_sign_request(params, env.cloudinary.apiSecret),
        },
    };
}

// Checks that an upload result really came from Cloudinary (its signature
// covers the public id and version) and is one of our product images.
export function verifyProductImage({ publicId, version, signature }: UploadedImage): StoredImage {
    const expected = cloudinary.utils.api_sign_request({ public_id: publicId, version }, env.cloudinary.apiSecret);
    if (signature !== expected || !publicId.startsWith(`${CLOUDINARY_FOLDERS.products}/`)) {
        throw new HttpError(400, 'The image upload could not be verified. Please upload it again', {
            image: 'The image upload could not be verified',
        });
    }
    return { filename: publicId, url: deliveryUrl(publicId, version) };
}

// Asks Cloudinary whether the API key and secret are accepted. Returns the
// problem, or null. Used by /api/health.
export async function checkCloudinary(): Promise<string | null> {
    try {
        await cloudinary.api.ping();
        return null;
    } catch (err) {
        const { message, error } = (err ?? {}) as { message?: string; error?: { message?: string } };
        return `Cloudinary: ${error?.message ?? message ?? 'not reachable'}`;
    }
}

// Removes an uploaded image in the background. A missing file is fine.
export function deleteProductImage(publicId?: string | null) {
    if (!publicId) return;

    cloudinary.uploader
        .destroy(publicId, { invalidate: true })
        .catch((err: { message?: string }) => console.error(`Could not delete image ${publicId}:`, err.message));
}
