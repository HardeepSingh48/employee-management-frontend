import api from './api';

export interface Site {
  site_id: string;
  site_name: string;
  location: string;
  state: string;
  is_active: boolean;
  created_date: string;
  created_by: string;
  updated_date: string;
  updated_by: string;
}

export interface SitesResponse {
  data: Site[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface CreateSiteData {
  site_name: string;
  location?: string;
  state: string;
}

export interface BulkImportResponse {
  created: number;
  errors: string[];
}

export const sitesService = {
  // Get all sites with pagination and search
  getSites: async (page: number = 1, perPage: number = 10, search: string = ''): Promise<SitesResponse> => {
    const response = await api.get('/sites', {
      params: {
        page,
        per_page: perPage,
        search
      }
    });
    return response.data;
  },

  // Create new site
  createSite: async (siteData: CreateSiteData): Promise<Site> => {
    const response = await api.post('/sites', siteData);
    return response.data.data;
  },

  // Update site by ID
  updateSite: async (siteId: string, siteData: Partial<CreateSiteData>): Promise<Site> => {
    const response = await api.put(`/sites/${siteId}`, siteData);
    return response.data.data;
  },

  // Delete site by ID
  deleteSite: async (siteId: string): Promise<void> => {
    await api.delete(`/sites/${siteId}`);
  },

  // Bulk import sites
bulkImportSites: async (file: File): Promise<BulkImportResponse> => {
  console.log('bulkImportSites: file:', file);

  const formData = new FormData();
  formData.append('file', file);

  console.log('bulkImportSites: formData:', formData.getAll('file'));

  try {
    const response = await api.post('/sites/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('bulkImportSites: response:', response);

    return response.data;
  } catch (error) {
    console.error('bulkImportSites: error:', error);
    throw error;
  }
}
};