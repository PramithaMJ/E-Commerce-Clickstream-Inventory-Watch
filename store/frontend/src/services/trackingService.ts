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
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = `USER_${uuidv4().substring(0, 8).toUpperCase()}`;
        localStorage.setItem('userId', userId);
    }
    return userId;
};

// Get or create session ID (stored in sessionStorage)
const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
};

/**
 * Tracking Service for Clickstream Events.
 * 
 * Sends user interaction events to the backend for Kafka publishing.
 */
export const trackingService = {
    /**
     * Track a clickstream event.
     */
    trackEvent: async (event: Partial<ClickstreamEvent>): Promise<void> => {
        const fullEvent: ClickstreamEvent = {
            userId: getUserId(),
            sessionId: getSessionId(),
            ...event,
        } as ClickstreamEvent;

        try {
            await api.post<ApiResponse<any>>('/events', fullEvent);
            console.log('📊 Tracked:', event.eventType, event.productId);
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
