
import api from './api';
import {
    Donation,
    CreateDonationDto
} from '@/lib/types';

export const donationService = {
    // Make Donation
    createDonation: async (data: CreateDonationDto): Promise<Donation> => {
        const response = await api.post<Donation>('/donations', data);
        return response.data;
    },

    // Get All Donations (Admin)
    getAllDonations: async (page = 1, limit = 10): Promise<{ data: Donation[], total: number }> => {
        const response = await api.get('/donations', { params: { page, limit } });
        return response.data;
    },

    // Confirm Donation (Webhook)
    confirmDonationBuilder: async (data: any): Promise<any> => {
        const response = await api.post('/donations/webhook/confirm', data);
        return response.data;
    },

    // Create Recurring Donation
    createRecurring: async (data: any): Promise<any> => {
        const response = await api.post('/donations/recurring', data);
        return response.data;
    },

    // Get My Donations
    getMyDonations: async (): Promise<Donation[]> => {
        const response = await api.get<Donation[]>('/donations/my-donations');
        return response.data;
    },

    // Get My Recurring Donations
    getMyRecurring: async (): Promise<any[]> => {
        const response = await api.get('/donations/my-recurring');
        return response.data;
    },

    // Get by Program
    getByProgram: async (programId: string): Promise<Donation[]> => {
        const response = await api.get<Donation[]>(`/donations/program/${programId}`);
        return response.data;
    },

    // Get by Project
    getByProject: async (projectId: string): Promise<Donation[]> => {
        const response = await api.get<Donation[]>(`/donations/project/${projectId}`);
        return response.data;
    },

    // Get by Status
    getByStatus: async (status: string): Promise<Donation[]> => {
        const response = await api.get<Donation[]>(`/donations/status/${status}`);
        return response.data;
    },

    // Search Donations
    searchDonations: async (query: string): Promise<Donation[]> => {
        const response = await api.get<Donation[]>('/donations/search', { params: { q: query } });
        return response.data;
    },

    // Get Stats
    getStats: async (): Promise<any> => {
        const response = await api.get('/donations/stats');
        return response.data;
    },

    // Get Recurring Stats
    getRecurringStats: async (): Promise<any> => {
        const response = await api.get('/donations/recurring-stats');
        return response.data;
    },

    // Get Donation by ID
    getDonationById: async (id: string): Promise<Donation> => {
        const response = await api.get<Donation>(`/donations/${id}`);
        return response.data;
    },

    // Delete Donation (Admin)
    deleteDonation: async (id: string): Promise<void> => {
        await api.delete(`/donations/${id}`);
    },

    // Update Recurring
    updateRecurring: async (id: string, data: any): Promise<any> => {
        const response = await api.put(`/donations/recurring/${id}`, data);
        return response.data;
    },

    // Cancel Recurring
    cancelRecurring: async (id: string): Promise<void> => {
        await api.post(`/donations/recurring/${id}/cancel`);
    },

    // Process Recurring (Admin)
    processRecurring: async (): Promise<any> => {
        const response = await api.post('/donations/process-recurring');
        return response.data;
    }
};
