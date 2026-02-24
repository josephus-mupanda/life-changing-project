import api from './api';
import {
    LoginDto,
    LoginResponse,
    RegisterDto,
    RegisterResponse,
    User
} from '@/lib/types';

export const authService = {
    // Login
    login: async (credentials: LoginDto): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return (response.data as any)?.data || response.data;
    },

    // Register
    register: async (data: RegisterDto): Promise<RegisterResponse> => {
        const response = await api.post<RegisterResponse>('/auth/register', data);
        return (response.data as any)?.data || response.data;
    },

    // Get Current User Profile
    getProfile: async (): Promise<User> => {
        const response = await api.post<User>('/auth/me');
        return (response.data as any)?.data || response.data;
    },

    // Refresh Token
    refreshToken: async (token: string): Promise<{ accessToken: string, refreshToken: string }> => {
        const response = await api.post('/auth/refresh', { refreshToken: token });
        return (response.data as any)?.data || response.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    // Request Password Reset
    forgotPassword: async (email: string): Promise<void> => {
        await api.post('/auth/forgot-password', { email });
    },

    // Reset Password
    resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<void> => {
        await api.post('/auth/reset-password', {
            token,
            newPassword,
            confirmPassword
        });
    },
    // Verify Account
    verifyAccount: async (token: string): Promise<void> => {
        await api.post('/auth/verify', { token });
    },
    resendVerificationCode: async (phone: string): Promise<void> => {
    await api.post('/auth/resend-verification', { phone });
},
};
