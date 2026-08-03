"use client";

import axios from "axios";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { useLogin } from "@/features/landing/hooks/useLogin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const LoginForm = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const loginMutation = useLogin();

  const getLoginErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 401) {
        return t("auth.login.invalidCredentials");
      }

      if (status && status >= 500) {
        return t("auth.login.serverError");
      }

      if (error.request) {
        return t("auth.login.networkError");
      }
    }

    return t("auth.login.unexpectedError");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsErrorOpen(false);
    setErrorMessage("");

    try {
      await loginMutation.mutateAsync({ email, password });
      router.replace("/dashboard");
    } catch (err) {
      setErrorMessage(getLoginErrorMessage(err));
      setIsErrorOpen(true);
    }
  };

  return (
    <>
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            {t("auth.login.title")}
          </h1>
          <p className="text-sm text-slate-600">{t("auth.login.subtitle")}</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              {t("auth.login.email")}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("auth.login.emailPlaceholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-lg border-slate-200 px-3"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              {t("auth.login.password")}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={t("auth.login.passwordPlaceholder")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-lg border-slate-200 px-3"
              required
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending
              ? t("auth.login.signingIn")
              : t("auth.login.submit")}
          </Button>
        </form>
      </div>

      <AlertDialog open={isErrorOpen} onOpenChange={setIsErrorOpen}>
        <AlertDialogContent className="max-w-sm gap-3 p-5">
          <AlertDialogHeader className="gap-2 text-left sm:place-items-start sm:text-left">
            <AlertDialogMedia className="mb-0 bg-red-50 text-red-600">
              <AlertCircle />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-base text-slate-900">
              {t("auth.login.errorTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-slate-600">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-0 -mb-0 border-0 bg-transparent p-0 sm:grid-cols-1 sm:justify-end">
            <AlertDialogAction
              onClick={() => setIsErrorOpen(false)}
              className="min-w-24 bg-red-600 text-white hover:bg-red-700"
            >
              {t("auth.login.errorAcknowledge")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LoginForm;
