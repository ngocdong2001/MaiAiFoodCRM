import axios from "axios";

/** Pulls the API's `message` out of an axios error, falling back to a caller-supplied label. */
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
};
