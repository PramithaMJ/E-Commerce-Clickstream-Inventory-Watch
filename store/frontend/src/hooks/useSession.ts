import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for managing user session.
 *
 * Eagerly reads from localStorage/sessionStorage via useState lazy initializer
 * so userId and sessionId are available on the very first render — no race condition.
 */
export const useSession = () => {
    const [userId] = useState<string>(() => {
        const stored = localStorage.getItem('userId');
        if (stored) return stored;
        const newId = `USER_${uuidv4().substring(0, 8).toUpperCase()}`;
        localStorage.setItem('userId', newId);
        return newId;
    });

    const [sessionId] = useState<string>(() => {
        const stored = sessionStorage.getItem('sessionId');
        if (stored) return stored;
        const newId = uuidv4();
        sessionStorage.setItem('sessionId', newId);
        return newId;
    });

    return { userId, sessionId };
};
