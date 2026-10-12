import { z } from 'zod';
import { PRODUCT_LIMITS } from '../models/Product';
import { categoryFilterQuery, categoryId, paginationQuery, requiredText, searchQuery } from './common';

const { nameLength, maxPageSize, searchLength } = PRODUCT_LIMITS;

// ---------- Field schemas ----------

// The result of the browser's upload to Cloudinary. The service checks its
// signature before using it.
const image = z.object(
    {
        publicId: z.string().min(1).max(300),
        version: z.number().int().positive(),
        signature: z.string().min(1).max(128),
    },
    { error: 'Product image is required' }
);

// An empty subcategory clears it. The service checks that both ids exist.
const productFields = z.object({
    name: requiredText('Product name', nameLength),
    category: z.string({ error: 'Category is required' }).trim().min(1, 'Category is required').pipe(categoryId()),
    subcategory: z
        .string()
        .trim()
        .optional()
        .transform((id) => id || undefined)
        .pipe(categoryId('subcategory').optional()),
});

// ---------- Input schemas ----------

export const createProductSchema = productFields.extend({ image });

// The form always sends every field; the image only when it was replaced.
export const updateProductSchema = productFields.extend({ image: image.optional() });

export const listProductsQuerySchema = paginationQuery({ defaultLimit: 20, maxPageSize })
    .extend({ search: searchQuery(searchLength) })
    .and(categoryFilterQuery);

export type CreateProductInput = z.output<typeof createProductSchema>;
export type UpdateProductInput = z.output<typeof updateProductSchema>;
export type ListProductsQuery = z.output<typeof listProductsQuerySchema>;
