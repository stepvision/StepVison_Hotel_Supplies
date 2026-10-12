import type {
    ActionResult,
    AdminCategoryOption,
    AdminSessionInfo,
    CategoryListResponse,
    ImageUploadTicket,
    ProductListResponse,
    UploadedImage,
} from '@/data/adminTypes';
import { changePasswordAction, loginAction, logoutAction, refreshSessionAction } from '@/server/actions/auth';
import {
    createCategoryAction,
    createSubcategoryAction,
    deleteCategoryAction,
    deleteSubcategoryAction,
    updateCategoryAction,
    updateSubcategoryAction,
} from '@/server/actions/categories';
import {
    createImageUploadAction,
    createProductAction,
    deleteProductAction,
    updateProductAction,
} from '@/server/actions/products';
import { ApiError, callAction, getJson } from './http';

export type {
    AdminCategory,
    AdminCategoryOption,
    AdminProduct,
    AdminSessionInfo,
    AdminSubcategory,
    AdminUser,
    CategoryListResponse,
    ProductListResponse,
    ProductStats,
} from '@/data/adminTypes';
export { ApiError, RequestCancelledError } from './http';

export interface ProductListParams {
    search?: string;
    category?: string;
    subcategory?: string;
    page?: number;
    limit?: number;
}

// Every request that finds the access token expired at the same moment
// waits for this one refresh, instead of each starting its own.
let refreshInFlight: Promise<unknown> | null = null;

function refreshTokens() {
    refreshInFlight ??= callAction(refreshSessionAction()).finally(() => {
        refreshInFlight = null;
    });
    return refreshInFlight;
}

// Runs an admin request. A 401 means the access token has expired: the
// tokens are refreshed and the request is sent once more. If the refresh
// itself fails with a 401, the login has really ended.
async function withRefresh<T>(request: () => Promise<T>): Promise<T> {
    try {
        return await request();
    } catch (err) {
        if (!(err instanceof ApiError && err.status === 401)) {
            throw err;
        }
        await refreshTokens();
        return request();
    }
}

export interface ProductInput {
    name: string;
    category: string;
    subcategory: string;
    image?: UploadedImage;
}

// Sends the file to Cloudinary with a signed ticket from the server.
async function uploadImage(ticket: ImageUploadTicket, file: File): Promise<UploadedImage> {
    const form = new FormData();
    for (const [key, value] of Object.entries(ticket.fields)) form.append(key, value);
    form.append('file', file);

    let response: Response;
    try {
        response = await fetch(ticket.url, { method: 'POST', body: form });
    } catch {
        throw new ApiError(0, 'The image could not be uploaded. Please check your connection and try again.');
    }

    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.public_id) {
        const reason = body?.error?.message;
        throw new ApiError(response.status, reason ? `Image upload failed: ${reason}` : 'The image could not be uploaded');
    }
    return { publicId: body.public_id, version: body.version, signature: body.signature };
}

const adminGet =<T>(...args: Parameters<typeof getJson>) => withRefresh(() => getJson<T>(...args));

const adminAction = <T>(action: () => Promise<ActionResult<T>>) => withRefresh(() => callAction(action()));

// Everything the admin panel does. Reads go through the /api/admin routes
// (GET, cancellable); changes are server actions. Both throw ApiError, and a
// 401 means the login has ended (an expired access token is refreshed first).
export const adminApi = {
    login: (email: string, password: string) => callAction<AdminSessionInfo>(loginAction({ email, password })),

    logout: () => callAction(logoutAction()),

    changePassword: (currentPassword: string, newPassword: string) =>
        adminAction(() => changePasswordAction({ currentPassword, newPassword })),

    listProducts: (params: ProductListParams, signal?: AbortSignal) =>
        adminGet<ProductListResponse>('/api/admin/products', { ...params }, signal),

    // Uploads the file straight to Cloudinary; pass the result as `image`.
    uploadProductImage: async (file: File) =>
        uploadImage(await adminAction(() => createImageUploadAction()), file),

    createProduct: (input: ProductInput & { image: UploadedImage }) => adminAction(() => createProductAction(input)),

    // `image` only when it is replaced.
    updateProduct: (id: string, input: ProductInput) => adminAction(() => updateProductAction(id, input)),

    deleteProduct: (id: string) => adminAction(() => deleteProductAction(id)),

    listCategories: (params: { page: number; limit: number }, signal?: AbortSignal) =>
        adminGet<CategoryListResponse>('/api/admin/categories', params, signal),

    listAllCategories: () => adminGet<{ categories: AdminCategoryOption[] }>('/api/admin/categories/all'),

    createCategory: (body: { name: string; description?: string }) => adminAction(() => createCategoryAction(body)),

    createSubcategory: (categoryId: string, name: string) => adminAction(() => createSubcategoryAction(categoryId, name)),

    updateCategory: (categoryId: string, body: { name: string; description?: string }) =>
        adminAction(() => updateCategoryAction(categoryId, body)),

    updateSubcategory: (categoryId: string, subcategoryId: string, name: string) =>
        adminAction(() => updateSubcategoryAction(categoryId, subcategoryId, name)),

    deleteCategory: (categoryId: string) => adminAction(() => deleteCategoryAction(categoryId)),

    deleteSubcategory: (categoryId: string, subcategoryId: string) =>
        adminAction(() => deleteSubcategoryAction(categoryId, subcategoryId)),
};
