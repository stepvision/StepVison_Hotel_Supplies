// Where this project's images live in Cloudinary. The account also holds
// other projects (e.g. stepvision/international), so everything for this
// site stays under stepvision/hotel.
export const CLOUDINARY_ROOT = 'stepvision/hotel';
export const CLOUDINARY_FOLDERS = {
    products: `${CLOUDINARY_ROOT}/products`,
    site: `${CLOUDINARY_ROOT}/site`,
};

// Trimmed because a value pasted into Vercel with quotes keeps them.
const CLOUD_NAME = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '').trim().replace(/^["']+|["']+$/g, '').trim();

// URL of a fixed site image (hero, banners, category cards) uploaded by
// scripts/migrate-images-to-cloudinary.mjs, e.g. siteImage('hero-slide-1').
// f_auto/q_auto let Cloudinary pick the best format and size per browser.
export function siteImage(name: string) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${CLOUDINARY_FOLDERS.site}/${name}`;
}

// A small square version of an uploaded Cloudinary image, for list
// thumbnails: `size` CSS pixels, doubled for high-density screens. Other URLs
// (e.g. local /uploads files) are returned unchanged.
export function thumbnailUrl(url: string, size: number) {
    if (!url.includes('res.cloudinary.com/') || !url.includes('/image/upload/')) return url;
    const px = size * 2;
    return url.replace('/image/upload/', `/image/upload/c_fill,w_${px},h_${px},f_auto,q_auto/`);
}
