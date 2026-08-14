import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { staffService, type StaffListParams } from "../services/staff.service";
import type { StaffFormValues } from "../types/staff.types";

const staffKeys = {
  all: ["staff"] as const,
  list: (params: StaffListParams) => ["staff", "list", params] as const,
  specialties: ["staff", "specialties"] as const,
};

export const useStaffList = (params: StaffListParams) =>
  useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => staffService.getAll(params),
    placeholderData: keepPreviousData,
  });

export const useStaffSpecialties = () =>
  useQuery({
    queryKey: staffKeys.specialties,
    queryFn: staffService.getSpecialties,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: StaffFormValues }) =>
      staffService.update(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.all }),
  });
};
