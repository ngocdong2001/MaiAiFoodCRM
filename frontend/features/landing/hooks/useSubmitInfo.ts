"use client";

import { useMutation, UseMutationResult } from "@tanstack/react-query";

import {
  InfoFormData,
  infoService,
  SubmitInfoResponse,
} from "@/features/landing/services/info.service";

type UseSubmitInfoOptions = {
  onSuccess?: (data: SubmitInfoResponse) => void;
  onError?: (error: Error) => void;
};

/**
 * Feature hook for submitting landing form data.
 */
export const useSubmitInfo = (
  options?: UseSubmitInfoOptions,
): UseMutationResult<SubmitInfoResponse, Error, InfoFormData> => {
  return useMutation({
    mutationKey: ["submitInfo"],
    mutationFn: (data: InfoFormData) => infoService.submitInfo(data),
    onSuccess: (data) => {
      console.log("✅ Info submitted successfully:", data);
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error("❌ Failed to submit info:", error);
      options?.onError?.(error);
    },
  });
};
