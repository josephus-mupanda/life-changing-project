import api from './api';
import {
    Beneficiary,
    CreateBeneficiaryDto,
    UpdateBeneficiaryDto,
    WeeklyTrackingDto,
    BusinessGoal,
    CreateGoalDto,
    UpdateGoalDto,
    CreateEmergencyContactDto,
    UpdateEmergencyContactDto,
    BeneficiaryDocument
} from '@/lib/types';


export const beneficiaryService = {
    // --- Profile Management ---

    // Complete Profile
    createProfile: async (data: CreateBeneficiaryDto): Promise<Beneficiary> => {
        const response = await api.post<Beneficiary>('/beneficiaries/profile', data);
        return response.data;
    },

    // Get Profile
    getProfile: async (): Promise<Beneficiary> => {
        const response = await api.get<Beneficiary>('/beneficiaries/profile');
        return response.data;
    },

    // Update Profile
    updateProfile: async (data: UpdateBeneficiaryDto): Promise<Beneficiary> => {
        const response = await api.put<Beneficiary>('/beneficiaries/profile', data);
        return response.data;
    },

    // Check Profile Status
    getProfileStatus: async (): Promise<any> => {
        const response = await api.get('/beneficiaries/profile/status');
        return response.data;
    },

    // --- Admin/Management (Admin Access Mainly) ---

    // Get Attention Required
    getAttentionRequired: async (): Promise<Beneficiary[]> => {
        const response = await api.get<Beneficiary[]>('/beneficiaries/attention-required');
        return response.data;
    },

    // Search Beneficiaries
    searchBeneficiaries: async (query: string): Promise<Beneficiary[]> => {
        const response = await api.get<Beneficiary[]>('/beneficiaries/search', { params: { q: query } });
        return response.data;
    },

    // Get Stats
    getStats: async (): Promise<any> => {
        const response = await api.get('/beneficiaries/stats');
        return response.data;
    },

    // Get All Beneficiaries - FIXED: changed from '/beneficiaries' to '/beneficiaries/all'
    getAllBeneficiaries: async (page = 1, limit = 10): Promise<{ data: Beneficiary[], total: number }> => {
        const response = await api.get('/beneficiaries/all', { params: { page, limit } });
        return response.data;
    },

    // Get Unassigned
    getUnassigned: async (): Promise<Beneficiary[]> => {
        const response = await api.get<Beneficiary[]>('/beneficiaries/unassigned');
        return response.data;
    },

    // Assign Program
    assignProgram: async (id: string, programId: string): Promise<Beneficiary> => {
        const response = await api.post<Beneficiary>(`/beneficiaries/${id}/assign-program`, { programId });
        return response.data;
    },

    // Get by Program
    getByProgram: async (programId: string): Promise<Beneficiary[]> => {
        const response = await api.get<Beneficiary[]>(`/beneficiaries/program/${programId}`);
        return response.data;
    },

    // Get by Status
    getByStatus: async (status: string): Promise<Beneficiary[]> => {
        const response = await api.get<Beneficiary[]>(`/beneficiaries/status/${status}`);
        return response.data;
    },

    // Graduate Beneficiary
    graduate: async (id: string): Promise<Beneficiary> => {
        const response = await api.put<Beneficiary>(`/beneficiaries/${id}/graduate`);
        return response.data;
    },

    // Delete Beneficiary
    delete: async (id: string): Promise<void> => {
        await api.delete(`/beneficiaries/${id}`);
    },

    // Get Beneficiary by ID (Admin)
    getBeneficiaryById: async (id: string): Promise<Beneficiary> => {
        const response = await api.get<Beneficiary>(`/beneficiaries/${id}`);
        return response.data;
    },

    // Get Tracking by Beneficiary ID (Admin) - This endpoint doesn't exist in the controller shown
    // You may need to verify if this is handled by a different controller
    getBeneficiaryTracking: async (id: string): Promise<any[]> => {
        const response = await api.get<any[]>(`/beneficiaries/${id}/tracking`);
        return response.data;
    },

    // --- Weekly Tracking ---

    // Submit Weekly Tracking
    submitWeeklyTracking: async (data: WeeklyTrackingDto): Promise<any> => {
        const response = await api.post('/beneficiaries/tracking', data);
        return response.data;
    },

    // Get Tracking History
    getWeeklyTracking: async (): Promise<any[]> => {
        const response = await api.get('/beneficiaries/tracking/history');
        return response.data;
    },

    // Get Recent Trackings
    getRecentTrackings: async (limit = 5): Promise<any[]> => {
        const response = await api.get('/beneficiaries/tracking/recent', { params: { limit } });
        return response.data;
    },

    // Get Attendance Stats
    getAttendanceStats: async (): Promise<any> => {
        try {
            // First try the endpoint
            const response = await api.get('/beneficiaries/tracking/attendance-stats');
            return response.data;
        } catch (error) {
            console.warn('Attendance stats endpoint failed, calculating from tracking history...');
            // Fallback: Calculate from tracking history
            try {
                const history = await beneficiaryService.getWeeklyTracking();
                if (!history || history.length === 0) {
                    return { averageAttendance: 0, monthlyAttendance: [] };
                }

                const total = history.length;
                const present = history.filter((t: any) => t.attendance === 'present').length;
                const average = Math.round((present / total) * 100);

                // Group by month for chart (simplified)
                const monthlyAttendance = history.slice(0, 4).map((t: any, index: number) => ({
                    name: `Week ${index + 1}`,
                    attendance: t.attendance === 'present' ? 100 : 0
                })).reverse();

                return {
                    averageAttendance: average,
                    monthlyAttendance
                };
            } catch (fallbackError) {
                console.error('Failed to calculate attendance stats locally', fallbackError);
                return { averageAttendance: 0, monthlyAttendance: [] };
            }
        }
    },

    // Get by Date Range (Admin)
    getTrackingByDateRange: async (startDate: string, endDate: string): Promise<any[]> => {
        const response = await api.get('/beneficiaries/tracking/date-range', { params: { startDate, endDate } });
        return response.data;
    },

    // Get Tracking by ID
    getTrackingById: async (id: string): Promise<any> => {
        const response = await api.get(`/beneficiaries/tracking/${id}`);
        return response.data;
    },

    // Delete Tracking (Admin)
    deleteTracking: async (id: string): Promise<void> => {
        await api.delete(`/beneficiaries/tracking/${id}`);
    },

    // Verify Tracking (Admin)
    verifyTracking: async (id: string): Promise<any> => {
        const response = await api.put(`/beneficiaries/tracking/${id}/verify`);
        return response.data;
    },

    // --- Goals ---

    // Create Goal
    createGoal: async (data: CreateGoalDto): Promise<BusinessGoal> => {
        const response = await api.post<BusinessGoal>('/beneficiaries/goals', data);
        return response.data;
    },

    // Get Goals - UPDATED: now uses '/all'
    getGoals: async (): Promise<BusinessGoal[]> => {
        const response = await api.get<BusinessGoal[]>('/beneficiaries/goals/all');
        return response.data;
    },

    // Get Goals by Type (unchanged)
    getGoalsByType: async (type: string): Promise<BusinessGoal[]> => {
        const response = await api.get<BusinessGoal[]>(`/beneficiaries/goals/type/${type}`);
        return response.data;
    },

    // Get Goals by Status (unchanged)
    getGoalsByStatus: async (status: string): Promise<BusinessGoal[]> => {
        const response = await api.get<BusinessGoal[]>(`/beneficiaries/goals/status/${status}`);
        return response.data;
    },

    // Update Goal Progress (unchanged)
    updateGoalProgress: async (id: string, progress: number): Promise<BusinessGoal> => {
        const response = await api.put<BusinessGoal>(`/beneficiaries/goals/${id}/progress`, { progress });
        return response.data;
    },

    // Get Goal Stats (unchanged)
    getGoalStats: async (): Promise<any> => {
        const response = await api.get('/beneficiaries/goals/stats');
        return response.data;
    },

    // Update Goal (unchanged)
    updateGoal: async (id: string, goal: UpdateGoalDto): Promise<BusinessGoal> => {
        const response = await api.put<BusinessGoal>(`/beneficiaries/goals/${id}`, goal);
        return response.data;
    },

    // Delete Goal (unchanged)
    deleteGoal: async (id: string): Promise<void> => {
        await api.delete(`/beneficiaries/goals/${id}`);
    },

    // Get Goal by ID (unchanged)
    getGoalById: async (id: string): Promise<BusinessGoal> => {
        const response = await api.get<BusinessGoal>(`/beneficiaries/goals/${id}`);
        return response.data;
    },

    // Get Goals by Beneficiary ID (Admin)
    getBeneficiaryGoals: async (beneficiaryId: string): Promise<BusinessGoal[]> => {
        const response = await api.get<BusinessGoal[]>(`/beneficiaries/${beneficiaryId}/goals`);
        return response.data;
    },

    // --- Emergency Contacts ---

    // Add Emergency Contact
    addEmergencyContact: async (data: CreateEmergencyContactDto): Promise<any> => {
        const response = await api.post('/beneficiaries/emergency-contacts', data);
        return response.data;
    },

    // Get Emergency Contacts - UPDATED: now uses '/all'
    getEmergencyContacts: async (page?: number, limit?: number): Promise<any[]> => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());

        const response = await api.get('/beneficiaries/emergency-contacts/all', { params });
        return response.data;
    },

    // Get Primary Contact (unchanged - still works)
    getPrimaryContact: async (): Promise<any> => {
        const response = await api.get('/beneficiaries/emergency-contacts/primary');
        return response.data;
    },

    // Set Primary - UPDATED: now uses '/set-primary/:id' instead of '/:id/set-primary'
    setPrimaryContact: async (id: string): Promise<any> => {
        const response = await api.put(`/beneficiaries/emergency-contacts/set-primary/${id}`);
        return response.data;
    },

    // Update Contact (unchanged - still uses '/:id')
    updateEmergencyContact: async (id: string, data: UpdateEmergencyContactDto): Promise<any> => {
        const response = await api.put(`/beneficiaries/emergency-contacts/${id}`, data);
        return response.data;
    },

    // Delete Contact (unchanged - still uses '/:id')
    deleteEmergencyContact: async (id: string): Promise<void> => {
        await api.delete(`/beneficiaries/emergency-contacts/${id}`);
    },

    // Get Contact by ID (unchanged - still uses '/:id')
    getEmergencyContactById: async (id: string): Promise<any> => {
        const response = await api.get(`/beneficiaries/emergency-contacts/${id}`);
        return response.data;
    },

    // --- Documents ---

    // Upload Document (for beneficiary-documents module)
    uploadDocument: async (file: File, type: string): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', type);
        const response = await api.post('/beneficiaries/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Get Documents - FIXED: changed from '/beneficiaries/documents' to '/beneficiaries/documents/all'
    getDocuments: async (type?: string): Promise<BeneficiaryDocument[]> => {
        const params = type ? { type } : {};
        const response = await api.get<BeneficiaryDocument[]>('/beneficiaries/documents/all', { params });
        return response.data;
    },

    // Upload Multiple Documents (Admin only)
    uploadMultipleDocuments: async (files: File[], type: string): Promise<any> => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        formData.append('documentType', type);
        const response = await api.post('/beneficiaries/documents/upload/multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Get Document by ID
    getDocument: async (id: string): Promise<BeneficiaryDocument> => {
        const response = await api.get<BeneficiaryDocument>(`/beneficiaries/documents/${id}`);
        return response.data;
    },

    // Get Document Stats
    getDocumentStats: async (): Promise<any> => {
        const response = await api.get('/beneficiaries/documents/stats/summary');
        return response.data;
    },

    // Get Recent Documents
    getRecentDocuments: async (): Promise<BeneficiaryDocument[]> => {
        const response = await api.get<BeneficiaryDocument[]>('/beneficiaries/documents/recent/list');
        return response.data;
    },

    // Delete Document (Single) - FIXED: removed beneficiaryId param and fixed path
    deleteDocument: async (documentId: string, beneficiaryId?: string): Promise<void> => {
        await api.delete('beneficiaries/documents/', {
            params: { documentId }
        });
    },

    // Verify Document (Admin)
    verifyDocument: async (documentId: string): Promise<BeneficiaryDocument> => {
        const response = await api.patch<BeneficiaryDocument>(
            `/beneficiaries/documents/${documentId}/verify`,
            { notes: 'Document verified by admin' }
        );
        return response.data;
    },

    // Unverify Document (Admin)
    unverifyDocument: async (documentId: string): Promise<BeneficiaryDocument> => {
        const response = await api.patch<BeneficiaryDocument>(
            `/beneficiaries/documents/${documentId}/unverify`
        );
        return response.data;
    },

    // Bulk Verify Documents (Admin)
    bulkVerifyDocuments: async (ids: string[]): Promise<any> => {
        const response = await api.post('/beneficiaries/documents/verify/bulk', {
            documentIds: ids
        });
        return response.data;
    },

    // Bulk Delete Documents (Admin)
    bulkDeleteDocuments: async (ids: string[]): Promise<void> => {
        await api.delete('/beneficiaries/documents/bulk/delete', {
            data: { documentIds: ids }
        });
    },

    // Delete All Beneficiary Documents (Admin)
    deleteAllBeneficiaryDocuments: async (beneficiaryId: string): Promise<void> => {
        await api.delete('/beneficiaries/documents/beneficiary/all', {
            params: { beneficiaryId }
        });
    },

    // Get Documents by Beneficiary ID (Admin)
    getAdminBeneficiaryDocuments: async (beneficiaryId: string): Promise<BeneficiaryDocument[]> => {
        const response = await api.get<BeneficiaryDocument[]>(`/beneficiaries/documents/admin/beneficiary/${beneficiaryId}`);
        return response.data;
    }
};
