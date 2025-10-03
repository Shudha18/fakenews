// services/authService.ts

import type { User } from '../components/AuthContext';

const USERS_KEY = 'synthetica-users';
const SESSION_KEY = 'synthetica-session';

// Mock user storage that uses localStorage
const getUsers = (): Record<string, any> => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : {};
    } catch (e) {
        console.error("Failed to parse users from localStorage:", e);
        return {};
    }
};

const saveUsers = (users: Record<string, any>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * --- MOCK AUTHENTICATION SERVICE ---
 * This service simulates a real backend by using localStorage.
 * It's intended for demonstration purposes without needing a database.
 */

export const signup = async (email: string, password: string, name: string, phoneNumber: string): Promise<{ success: boolean; message: string }> => {
  // Simulate network delay for a more realistic feel
  await new Promise(res => setTimeout(res, 500));
  
  const users = getUsers();
  if (users[email]) {
    return { success: false, message: 'User with this email already exists.' };
  }

  // NOTE: Storing passwords in plain text is insecure and only done here
  // because the backend has been removed as per the request.
  users[email] = { email, password, name, phoneNumber, profilePicture: null }; // Add profilePicture field
  saveUsers(users);

  return { success: true, message: 'Signup successful! Please log in.' };
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  
  const users = getUsers();
  const user = users[email];

  if (user && user.password === password) {
    // Return a user object including all details
    const loggedInUser: User = { 
        email: user.email, 
        name: user.name, 
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture
    };
    return { success: true, user: loggedInUser, message: 'Login successful' };
  } else {
    return { success: false, message: 'Invalid email or password.' };
  }
};

export const updateUserProfile = async (email: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; message: string }> => {
    await new Promise(res => setTimeout(res, 300)); // Simulate network delay

    const users = getUsers();
    const user = users[email];

    if (!user) {
        return { success: false, message: "User not found." };
    }

    // Update user data in the "database"
    const updatedUser = { ...user, ...updates };
    users[email] = updatedUser;
    saveUsers(users);

    // Also update the current session if it exists
    try {
        const storedSession = localStorage.getItem(SESSION_KEY);
        if (storedSession) {
            const session = JSON.parse(storedSession);
            if(session.user.email === email) {
                session.user = { ...session.user, ...updates };
                localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            }
        }
    } catch (e) {
        console.error("Could not update session:", e);
    }
    
    // Return the updated user object, excluding password
    const { password, ...userForContext } = updatedUser;
    return { success: true, user: userForContext, message: 'Profile updated successfully.' };
};
