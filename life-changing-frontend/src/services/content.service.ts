import api from './api';

export interface PageContent {
    id: string;
    page: string;
    section: string;
    key: string;
    value: string;
    type: string;
}

export interface Story {
    id: string;
    title: string;
    slug: string;
    content: string;
    image_url: string;
    type: string;
    author: string;
    is_published: boolean;
    createdAt: string;
}

export const ContentService = {
    // Page Content
    getPageContent: async (page: string) => {
        const response = await api.get<PageContent[]>(`/content/page/${page}`);
        return response.data;
    },

    getPageSection: async (page: string, section: string) => {
        const response = await api.get<PageContent[]>(`/content/page/${page}/${section}`);
        return response.data;
    },

    updateContent: async (page: string, section: string, key: string, value: string) => {
        const response = await api.put<PageContent>(`/content/page/${page}/${section}/${key}`, { value });
        return response.data;
    },

    // Stories
    getStories: async (type: string = 'story') => {
        const response = await api.get<Story[]>(`/content/stories`, { params: { type } });
        return response.data;
    },

    createStory: async (storyData: Partial<Story>) => {
        const response = await api.post<Story>(`/content/stories`, storyData);
        return response.data;
    },

    updateStory: async (id: string, storyData: Partial<Story>) => {
        const response = await api.put<Story>(`/content/stories/${id}`, storyData);
        return response.data;
    },

    deleteStory: async (id: string) => {
        return api.delete(`/content/stories/${id}`);
    }
};
