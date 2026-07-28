import { apiClient } from "@/core/config/axios.config";

export type InfoFormData = {
  firstName: string;
  lastName: string;
  email: string;
  salonName: string;
};

export type SubmitInfoResponse = {
  success: boolean;
  message: string;
  data?: InfoFormData;
};

export const infoService = {
  /**
   * Submit user information to be saved in JSON file
   */
  submitInfo: async (data: InfoFormData): Promise<SubmitInfoResponse> => {
    const response = await apiClient.post<SubmitInfoResponse>("/info", data);
    return response.data;
  },

  /**
   * Get all submitted information (optional - for future use)
   */
  getAllInfo: async (): Promise<InfoFormData[]> => {
    const response = await apiClient.get<InfoFormData[]>("/info");
    return response.data;
  },
};
