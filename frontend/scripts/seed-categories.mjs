// Loads the categories in scripts/data/categories.json into MongoDB.
//
//   node --env-file=.env.local scripts/seed-categories.mjs           # dry run: shows what would happen
//   node --env-file=.env.local scripts/seed-categories.mjs --apply   # writes to the database
//
// Each category is matched by its id (or slug) and created or updated, so
// re-running never makes duplicates. Categories not in the file are left alone.

import fs from 'node:fs/promises';
import mongoose from 'mongoose';

const APPLY = process.argv.includes('--apply');
const categories = JSON.parse(await fs.readFile(new URL('./data/categories.json', import.meta.url), 'utf8'));

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const collection = mongoose.connection.collection('categories');
console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}${APPLY ? '' : ' (dry run)'}`);

let created = 0;
let updated = 0;
for (const { id, name, slug, description, subcategories } of categories) {
    const filter = { $or: [{ id }, { slug }] };
    const existing = await collection.findOne(filter);
    console.log(`${existing ? 'update' : 'create'}  ${id}  ${name} (${subcategories.length} subcategories)`);
    existing ? updated++ : created++;

    if (APPLY) {
        const now = new Date();
        await collection.updateOne(
            filter,
            {
                $set: { id, name, slug, description, subcategories, updatedAt: now },
                $setOnInsert: { createdAt: now, __v: 0 },
            },
            { upsert: true }
        );
    }
}

console.log(`\n${created} to create, ${updated} to update.${APPLY ? ' Done.' : ' Re-run with --apply to write.'}`);
await mongoose.disconnect();
