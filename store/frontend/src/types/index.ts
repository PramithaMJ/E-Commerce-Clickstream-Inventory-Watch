// Product type definition (frontend - camelCase)
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
    rating: number;
    features: string[];
    inStock: boolean;
}

// Product API response (backend - snake_case)
export interface ProductDTO {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    stock: number;
    rating: number;
    features: string[];
    in_stock: boolean;
}

// Cart item type
export interface CartItem {
    product: Product;
    quantity: number;
}

// Clickstream event type
export interface ClickstreamEvent {
    userId: string;
    sessionId: string;
    eventType: 'view' | 'add_to_cart' | 'remove_from_cart' | 'purchase' | 'search' | 'filter';
    productId: string;
    productName?: string;
    category?: string;
    price?: number;
    quantity?: number;
    searchQuery?: string;
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

// Category type
export type Category =
    | 'smartphones'
    | 'laptops'
    | 'tablets'
    | 'gaming'
    | 'audio'
    | 'accessories';
