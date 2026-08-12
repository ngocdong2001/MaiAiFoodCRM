import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { calendarService } from "../services/calendar.service";

const keys = {
  all: ["calendar"] as const,
  options: ["calendar", "options"] as const,
};

export const useCalendarOptions = () =>
  useQuery({
    queryKey: keys.options,
    queryFn: calendarService.getOptions,
    staleTime: 300_000,
  });
export const useAppointments = (params: {
  startDate: string;
  endDate: string;
  staffIds?: string;
}) =>
  useQuery({
    queryKey: ["calendar", "appointments", params],
    queryFn: () => calendarService.getAppointments(params),
    placeholderData: keepPreviousData,
  });

const useAction = <Variables>(
  mutationFn: (variables: Variables) => Promise<unknown>,
) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all }),
  });
};

export const useCreateAppointment = () => useAction(calendarService.create);
export const useUpdateAppointment = () =>
  useAction(
    ({
      id,
      input,
    }: {
      id: number;
      input: Parameters<typeof calendarService.update>[1];
    }) => calendarService.update(id, input),
  );
export const useUpdateAppointmentStatus = () =>
  useAction(
    ({
      id,
      status,
      cancelReason,
    }: {
      id: number;
      status: string;
      cancelReason?: string;
    }) => calendarService.updateStatus(id, status, cancelReason),
  );
export const useDeleteAppointment = () => useAction(calendarService.delete);
