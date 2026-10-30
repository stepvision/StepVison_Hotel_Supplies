import { z } from 'zod';
import { EMAIL_PATTERN, optionalText, requiredText } from './common';

export const CONTACT_SUBJECTS = [
    'General Inquiry',
    'Product Information',
    'Quote Request',
    'Partnership',
    'Other',
] as const;

export const contactSchema = z.object({
    name: requiredText('Full name', 100),
    email: z
        .string({ error: 'Email is required' })
        .trim()
        .min(1, 'Email is required')
        .max(254, 'Enter a valid email address')
        .regex(EMAIL_PATTERN, 'Enter a valid email address'),
    phone: optionalText('Phone number', 30),
    subject: z.enum(CONTACT_SUBJECTS, { error: 'Select a topic' }),
    message: requiredText('Message', 5000),
});

export type ContactInput = z.output<typeof contactSchema>;
