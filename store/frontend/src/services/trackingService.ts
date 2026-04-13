import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ClickstreamEvent, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Get or create user ID (stored in localStorage)
const getUserId = (): string => {
    const stored = localStorage.getItem('userId');
    if (stored) return stored;
    const newId = `USER_${uuidv4().substring(0, 8).toUpperCase()}`;
    localStorage.setItem('userId', newId);
    return newId;
};

// Get or create session ID (stored in sessionStorage)
const getSessionId = (): string => {
    const stored = sessionStorage.getItem('sessionId');
    if (stored) return stored;
    const newId = uuidv4();
    sessionStorage.setItem('sessionId', newId);
    return newId;
};

/**
 * Tracking Service for Clickstream Events.
 * 
 * Sends user interaction events to the backend for Kafka publishing.
 */
export const trackingService = {
    /**
     * Track a clickstream event.
     * Converts to snake_case before posting — backend Jackson uses SNAKE_CASE strategy.
     */
    trackEvent: async (event: Partial<ClickstreamEvent>): Promise<void> => {
        const fullEvent: ClickstreamEvent = {
            userId: getUserId(),
            sessionId: getSessionId(),
            ...event,
        } as ClickstreamEvent;

        // Backend expects snake_case field names due to SNAKE_CASE Jackson naming strategy
        const payload = {
            user_id: fullEvent.userId,
            session_id: fullEvent.sessionId,
            event_type: fullEvent.eventType,
            product_id: fullEvent.productId,
            product_name: fullEvent.productName,
            category: fullEvent.category,
            price: fullEvent.price,
            quantity: fullEvent.quantity,
            search_query: fullEvent.searchQuery,
        };

        try {
            await api.post<ApiResponse<any>>('/events', payload);
            console.log('Tracked:', event.eventType, event.productId);
        } catch (error) {
            console.error('Failed to track event:', error);
            // Fail silently - don't disrupt user experience
        }
    },

    /**
     * Track product view.
     */
    trackView: async (productId: string, productName: string, category: string, price: number): Promise<void> => {
        await trackingService.trackEvent({
            eventType: 'view',
            productId,
            productName,
            category,
            price,
        });
    },

    /**
     * Track add to cart.
     */
    trackAddToCart: async (productId: string, productName: string, category: string, price: number, quantity: number): Promise<void> => {
        await trackingService.trackEvent({
            eventType: 'add_to_cart',
            productId,
            productName,
            category,
            price,
            quantity,
        });
    },

    /**
     * Track remove from cart.
     */
    trackRemoveFromCart: async (productId: string, productName: string, category: string): Promise<void> => {
        await trackingService.trackEvent({
            eventType: 'remove_from_cart',
            productId,
            productName,
            category,
        });
    },

    /**
     * Track purchase.
     */
    trackPurchase: async (productId: string, productName: string, category: string, price: number, quantity: number): Promise<void> => {
        await trackingService.trackEvent({
            eventType: 'purchase',
            productId,
            productName,
            category,
            price,
            quantity,
        });
    },

    /**
     * Track search.
     */
    trackSearch: async (searchQuery: string): Promise<void> => {
        await trackingService.trackEvent({
            eventType: 'search',
            productId: 'SEARCH',
            searchQuery,
        });
    },

    /**
     * Get current user ID.
     */
    getUserId,

    /**
     * Get current session ID.
     */
    getSessionId,
};

export default trackingService;
