// Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD, or resets its
// password if that account already exists.
//
//   node --env-file=.env scripts/create-admin.mjs           # dry run: shows what would happen
//   node --env-file=.env scripts/create-admin.mjs --apply   # writes to the database
//
// Other admin accounts are left alone.

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const APPLY = process.argv.includes('--apply');
const email = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD ?? '';
if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const collection = mongoose.connection.collection('admins');
console.log(`Connected to ${mongoose.connection.host}/${mongoose.connection.name}${APPLY ? '' : ' (dry run)'}`);

const existing = await collection.findOne({ email });
console.log(`${existing ? 'reset password for' : 'create'}  ${email}`);

if (APPLY) {
    // Same cost as ensureAdmin() in src/server/db.ts.
    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();
    await collection.updateOne(
        { email },
        {
            $set: { passwordHash, updatedAt: now },
            $setOnInsert: { email, name: 'Administrator', createdAt: now, __v: 0 },
        },
        { upsert: true }
    );
}

console.log(APPLY ? 'Done.' : 'Re-run with --apply to write.');
await mongoose.disconnect();
