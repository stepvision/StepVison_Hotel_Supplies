import 'server-only';
import { env } from '../env';
import { HttpError } from '../errors';
import type { ContactInput } from '../schemas/contact';

const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Emails a contact form enquiry to CONTACT_EMAIL through Resend. Replying to
// the email goes straight to the visitor.
export async function sendEnquiry(input: ContactInput) {
    const { apiKey, to, from } = env.contact;
    if (!apiKey || !to || !from) {
        console.error('Contact form is not configured: set RESEND_API_KEY, CONTACT_EMAIL and CONTACT_FROM_EMAIL');
        throw new HttpError(503, 'The contact form is unavailable right now. Please email us directly.');
    }

    const rows: [string, string][] = [
        ['Name', input.name],
        ['Email', input.email],
        ['Phone', input.phone ?? '-'],
        ['Topic', input.subject],
    ];
    const text = `${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\n${input.message}`;
    const html =
        `<table cellpadding="4">${rows
            .map(([label, value]) => `<tr><td><b>${label}</b></td><td>${escapeHtml(value)}</td></tr>`)
            .join('')}</table>` +
        `<p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`;

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from,
            to: to.split(',').map((address) => address.trim()),
            reply_to: input.email,
            subject: `Website enquiry: ${input.subject} from ${input.name}`,
            text,
            html,
        }),
    });

    if (!response.ok) {
        console.error(`Resend rejected the enquiry email (${response.status}):`, await response.text());
        throw new HttpError(502, 'Your message could not be sent. Please try again later or email us directly.');
    }
}
