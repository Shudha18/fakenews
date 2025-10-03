import { useState, useEffect, useCallback } from 'react';
import { useAuth, User } from '../components/AuthContext';
import type { Plan } from '../App';

const FREE_CREDITS = 2;

// --- Data Structures ---
export interface Subscription {
    planId: 'weekly' | 'monthly' | 'yearly';
    planName: string;
    startDate: string; // ISO string
    expiresAt: string; // ISO string
}

interface UserCreditData {
    credits: number;
    subscription?: Subscription;
    dailyLimit?: number;
    lastResetDate?: string; // ISO string
}

// --- LocalStorage Helpers ---
const getCreditKey = (email: string) => `synthetica-credits-${email}`;

const getUserCreditData = (email: string): UserCreditData => {
    try {
        const data = localStorage.getItem(getCreditKey(email));
        if (data) {
            const parsed = JSON.parse(data);
            // Basic validation
            if (typeof parsed.credits === 'number') {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Failed to parse credit data:", e);
    }
    // Default for new users
    return { credits: FREE_CREDITS };
};

const saveUserCreditData = (email: string, data: UserCreditData) => {
    localStorage.setItem(getCreditKey(email), JSON.stringify(data));
};

// --- Pure Calculation Function for Upgrades ---
export const calculateProratedUpgradeCost = (
    subscription: Subscription,
    newPlan: Plan,
    allPlans: Record<string, Plan>
): number => {
    const currentPlan = allPlans[subscription.planId];
    if (!currentPlan) return newPlan.price; // Should not happen

    const now = new Date();
    const expiry = new Date(subscription.expiresAt);
    const diffTime = expiry.getTime() - now.getTime();

    if (diffTime <= 0) return newPlan.price; // Plan expired, pay full price

    const daysRemaining = diffTime / (1000 * 60 * 60 * 24);
    const costPerDay = currentPlan.price / currentPlan.durationDays;
    const remainingValue = costPerDay * daysRemaining;
    const upgradeCost = newPlan.price - remainingValue;
    
    return Math.max(0, upgradeCost); // Ensure cost is not negative
};


// --- React Hook for Credit Management ---
export const useCredits = () => {
    const { currentUser } = useAuth();
    // FIX: Corrected typo in UserCreditData type annotation.
    const [creditData, setCreditData] = useState<UserCreditData>({ credits: 0 });
    const [isSubscribed, setIsSubscribed] = useState(false);

    const refreshCreditData = useCallback(() => {
        if (currentUser) {
            let data = getUserCreditData(currentUser.email);
            let needsUpdate = false;

            // Check for expired subscription
            if (data.subscription && new Date(data.subscription.expiresAt) < new Date()) {
                data.subscription = undefined;
                data.dailyLimit = undefined;
                data.lastResetDate = undefined;
                data.credits = 0; // Expired plan means 0 credits
                needsUpdate = true;
            }

            // Check for daily credit reset for subscribers
            if (data.subscription && data.lastResetDate && data.dailyLimit) {
                const today = new Date().toISOString().split('T')[0];
                const lastReset = new Date(data.lastResetDate).toISOString().split('T')[0];

                if (today > lastReset) {
                    data.credits = data.dailyLimit;
                    data.lastResetDate = new Date().toISOString();
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                saveUserCreditData(currentUser.email, data);
            }
            
            setCreditData(data);
            setIsSubscribed(!!data.subscription);
        }
    }, [currentUser]);

    useEffect(() => {
        refreshCreditData();
    }, [refreshCreditData]);

    const consumeCredit = () => {
        if (!currentUser) return;

        setCreditData(prevData => {
            const newCredits = Math.max(0, prevData.credits - 1);
            const newData = { ...prevData, credits: newCredits };
            saveUserCreditData(currentUser.email, newData);
            return newData;
        });
    };

    const hasCredits = (): boolean => {
        return creditData.credits > 0;
    };
    
    const activateSubscription = (plan: Plan) => {
        if (!currentUser) return;
        
        const startDate = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

        const newSubscription: Subscription = {
            planId: plan.id,
            planName: plan.name,
            startDate: startDate.toISOString(),
            expiresAt: expiresAt.toISOString(),
        };

        const newData: UserCreditData = {
            credits: plan.dailyCredits,
            subscription: newSubscription,
            dailyLimit: plan.dailyCredits,
            lastResetDate: new Date().toISOString(),
        };

        saveUserCreditData(currentUser.email, newData);
        refreshCreditData(); // Refresh state immediately
    };

    return {
        credits: creditData.credits,
        dailyLimit: creditData.dailyLimit,
        subscription: creditData.subscription,
        consumeCredit,
        hasCredits,
        activateSubscription,
        isSubscribed,
    };
};