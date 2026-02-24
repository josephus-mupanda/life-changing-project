
import api from './api';
import {
    Staff,
    CreateStaffDto,
    UpdateStaffDto
} from '@/lib/types';

export const staffService = {
    // Complete Profile
    createProfile: async (data: CreateStaffDto): Promise<Staff> => {
        const response = await api.post<Staff>('/staff/profile', data);
        return response.data;
    },

    // Get Profile
    getProfile: async (): Promise<Staff> => {
        const response = await api.get<Staff>('/staff/profile');
        return response.data;
    },

    // Update Profile
    updateProfile: async (data: UpdateStaffDto): Promise<Staff> => {
        const response = await api.put<Staff>('/staff/profile', data);
        return response.data;
    },

    // Get All Staff (Admin)
    getAllStaff: async (): Promise<Staff[]> => {
        const response = await api.get<Staff[]>('/staff');
        return response.data;
    },

    // Get by Department
    getByDepartment: async (department: string): Promise<Staff[]> => {
        const response = await api.get<Staff[]>(`/staff/department/${department}`);
        return response.data;
    },

    // Search Staff
    searchStaff: async (query: string): Promise<Staff[]> => {
        const response = await api.get<Staff[]>('/staff/search', { params: { q: query } });
        return response.data;
    },

    // Get Stats
    getStats: async (): Promise<any> => {
        const response = await api.get('/staff/stats');
        return response.data;
    },

    // Check Profile Status
    getProfileStatus: async (): Promise<any> => {
        const response = await api.get('/staff/profile/status');
        return response.data;
    }
};
