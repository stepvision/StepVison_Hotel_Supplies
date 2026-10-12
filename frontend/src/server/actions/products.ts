'use server';

import { runAdminAction } from '../http';
import { parseInput, productId } from '../schemas/common';
import { createProductSchema, updateProductSchema } from '../schemas/product';
import * as products from '../services/products';
import { createProductImageUpload } from '../uploads';

// Input fields: name, category, subcategory, image (the result of uploading
// the file to Cloudinary with a ticket from createImageUploadAction).

export async function createImageUploadAction() {
    return runAdminAction(async () => createProductImageUpload());
}

export async function createProductAction(input: unknown) {
    return runAdminAction(() => products.createProduct(parseInput(createProductSchema, input)));
}

export async function updateProductAction(id: string, input: unknown) {
    return runAdminAction(() =>
        products.updateProduct(parseInput(productId, id), parseInput(updateProductSchema, input))
    );
}

export async function deleteProductAction(id: string) {
    return runAdminAction(() => products.deleteProduct(parseInput(productId, id)));
}
