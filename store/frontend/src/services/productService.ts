import axios from 'axios';
import { Product, ProductDTO, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Transform API response (snake_case) to frontend format (camelCase)
const transformProduct = (dto: ProductDTO): Product => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    price: dto.price,
    category: dto.category,
    imageUrl: dto.image_url,
    stock: dto.stock,
    rating: dto.rating,
    features: dto.features,
    inStock: dto.in_stock,
});

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Product Service.
 * 
 * Handles all product-related API calls.
 */
export const productService = {
    /**
     * Get all products.
     */
    getAll: async (): Promise<Product[]> => {
        const response = await api.get<ApiResponse<ProductDTO[]>>('/products');
        return response.data.data.map(transformProduct);
    },

    /**
     * Get product by ID.
     */
    getById: async (id: string): Promise<Product> => {
        const response = await api.get<ApiResponse<ProductDTO>>(`/products/${id}`);
        return transformProduct(response.data.data);
    },

    /**
     * Get products by category.
     */
    getByCategory: async (category: string): Promise<Product[]> => {
        const response = await api.get<ApiResponse<ProductDTO[]>>(`/products/category/${category}`);
        return response.data.data.map(transformProduct);
    },

    /**
     * Search products.
     */
    search: async (query: string): Promise<Product[]> => {
        const response = await api.get<ApiResponse<ProductDTO[]>>('/products/search', {
            params: { q: query },
        });
        return response.data.data.map(transformProduct);
    },
};

export default productService;
