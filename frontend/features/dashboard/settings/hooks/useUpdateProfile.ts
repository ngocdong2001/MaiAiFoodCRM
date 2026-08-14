import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/core/store/authStore";
import { profileService } from "../services/profile.service";

export const useUpdateProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({ mutationFn: profileService.update, onSuccess: setUser });
};