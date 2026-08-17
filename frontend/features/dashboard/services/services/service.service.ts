import { apiClient } from "@/core/config/axios.config";

import type {
  ServiceBulkPayload,
  ServiceCategory,
  ServiceCategoryFormValues,
  ServiceItem,
} from "../types/service.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

const categoryPayload = (values: ServiceCategoryFormValues) => ({
  name: values.name.trim(),
  description: values.description.trim() || null,
  icon: values.icon.trim() || null,
  sortOrder: values.sortOrder,
  isActive: values.isActive,
});

export const serviceCatalogService = {
  async getServices() {
    const response =
      await apiClient.get<ApiResponse<ServiceItem[]>>("/services");
    return response.data.data;
  },

  async getCategories() {
    const response = await apiClient.get<ApiResponse<ServiceCategory[]>>(
      "/services/categories",
    );
    return response.data.data;
  },

  async bulkSave(payload: ServiceBulkPayload) {
    const response = await apiClient.put<ApiResponse<ServiceItem[]>>(
      "/services/bulk",
      payload,
    );
    return response.data.data;
  },

  async setActive(id: number, isActive: boolean) {
    const response = await apiClient.patch<ApiResponse<ServiceItem>>(
      `/services/${id}/active`,
      { isActive },
    );
    return response.data.data;
  },

  async deleteService(id: number) {
    await apiClient.delete(`/services/${id}`);
  },

  async createCategory(values: ServiceCategoryFormValues) {
    const response = await apiClient.post<ApiResponse<ServiceCategory>>(
      "/services/categories",
      categoryPayload(values),
    );
    return response.data.data;
  },

  async updateCategory(id: number, values: ServiceCategoryFormValues) {
    const response = await apiClient.put<ApiResponse<ServiceCategory>>(
      `/services/categories/${id}`,
      categoryPayload(values),
    );
    return response.data.data;
  },

  async deleteCategory(id: number) {
    await apiClient.delete(`/services/categories/${id}`);
  },
};
