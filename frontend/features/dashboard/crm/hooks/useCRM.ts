import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { crmService } from "../services/crm.service";
import type { GuestFormValues } from "../types/crm.types";

const crmKeys = { all: ["crm"] as const, tags: ["crm", "tags"] as const };

export const useGuests = (params: { search?: string; segment?: string }) =>
  useQuery({ queryKey: ["crm", "guests", params], queryFn: () => crmService.getGuests(params) });

export const useGuestTags = () =>
  useQuery({ queryKey: crmKeys.tags, queryFn: crmService.getTags, staleTime: 300_000 });

const useCRMAction = <Variables,>(mutationFn: (variables: Variables) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: crmKeys.all }) });
};

export const useCreateGuest = () => useCRMAction(crmService.create);
export const useUpdateGuest = () => useCRMAction(({ id, values }: { id: number; values: GuestFormValues }) => crmService.update(id, values));
export const useUpdateGuestNotes = () => useCRMAction(({ id, content }: { id: number; content: string }) => crmService.updateNotes(id, content));
export const useDeleteGuest = () => useCRMAction(crmService.delete);