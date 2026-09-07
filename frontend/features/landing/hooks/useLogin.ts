import { useMutation } from "@tanstack/react-query";

import { authService } from "@/features/landing/services/auth.service";

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      remember,
    }: {
      email: string;
      password: string;
      remember: boolean;
    }) => {
      return authService.login(email, password, remember);
    },
  });
};
