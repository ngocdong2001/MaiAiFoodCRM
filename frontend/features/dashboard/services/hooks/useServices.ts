import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { serviceCatalogService } from "../services/service.service";
import type {
  ServiceBulkPayload,
  ServiceCategoryFormValues,
} from "../types/service.types";

const serviceKeys = {
  all: ["services"] as const,
  list: ["services", "list"] as const,
  categories: ["services", "categories"] as const,
};

export const useServiceList = () =>
  useQuery({
    queryKey: serviceKeys.list,
    queryFn: serviceCatalogService.getServices,
    // The table holds unsaved edits, so background refetches must not wipe them.
    refetchOnWindowFocus: false,
  });

export const useServiceCategories = () =>
  useQuery({
    queryKey: serviceKeys.categories,
    queryFn: serviceCatalogService.getCategories,
    refetchOnWindowFocus: false,
  });

export const useBulkSaveServices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServiceBulkPayload) =>
      serviceCatalogService.bulkSave(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
};

export const useToggleServiceActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      serviceCatalogService.setActive(id, isActive),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
};

export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ServiceCategoryFormValues) =>
      serviceCatalogService.createCategory(values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
};

export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: number;
      values: ServiceCategoryFormValues;
    }) => serviceCatalogService.updateCategory(id, values),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
};

export const useDeleteServiceCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => serviceCatalogService.deleteCategory(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
};
