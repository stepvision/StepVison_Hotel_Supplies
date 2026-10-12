import { z } from 'zod';
import { EMAIL_PATTERN } from './common';

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

export const loginSchema = z.object({
    email: z
        .string({ error: 'Email is required' })
        .trim()
        .toLowerCase()
        .min(1, 'Email is required')
        .max(MAX_EMAIL_LENGTH, 'Enter a valid email address')
        .regex(EMAIL_PATTERN, 'Enter a valid email address'),
    // Passwords are taken as-is: trimming would change what the user typed.
    password: z
        .string({ error: 'Password is required' })
        .min(1, 'Password is required')
        .max(MAX_PASSWORD_LENGTH, `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer`),
});

export type LoginInput = z.output<typeof loginSchema>;

const MIN_NEW_PASSWORD_LENGTH = 8;

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string({ error: 'Current password is required' })
            .min(1, 'Current password is required')
            .max(MAX_PASSWORD_LENGTH, `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer`),
        newPassword: z
            .string({ error: 'New password is required' })
            .min(MIN_NEW_PASSWORD_LENGTH, `New password must be at least ${MIN_NEW_PASSWORD_LENGTH} characters`)
            .max(MAX_PASSWORD_LENGTH, `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer`),
    })
    .refine((input) => input.newPassword !== input.currentPassword, {
        message: 'New password must be different from the current one',
        path: ['newPassword'],
    });

export type ChangePasswordInput = z.output<typeof changePasswordSchema>;
