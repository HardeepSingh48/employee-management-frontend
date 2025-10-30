import api from '@/lib/api';

export interface IDCardEmployee {
  id?: number | string;
  employee_id: string;
  name: string;
  designation: string;
  blood_group: string | null;
  site?: string;
}

export interface PreviewSingleResponse {
  success: boolean;
  data?: IDCardEmployee;
  message?: string;
}

export interface PreviewBulkResponse {
  success: boolean;
  data?: {
    count: number;
    employees: IDCardEmployee[];
  };
  message?: string;
}

export const IdCardService = {
  async previewSingle(employeeId: string) {
    const res = await api.get<PreviewSingleResponse>(`/id-cards/preview/${employeeId}`);
    return res.data;
  },

  async previewBulk(params: { site_id?: string; employee_ids?: string[] }) {
    const search = new URLSearchParams();
    if (params.site_id && params.site_id.trim() !== '') search.append('site_id', params.site_id);
    if (params.employee_ids && params.employee_ids.length) {
      for (const id of params.employee_ids) search.append('employee_ids[]', id);
    }
    const res = await api.get<PreviewBulkResponse>(`/id-cards/preview/bulk?${search.toString()}`);
    return res.data;
  },

  async generateIndividual(employeeId: string) {
    const res = await api.post(`/id-cards/generate/individual`, { employee_id: employeeId }, { responseType: 'blob' });
    return res.data as Blob;
  },

  async generateBulk(payload: { mode: 'all' | 'site' | 'custom'; site_id?: string; employee_ids?: string[] }) {
    const res = await api.post(`/id-cards/generate/bulk`, payload, { responseType: 'blob' });
    return res.data as Blob;
  },
};

export default IdCardService;


