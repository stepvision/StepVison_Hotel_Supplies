import 'server-only';
import bcrypt from 'bcryptjs';
import type { AdminSessionInfo } from '@/data/adminTypes';
import { startSession } from '../auth/session';
import { connectDB } from '../db';
import { HttpError } from '../errors';
import { Admin } from '../models/Admin';
import { Session } from '../models/Session';
import type { ChangePasswordInput, LoginInput } from '../schemas/auth';

const BCRYPT_ROUNDS = 12;

export async function loginAdmin({ email, password }: LoginInput): Promise<AdminSessionInfo> {
    await connectDB();

    const admin = await Admin.findOne({ email }).lean();
    const passwordOk = admin && (await bcrypt.compare(password, admin.passwordHash));
    if (!passwordOk) {
        throw new HttpError(401, 'Invalid email or password');
    }

    return startSession(admin);
}

// Changes the logged-in admin's password once the current one is confirmed.
// Every other device is signed out; this one stays logged in.
export async function changeAdminPassword(
    session: AdminSessionInfo,
    { currentPassword, newPassword }: ChangePasswordInput
) {
    await connectDB();

    const admin = await Admin.findById(session.admin.id);
    if (!admin) {
        throw new HttpError(401, 'Session expired. Please log in again.');
    }

    // A 400, not a 401: a 401 would make the admin panel treat it as a lost login.
    if (!(await bcrypt.compare(currentPassword, admin.passwordHash))) {
        throw new HttpError(400, 'Current password is incorrect', {
            currentPassword: 'Current password is incorrect',
        });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await admin.save();
    await Session.deleteMany({ admin: admin._id, deviceId: { $ne: session.deviceId } });
}
