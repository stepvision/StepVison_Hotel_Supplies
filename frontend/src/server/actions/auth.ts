'use server';

import { revalidatePath } from 'next/cache';
import { endSession, refreshSession, requireAdmin } from '../auth/session';
import { runAction } from '../http';
import { changePasswordSchema, loginSchema } from '../schemas/auth';
import { parseInput } from '../schemas/common';
import { changeAdminPassword, loginAdmin } from '../services/auth';



// Server actions are public endpoints: every argument is untrusted input and
// is validated here before it reaches a service.

// Every admin page is rendered from the login cookies, so a page cached
// before a login or logout is wrong after it. This drops all of them, on the
// server and in the browser's router cache.
const clearAdminPageCache = () => revalidatePath('/admin', 'layout');

export async function loginAction(credentials: { email: string; password: string }) {
    return runAction(async () => {
        const session = await loginAdmin(parseInput(loginSchema, credentials));
        clearAdminPageCache();
        return session;
    });
}

export async function logoutAction() {
    return runAction(async () => {
        await endSession();
        clearAdminPageCache();
    });
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
