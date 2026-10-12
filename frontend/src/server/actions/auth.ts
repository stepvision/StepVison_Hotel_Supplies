'use server';

import { endSession, refreshSession, requireAdmin } from '../auth/session';
import { runAction } from '../http';
import { changePasswordSchema, loginSchema } from '../schemas/auth';
import { parseInput } from '../schemas/common';
import { changeAdminPassword, loginAdmin } from '../services/auth';

// Server actions are public endpoints: every argument is untrusted input and
// is validated here before it reaches a service.

export async function loginAction(credentials: { email: string; password: string }) {
    return runAction(() => loginAdmin(parseInput(loginSchema, credentials)));
}

export async function logoutAction() {
    return runAction(() => endSession());
}

// The login is checked before any input is read.
export async function changePasswordAction(body: { currentPassword: string; newPassword: string }) {
    return runAction(async () => {
        const session = await requireAdmin();
        return changeAdminPassword(session, parseInput(changePasswordSchema, body));
    });
}

// Called by the admin panel when an access token has expired.
export async function refreshSessionAction() {
    return runAction(() => refreshSession());
}
