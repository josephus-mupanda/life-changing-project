import api from './api';
import {
    User,
    Beneficiary,
    Donor,
    Staff,
    CreateStaffDto
} from '@/lib/types';

export const adminService = {
    // Get All Users
    getUsers: async (page = 1, limit = 10, search?: string): Promise<{ data: User[], total: number }> => {
        const params = { page, limit, search: search || undefined };
        const response = await api.get('/users', { params });
        return response.data?.data || response.data;
    },

    // Get User by ID
    getUser: async (id: string): Promise<User> => {
        const response = await api.get<any>(`/users/${id}`);
        return response.data?.data || response.data;
    },

    // Update User
    updateUser: async (id: string, data: Partial<User>): Promise<User> => {
        const response = await api.patch<any>(`/users/${id}`, data);
        return response.data?.data || response.data;
    },

    // Delete User
    deleteUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    // Get Incomplete Profiles
    getIncompleteProfiles: async (): Promise<any> => {
        const response = await api.get<any>('/users/incomplete-profiles');
        return response.data?.data || response.data;
    },

    // Get Pending Activation
    getPendingActivationUsers: async (page = 1, limit = 10): Promise<any> => {
        const response = await api.get<any>('/users/pending-activation', {
            params: { page, limit }
        });
        return response.data?.data || response.data;
    },

    // Get User Stats
    getUserStats: async (): Promise<any> => {
        const response = await api.get('/users/stats/count');
        return response.data;
    },

    // Get User Profile Status
    getUserProfileStatus: async (id: string): Promise<any> => {
        const response = await api.get(`/users/${id}/profile-status`);
        return response.data;
    },

    // Activate User
    activateUser: async (id: string): Promise<User> => {
        const response = await api.patch<User>(`/users/${id}/activate`, { isActive: true });
        return (response.data as any)?.data || response.data;
    },

    // Deactivate User
    deactivateUser: async (id: string): Promise<User> => {
        const response = await api.patch<User>(`/users/${id}/deactivate`, { reason: 'Admin action' });
        return (response.data as any)?.data || response.data;
    },

    // Reactivate User
    reactivateUser: async (id: string): Promise<User> => {
        const response = await api.patch<User>(`/users/${id}/reactivate`, { reason: 'Admin action' });
        return (response.data as any)?.data || response.data;
    },

    // Get User Status
    getUserStatus: async (id: string): Promise<any> => {
        const response = await api.get(`/users/${id}/status`);
        return response.data;
    },

    // Get Beneficiaries
    getBeneficiaries: async (page = 1, limit = 10): Promise<{ data: Beneficiary[], total: number }> => {
        const params = { page, limit };
        const response = await api.get('/beneficiaries', { params });
        return response.data?.data || response.data;
    },

    // Get Donors
    getDonors: async (page = 1, limit = 10): Promise<{ data: Donor[], total: number }> => {
        const params = { page, limit };
        const response = await api.get('/donors', { params });
        return response.data?.data || response.data;
    },

    // Get Staff
    getStaff: async (page = 1, limit = 10): Promise<{ data: Staff[], total: number }> => {
        const params = { page, limit };
        const response = await api.get('/staff', { params });
        return response.data;
    },

    // Create Staff
    createStaff: async (data: CreateStaffDto): Promise<Staff> => {
        const response = await api.post<any>('/staff', data);
        return response.data?.data || response.data;
    },

    // Create Donor Profile (Admin)
    createDonorProfile: async (userId: string, data: any): Promise<Donor> => {
        const response = await api.post<any>(`/donors/admin/${userId}`, data);
        return response.data?.data || response.data;
    },

    // Get Donor by ID
    getDonorById: async (id: string): Promise<Donor> => {
        const response = await api.get<any>(`/donors/${id}`);
        return response.data?.data || response.data;
    },

    // Get All Donations
    getDonations: async (page = 1, limit = 10, search?: string): Promise<{ data: any[], total: number }> => {
        const params = { page, limit, search: search || undefined };
        const response = await api.get('/donations', { params });
        return response.data?.data || response.data;
    },

    // Get Dashboard Stats (Custom endpoint or aggregated)
    getDashboardStats: async (): Promise<any> => {
        // Aggregated calls or specific dashboard endpoint if exists
        // The backend didn't explicitly list "admin dashboard stats" but maybe calculating locally or separate calls
        // For now, return empty object or call individual stats
        return {};
    }
};
