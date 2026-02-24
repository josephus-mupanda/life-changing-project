import api from './api';
import {
    Program,
    CreateProgramDto,
    UpdateProgramDto,
    Project,
    CreateProjectDto,
    UpdateProjectDto
} from '@/lib/types';

export const programsService = {
    // --- Programs ---

    // Get All Programs (Public)
    getPrograms: async (page = 1, limit = 10, search?: string): Promise<{ data: Program[], total: number }> => {
        const params = { page, limit, search };
        const response = await api.get('/programs', { params });
        return response.data?.data || response.data;
    },

    // Get Program by ID
    getProgram: async (id: string): Promise<Program> => {
        const response = await api.get<any>(`/programs/${id}`);
        return response.data?.data || response.data;
    },

    // Create Program (Admin)
    createProgram: async (data: CreateProgramDto): Promise<Program> => {
        // Handling file uploads if necessary (usually separate endpoint or multipart)
        // Assuming JSON for now based on DTO
        const response = await api.post<any>('/programs', data);
        return response.data?.data || response.data;
    },

    // Update Program (Admin)
    updateProgram: async (id: string, data: UpdateProgramDto): Promise<Program> => {
        const response = await api.patch<any>(`/programs/${id}`, data);
        return response.data?.data || response.data;
    },

    // Delete Program (Admin)
    deleteProgram: async (id: string): Promise<void> => {
        await api.delete(`/programs/${id}`);
    },

    // Upload Program Image
    uploadProgramImage: async (id: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/programs/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data?.data || response.data;
    },

    // Upload Program Cover
    uploadProgramCover: async (id: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/programs/${id}/cover`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data?.data || response.data;
    },

    // Upload Program Logo
    uploadProgramLogo: async (id: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/programs/${id}/logo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data?.data || response.data;
    },

    // Get Program Stats
    getProgramStats: async (id: string): Promise<any> => {
        const response = await api.get(`/programs/${id}/stats`);
        return response.data;
    },


    // Get Admin List
    getAdminList: async (page = 1, limit = 10, search?: string): Promise<{ data: Program[], total: number }> => {
        const params = { page, limit, search: search || undefined };
        const response = await api.get('/programs/admin/list', { params });
        return response.data?.data || response.data;
    },

    // --- Projects ---

    // Get All Projects
    getProjects: async (page = 1, limit = 10, programId?: string): Promise<{ data: Project[], total: number }> => {
        const params = { page, limit };
        const url = programId ? `/programs/${programId}/projects` : '/projects'; // Support both if needed, but spec says /programs/{id}/projects
        const response = await api.get(url, { params });
        return response.data?.data || response.data;
    },

    // Get Project by ID
    getProject: async (programId: string, projectId: string): Promise<Project> => {
        // Spec says: GET /api/v1/programs/{programId}/projects/{projectId}
        // Also: GET /api/v1/projects/{projectId} (public wrapper likely)
        // Let's support the specific program one as primary for this service
        const response = await api.get<any>(`/programs/${programId}/projects/${projectId}`);
        return response.data?.data || response.data;
    },

    // Get Project Public (if needed by standalone ID)
    getProjectPublic: async (projectId: string): Promise<Project> => {
        const response = await api.get<Project>(`/projects/${projectId}`);
        return response.data;
    },

    // Create Project (Admin)
    createProject: async (
        programId: string,
        data: CreateProjectDto,
        coverImage?: File,
        gallery?: File[]
    ): Promise<Project> => {
        const formData = new FormData();

        // Append DTO fields
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                if (typeof value === 'object' && !(value instanceof Date)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        if (gallery && gallery.length > 0) {
            gallery.forEach(file => formData.append('gallery', file));
        }

        const response = await api.post<any>(`/programs/${programId}/projects`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return (response.data as any)?.data || response.data;
    },

    // Update Project (Admin)
    updateProject: async (
        programId: string,
        projectId: string,
        data: UpdateProjectDto,
        coverImage?: File,
        gallery?: File[]
    ): Promise<Project> => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                if (typeof value === 'object' && !(value instanceof Date)) {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        if (gallery && gallery.length > 0) {
            gallery.forEach(file => formData.append('gallery', file));
        }

        const response = await api.patch<any>(`/programs/${programId}/projects/${projectId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return (response.data as any)?.data || response.data;
    },

    // Delete Project (Admin)
    deleteProject: async (programId: string, projectId: string): Promise<void> => {
        await api.delete(`/programs/${programId}/projects/${projectId}`);
    },

    // Upload Project Cover
    uploadProjectCover: async (programId: string, projectId: string, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/programs/${programId}/projects/${projectId}/cover`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Add Gallery Files
    addGalleryFiles: async (programId: string, projectId: string, files: File[]): Promise<any> => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const response = await api.post(`/programs/${programId}/projects/${projectId}/gallery`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Update Gallery Captions
    updateGallery: async (programId: string, projectId: string, data: any): Promise<any> => {
        const response = await api.patch(`/programs/${programId}/projects/${projectId}/gallery`, data);
        return response.data;
    },

    // Delete Gallery Items
    deleteGalleryItems: async (programId: string, projectId: string, publicIds: string[]): Promise<void> => {
        // DELETE with body is tricky in some axios versions/proxies, but standard axios supports it via `data` option
        await api.delete(`/programs/${programId}/projects/${projectId}/gallery`, { data: { publicIds } });
    },

    // Delete Single Gallery Image
    deleteGalleryImage: async (programId: string, projectId: string, publicId: string): Promise<void> => {
        await api.delete(`/programs/${programId}/projects/${projectId}/gallery/${publicId}`);
    },

    // Update Allocation (Admin)
    updateAllocation: async (projectId: string, allocation: number): Promise<Project> => {
        const response = await api.patch<Project>(`/projects/${projectId}/allocation`, { allocation });
        return response.data;
    },

    // Update Budget (Admin)
    updateBudget: async (projectId: string, budget: number): Promise<Project> => {
        const response = await api.patch<Project>(`/projects/${projectId}/budget`, { budget });
        return response.data;
    },
};
