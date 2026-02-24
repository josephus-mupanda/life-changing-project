// lib/auth-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginDto, RegisterDto, UserType } from './types';
import { authService } from '@/services/auth.service';
import { staffService } from '@/services/staff.service';
import { beneficiaryService } from '@/services/beneficiary.service';
import { donorService } from '@/services/donor.service';
import { useProfile } from './profile-context';
import { toast } from 'sonner';
import api from '@/services/api';


interface AuthContextType {
    user: User | null;
    login: (credentials: LoginDto) => Promise<void>;
    register: (data: RegisterDto) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
    isProfileReady: boolean; // New flag to indicate profile is loaded or confirmed missing
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileReady, setIsProfileReady] = useState(false);
    const { setProfile, clearProfile, setIsLoading: setProfileLoading } = useProfile();

    // In fetchAndSetProfile function
    const fetchAndSetProfile = async (user: User | null) => {
        if (!user) {
            setIsProfileReady(false);
            return;
        }

        setProfileLoading(true);
        try {
            let profileData = null;

            if (user.userType === UserType.ADMIN) {
                profileData = await staffService.getProfile();
                if (profileData) {
                    setProfile(profileData, 'staff');
                }
            } else if (user.userType === UserType.BENEFICIARY) {
                profileData = await beneficiaryService.getProfile();
                if (profileData) {
                    setProfile(profileData, 'beneficiary');
                }
            } else if (user.userType === UserType.DONOR) {
                profileData = await donorService.getProfile();
                if (profileData) {
                    setProfile(profileData, 'donor');
                }
            }

            // Profile is ready even if null (means user needs to complete profile)
            setIsProfileReady(true);

            if (!profileData) {
                console.log("No profile found - user needs to complete profile");
            }
        } catch (err: any) {
            console.error("Failed to fetch profile:", err);
            // For 404, still mark as ready (user needs to complete profile)
            if (err.response?.status === 404) {
                console.log("Profile not found - user needs to complete profile");
                clearProfile();
                setIsProfileReady(true);
            } else {
                clearProfile();
                setIsProfileReady(false);
            }
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Set default auth header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    const userProfile = await authService.getProfile();
                    const userData = (userProfile as any).data || userProfile;
                    setUser(userData);
                    await fetchAndSetProfile(userData);
                } catch (error) {
                    console.error("Failed to restore session", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    delete api.defaults.headers.common['Authorization'];
                    clearProfile();
                    setIsProfileReady(false);
                }
            } else {
                clearProfile();
                setIsProfileReady(false);
            }
            setIsLoading(false);
        };
        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (credentials: LoginDto) => {
        setIsLoading(true);
        setIsProfileReady(false);
        setProfileLoading(true);

        try {
            const response = await authService.login(credentials);

            // Handle your API response structure
            const responseData = (response as any).data || response;;

            // Extract tokens based on your AuthResponse interface
            const tokens = responseData.tokens;
            const userData = responseData.user;

            if (!tokens?.accessToken || !userData) {
                throw new Error(`Invalid response from server. Missing token or user.`);
            }

            // Store tokens
            localStorage.setItem('token', tokens.accessToken);
            if (tokens.refreshToken) {
                localStorage.setItem('refreshToken', tokens.refreshToken);
            }

            // Set default auth header
            api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

            setUser(userData);
            await fetchAndSetProfile(userData);

            toast.success(`Welcome back, ${userData.fullName || 'User'}!`);
        } catch (error: any) {
            console.error("Login failed", error);
            const msg = error.response?.data?.message || error.message || 'Invalid email or password';
            toast.error(msg);
            setIsProfileReady(false);
            throw error;
        } finally {
            setIsLoading(false);
            setProfileLoading(false);
        }
    };

    const register = async (data: RegisterDto) => {
        setIsLoading(true);
        setIsProfileReady(false);

        try {
            const response = await authService.register(data);

            // Handle response structure
            const responseData = (response as any).data || response;

            const tokens = responseData.tokens;
            const userData = responseData.user;

            // Store tokens
            localStorage.setItem('token', tokens.accessToken);
            if (tokens.refreshToken) {
                localStorage.setItem('refreshToken', tokens.refreshToken);
            }

            // Set default auth header
            api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

            setUser(userData);

            // For new users, profile won't exist yet - that's expected
            try {
                await fetchAndSetProfile(userData);
            } catch (profileError: any) {
                // If profile fetch fails with 404, that's fine for new users
                if (profileError.response?.status === 404) {
                    console.log('New user - profile will be created later');
                    setIsProfileReady(true);
                } else {
                    throw profileError;
                }
            }

            toast.success(`Welcome, ${userData.fullName}!`);
        } catch (error: any) {
            console.error("Registration failed", error);
            const msg = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(msg);
            setIsProfileReady(false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.clear();
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            clearProfile();
            setIsProfileReady(false);
            window.location.href = '/#/login';
        }
    };

    const refreshUser = async () => {
        try {
            const response = await authService.getProfile();
            const userData = (response as any).data || response;
            setUser(userData);
            await fetchAndSetProfile(userData);
        } catch (error) {
            clearProfile();
            setIsProfileReady(false);
            console.error("Failed to refresh user", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            refreshUser,
            isAuthenticated: !!user,
            isLoading,
            isProfileReady
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}