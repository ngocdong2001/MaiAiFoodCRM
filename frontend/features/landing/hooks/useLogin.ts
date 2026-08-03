import { useMutation } from "@tanstack/react-query";

import { authService } from "@/features/landing/services/auth.service";

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return authService.login(email, password);
    },
  });
};
