// Loads the products in scripts/data/products.json into MongoDB.
//
//   node --env-file=.env.local scripts/seed-products.mjs           # dry run: shows what would happen
//   node --env-file=.env.local scripts/seed-products.mjs --apply   # uploads images and writes to the database
//
// Each product is matched by its code and created or updated, so re-running
// never makes duplicates. Local images (/images/products/...) are uploaded to
// Cloudinary under stepvision/hotel/products, the same names
// migrate-images-to-cloudinary.mjs uses; external URLs are stored as they are.
// Run seed-categories.mjs first: a category or subcategory that does not
// exist is reported, and an unknown subcategory is left out.

import fs from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

const ROOT = 'stepvision/hotel';
const PUBLIC_DIR = path.resolve('public');
const APPLY = process.argv.includes('--apply');

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const slug = (name) =>
    path
        .parse(name)
        .name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const products = JSON.parse(await fs.readFile(new URL('./data/products.json', import.meta.url), 'utf8'));

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection.db;
console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}${APPLY ? '' : ' (dry run)'}\n`);

const categories = new Map(
    (await db.collection('categories').find({}, { projection: { id: 1, subcategories: 1 } }).toArray()).map((c) => [
        c.id,
        new Set(c.subcategories.map((s) => s.id)),
    ])
);
const collection = db.collection('products');

// Uploads a local image unless this product already has it on Cloudinary.
async function resolveImage(url, existing) {
    if (!url.startsWith('/images/products/')) return { url };

    const file = decodeURIComponent(path.basename(url));
    const publicId = `${ROOT}/products/${slug(file)}`;
    if (existing?.image?.filename === publicId) return existing.image;

    const source = path.join(PUBLIC_DIR, 'images', 'products', file);
    await fs.access(source);
    if (!APPLY) return { filename: publicId, url };

    const result = await cloudinary.uploader.upload(source, { public_id: publicId, overwrite: true, resource_type: 'image' });
    return {
        filename: result.public_id,
        url: cloudinary.url(result.public_id, { version: result.version, fetch_format: 'auto', quality: 'auto' }),
    };
}

let created = 0;
let updated = 0;
let failed = 0;
for (const p of products) {
    const label = `${p.code}  ${p.name}`;
    try {
        const subcategories = categories.get(p.categoryId);
        if (!subcategories) throw new Error(`category ${p.categoryId} does not exist`);

        let subcategory = p.subcategoryId;
        if (subcategory && !subcategories.has(subcategory)) {
            console.warn(`  warning: ${p.code} subcategory ${subcategory} is not in ${p.categoryId}; left out`);
            subcategory = undefined;
        }

        const existing = await collection.findOne({ code: p.code });
        const image = await resolveImage(p.images[0], existing);
        console.log(`${existing ? 'update' : 'create'}  ${label}${image.filename ? '  (Cloudinary image)' : ''}`);
        existing ? updated++ : created++;

        if (APPLY) {
            const now = new Date();
            const fields = {
                name: p.name,
                code: p.code,
                image,
                category: p.categoryId,
                brand: p.brand,
                shortDescription: p.shortDescription,
                isFeatured: Boolean(p.isFeatured),
                status: p.status ?? 'active',
                updatedAt: now,
            };
            await collection.updateOne(
                { code: p.code },
                {
                    $set: subcategory ? { ...fields, subcategory } : fields,
                    ...(subcategory ? {} : { $unset: { subcategory: '' } }),
                    $setOnInsert: { createdAt: now, __v: 0 },
                },
                { upsert: true }
            );
        }
    } catch (err) {
        failed++;
        console.error(`FAILED  ${label}: ${err.message}`);
    }
}

console.log(
    `\n${created} to create, ${updated} to update, ${failed} failed.${APPLY ? ' Done.' : ' Re-run with --apply to write.'}`
);
await mongoose.disconnect();
