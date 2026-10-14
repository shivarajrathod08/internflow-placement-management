import api from './client';
import {
  ApiResponse,
  PlacementDrive,
  CreatePlacementDriveRequest,
  PlacementDriveStatus,
  Offer,
  CreateOfferRequest,
  OfferStatus,
  EligibilityEvaluationResult,
  StudentProfile,
} from '../types';

export const placementDrivesApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<PlacementDrive[]>>('/placement-drives');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<ApiResponse<PlacementDrive>>(`/placement-drives/${id}`);
    return res.data;
  },
  create: async (data: CreatePlacementDriveRequest) => {
    const res = await api.post<ApiResponse<PlacementDrive>>('/placement-drives', data);
    return res.data;
  },
  updateStatus: async (id: number, status: PlacementDriveStatus) => {
    const res = await api.put<ApiResponse<PlacementDrive>>(`/placement-drives/${id}/status`, null, {
      params: { status },
    });
    return res.data;
  },
  getEligibleCandidates: async (id: number) => {
    const res = await api.get<ApiResponse<StudentProfile[]>>(`/placement-drives/${id}/eligible-candidates`);
    return res.data;
  },
};

export const offersApi = {
  create: async (data: CreateOfferRequest) => {
    const res = await api.post<ApiResponse<Offer>>('/offers', data);
    return res.data;
  },
  getMyOffers: async () => {
    const res = await api.get<ApiResponse<Offer[]>>('/offers/my');
    return res.data;
  },
  getCompanyOffers: async (companyId: number) => {
    const res = await api.get<ApiResponse<Offer[]>>(`/offers/company/${companyId}`);
    return res.data;
  },
  getAllOffers: async () => {
    const res = await api.get<ApiResponse<Offer[]>>('/offers');
    return res.data;
  },
  updateStatus: async (id: number, status: OfferStatus, studentRemarks?: string) => {
    const res = await api.put<ApiResponse<Offer>>(`/offers/${id}/status`, { status, studentRemarks });
    return res.data;
  },
};

export const internshipsApi = {
  getEligibility: async (id: number) => {
    const res = await api.get<ApiResponse<EligibilityEvaluationResult>>(`/internships/${id}/eligibility`);
    return res.data;
  },
};

export const studentsApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<StudentProfile[]>>('/students');
    return res.data;
  },
  verifyStudent: async (id: number, verified: boolean) => {
    const res = await api.put<ApiResponse<StudentProfile>>(`/students/${id}/verify`, null, {
      params: { verified },
    });
    return res.data;
  },
};

export const analyticsApi = {
  exportPlacementsCsv: async () => {
    const res = await api.get('/analytics/export/placements.csv', {
      responseType: 'blob',
    });
    return res.data;
  },
};
