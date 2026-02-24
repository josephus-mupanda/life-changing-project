import api from './api';
import {
    Story,
    CreateStoryDto,
    UpdateStoryDto
} from '@/lib/types';

export const storiesService = {
    // Get All Stories (Public)
    getStories: async (page = 1, limit = 10): Promise<{ data: Story[], total: number }> => {
        const params = { page, limit };
        const response = await api.get('/stories', { params });
        return response.data;
    },

    // Get Story by ID
    getStory: async (id: string): Promise<Story> => {
        const response = await api.get<Story>(`/stories/${id}`);
        return response.data;
    },

    // Create Story (Admin)
    createStory: async (data: CreateStoryDto): Promise<Story> => {
        const response = await api.post<Story>('/stories', data);
        return response.data;
    },

    // Update Story (Admin)
    updateStory: async (id: string, data: UpdateStoryDto): Promise<Story> => {
        const response = await api.patch<Story>(`/stories/${id}`, data);
        return response.data;
    },

    // Delete Story (Admin)
    deleteStory: async (id: string): Promise<void> => {
        await api.delete(`/stories/${id}`);
    },

    // Get Featured Stories
    getFeaturedStories: async (): Promise<Story[]> => {
        const response = await api.get<Story[]>('/stories/featured');
        return response.data;
    },

    // Get Stories by Program
    getStoriesByProgram: async (programId: string): Promise<Story[]> => {
        const response = await api.get<Story[]>(`/stories/program/${programId}`);
        return response.data;
    },

    // Search Stories
    searchStories: async (query: string): Promise<Story[]> => {
        const response = await api.get<Story[]>('/stories/search', { params: { q: query } });
        return response.data;
    },

    // Get Stats
    getStats: async (): Promise<any> => {
        const response = await api.get('/stories/stats/summary');
        return response.data;
    },

    // Get Admin All Stories
    getAllStoriesAdmin: async (page = 1, limit = 10, filters?: any): Promise<any> => {
        const response = await api.get('/stories/admin/all', { params: { page, limit, ...filters } });
        return response.data;
    },

    // Share Story
    shareStory: async (id: string): Promise<void> => {
        await api.post(`/stories/${id}/share`);
    },

    // Upload Story Media (Add)
    addStoryMedia: async (id: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/stories/${id}/media`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Remove Media
    removeStoryMedia: async (id: string, mediaId: string): Promise<void> => {
        await api.delete(`/stories/${id}/media`, { data: { mediaId } });
    },

    // Update Media Caption
    updateMediaCaption: async (id: string, mediaId: string, caption: string): Promise<any> => {
        const response = await api.patch(`/stories/${id}/media/caption`, { mediaId, caption });
        return response.data;
    }
};
