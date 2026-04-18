/**
 * Authentication Store (Zustand)
 * Manages authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Login
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authAPI.login(credentials);
                    const { user, accessToken, refreshToken } = response.data;
                    
                    // Store tokens in localStorage
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    
                    // Also store user data in localStorage for debugging
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Update auth store state
                    set({ user, isAuthenticated: true, isLoading: false, error: null });
                    
                    console.log('Login successful:', { user, role: user.role, permissions: user.permissions });
                    return { success: true, user };
                } catch (error) {
                    console.error('Login error:', error);
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            // Register
            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authAPI.register(userData);
                    set({ isLoading: false });
                    return { success: true, message: response.message };
                } catch (error) {
                    const message = error.response?.data?.message || 'Registration failed';
                    const errors = error.response?.data?.errors || [];
                    set({ error: message, isLoading: false });
                    return { success: false, error: message, errors };
                }
            },

            // Logout
            logout: async () => {
                set({ isLoading: true });
                try {
                    await authAPI.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    // Clear all auth-related data
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
                }
            },

            // Get current user
            fetchUser: async () => {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    set({ user: null, isAuthenticated: false });
                    return null;
                }

                set({ isLoading: true });
                try {
                    const response = await authAPI.getMe();
                    const user = response.data.user;
                    
                    // Update localStorage with fresh user data
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    set({ user, isAuthenticated: true, isLoading: false });
                    console.log('Fetched user:', { user, role: user.role, permissions: user.permissions });
                    return user;
                } catch (error) {
                    console.error('Fetch user error:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    set({ user: null, isAuthenticated: false, isLoading: false });
                    return null;
                }
            },

            // Check if user has role
            hasRole: (role) => {
                const user = get().user;
                return user?.role === role;
            },

            // Check if user is admin
            isAdmin: () => get().hasRole('admin'),

            // Check if user is employee
            isEmployee: () => get().hasRole('employee'),

            // Check if user is customer
            isCustomer: () => get().hasRole('customer')
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                const token = localStorage.getItem('accessToken');

                // Guard against stale persisted auth state when tokens were cleared.
                if (!token && state?.isAuthenticated) {
                    state.user = null;
                    state.isAuthenticated = false;
                }
            }
        }
    )
);

export default useAuthStore;
export { useAuthStore };
