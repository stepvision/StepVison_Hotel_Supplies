import 'server-only';

const REQUIRED = [
    'MONGODB_URI',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'JWT_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
];

// Problems with the environment. They are reported by /api/health and
// thrown on the first database call, instead of crashing the whole site.
export function getConfigErrors(): string[] {
    const errors: string[] = [];
    const missing = REQUIRED.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        errors.push(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (process.env.MONGODB_URI?.includes('<db_password>')) {
        errors.push('MONGODB_URI still contains <db_password>. Replace it with your MongoDB Atlas user password.');
    }
    return errors;
}

// Kept as an array-like proxy so imports of configErrors remain backward-compatible
export const configErrors: string[] = new Proxy([] as string[], {
    get(target, prop, receiver) {
        const fresh = getConfigErrors();
        if (prop === 'length') return fresh.length;
        if (typeof prop === 'string' && !isNaN(Number(prop))) return fresh[Number(prop)];
        const val = Reflect.get(fresh, prop, receiver);
        return typeof val === 'function' ? val.bind(fresh) : val;
    },
});

// Quotes are stripped from .env.local but kept by the Vercel dashboard, so a
// value pasted with them would work locally and fail on the live site.
// Cloudinary names and keys never contain quotes or spaces, so drop them.
const cloudinaryValue = (key: string) => (process.env[key] ?? '').trim().replace(/^["']+|["']+$/g, '').trim();

export const env = {
    get mongoUri() { return process.env.MONGODB_URI ?? ''; },
    get isProduction() { return process.env.NODE_ENV === 'production'; },
    get adminEmail() { return (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim(); },
    get adminPassword() { return process.env.ADMIN_PASSWORD ?? ''; },
    get jwtSecret() { return process.env.JWT_SECRET ?? ''; },
    // How long an access token lasts before the browser must refresh it.
    get accessTokenTtlMinutes() { return Number(process.env.ACCESS_TOKEN_TTL_MINUTES) || 15; },
    // How long a login (refresh token) lasts before the admin must sign in again.
    get sessionTtlHours() { return Number(process.env.SESSION_TTL_HOURS) || 24; },
    get cloudinary() {
        return {
            cloudName: cloudinaryValue('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
            apiKey: cloudinaryValue('CLOUDINARY_API_KEY'),
            apiSecret: cloudinaryValue('CLOUDINARY_API_SECRET'),
        };
    },
    // Contact form email. Not in REQUIRED: without them only the form fails.
    // CONTACT_EMAIL may list several addresses separated by commas.
    get contact() {
        return {
            apiKey: (process.env.RESEND_API_KEY ?? '').trim(),
            to: (process.env.CONTACT_EMAIL ?? '').trim(),
            from: (process.env.CONTACT_FROM_EMAIL ?? '').trim(),
        };
    },
};
