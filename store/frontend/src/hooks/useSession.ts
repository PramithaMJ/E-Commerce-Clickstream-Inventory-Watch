import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for managing user session.
 * 
 * Generates and persists user ID and session ID in localStorage.
 */
export const useSession = () => {
    const [userId, setUserId] = useState<string>('');
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        // Get or create user ID (persistent across sessions)
        let storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            storedUserId = uuidv4();
            localStorage.setItem('userId', storedUserId);
        }
        setUserId(storedUserId);

        // Get or create session ID (new for each browser session)
        let storedSessionId = sessionStorage.getItem('sessionId');
        if (!storedSessionId) {
            storedSessionId = uuidv4();
            sessionStorage.setItem('sessionId', storedSessionId);
        }
        setSessionId(storedSessionId);
    }, []);

    return { userId, sessionId };
};
