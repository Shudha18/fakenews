import type { HistoryItem } from '../types';
import type { User } from '../components/AuthContext';

// Helper to get the current logged-in user from the session in localStorage
const getSessionUser = (): User | null => {
    try {
        const storedSession = localStorage.getItem('synthetica-session');
        if (storedSession) {
            return JSON.parse(storedSession).user;
        }
    } catch (e) {
        console.error("Could not parse session for history service:", e);
    }
    return null;
}

// Helper to generate the unique localStorage key for the current user's history
const getHistoryKey = (): string | null => {
    const user = getSessionUser();
    return user ? `synthetica-history-${user.email}` : null;
}

/**
 * Gets the analysis history for the logged-in user from localStorage.
 * @returns An array of history items, sorted from newest to oldest.
 */
export const getHistory = async (): Promise<HistoryItem[]> => {
    await new Promise(res => setTimeout(res, 300)); // Simulate fetch delay
    const key = getHistoryKey();
    if (!key) return [];

    try {
        const historyJson = localStorage.getItem(key);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
        console.error("Failed to parse history from localStorage", e);
        return [];
    }
};

/**
 * Saves a new analysis result to the user's history in localStorage.
 * @param newItem The new history item to add.
 */
export const saveAnalysis = async (newItem: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const key = getHistoryKey();
    if (!key) return;

    const history = await getHistory();
    const fullItem: HistoryItem = {
        ...newItem,
        id: new Date().getTime().toString(), // Simple unique ID
        timestamp: new Date().toISOString(),
    };
    
    const updatedHistory = [fullItem, ...history];
    localStorage.setItem(key, JSON.stringify(updatedHistory));
};

/**
 * Deletes a single history item from localStorage for the logged-in user.
 * @param itemId The ID of the history item to delete.
 */
export const deleteHistoryItem = async (itemId: string) => {
    const key = getHistoryKey();
    if (!key) return;

    let history = await getHistory();
    const updatedHistory = history.filter(item => item.id !== itemId);
    localStorage.setItem(key, JSON.stringify(updatedHistory));
};

/**
 * Clears the entire analysis history from localStorage for the logged-in user.
 */
export const clearHistory = async () => {
    const key = getHistoryKey();
    if (key) {
        localStorage.removeItem(key);
    }
};