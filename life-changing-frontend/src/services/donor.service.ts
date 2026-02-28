import api from './api';
import {
    Donor,
    CreateDonorDto,
    UpdateDonorDto,
    Donation,
    CreateDonationDto
} from '@/lib/types';

export const donorService = {
    // Get Profile
    getProfile: async (): Promise<Donor> => {
        const response = await api.get<Donor>('/donors/profile');
        return response.data;
    },

    // Create Profile - FIXED: changed from '/donors' to '/donors/profile'
    createProfile: async (data: CreateDonorDto): Promise<Donor> => {
        const response = await api.post<Donor>('/donors/profile', data);
        return response.data;
    },

    // Update Profile
    updateProfile: async (data: UpdateDonorDto): Promise<Donor> => {
        const response = await api.put<Donor>('/donors/profile', data);
        return response.data;
    },

    // Get My Donations (uses donation service, so correct)
    getMyDonations: async (): Promise<Donation[]> => {
        const response = await api.get<Donation[]>('/donations/my-donations');
        return response.data;
    },

    // Make Donation (uses donation service, so correct)
    makeDonation: async (data: CreateDonationDto): Promise<Donation> => {
        const response = await api.post<Donation>('/donations', data);
        return response.data;
    },

    // Get Stats
    getStats: async (): Promise<any> => {
        const response = await api.get('/donors/stats');
        return response.data;
    },

    // Search Donors
    searchDonors: async (query: string): Promise<Donor[]> => {
        const response = await api.get<Donor[]>('/donors/search', { params: { q: query } });
        return response.data;
    },

    // Get Top Donors
    getTopDonors: async (): Promise<Donor[]> => {
        const response = await api.get<Donor[]>('/donors/top');
        return response.data;
    },

    // Get Donors by Country
    getByCountry: async (country: string): Promise<Donor[]> => {
        const response = await api.get<Donor[]>(`/donors/country/${country}`);
        return response.data;
    },

    // Delete Donor
    deleteDonor: async (id: string): Promise<void> => {
        await api.delete(`/donors/${id}`);
    },

    // Check Profile Status
    getProfileStatus: async (): Promise<any> => {
        const response = await api.get('/donors/profile/status');
        return response.data;
    }
};
