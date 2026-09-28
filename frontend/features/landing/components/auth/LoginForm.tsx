"use client";

import axios from "axios";
import {
  AlertCircle,
  ChevronRight,
  CircleCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import loginIllustration from "@/assets/images/login_illustration.webp";
import { useLogin } from "@/features/landing/hooks/useLogin";
import { useSalonStore, DEFAULT_SALON_LOGO } from "@/core/store/salonStore";
import { useAuthStore } from "@/core/store/authStore";
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
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import { Spinner } from "@/shared/components/ui/spinner";

const LoginForm = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const loginMutation = useLogin();
  const salonName = useSalonStore((s) => s.salonName);
  const logoUrl = useSalonStore((s) => s.logoUrl);
  const tenantName = useAuthStore((s) => s.tenant?.name);
  // Priority: salon settings name > cached tenant name > generic brand fallback
  const displayName = salonName || tenantName || t("auth.login.brand");

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
      await loginMutation.mutateAsync({
        email,
        password,
        remember: rememberMe,
      });
      router.replace("/dashboard/overview");
    } catch (err) {
      setErrorMessage(getLoginErrorMessage(err));
      setIsErrorOpen(true);
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-[#f6f7f9] px-4 py-8 lg:h-screen lg:items-stretch lg:justify-normal lg:overflow-hidden lg:px-0 lg:py-0">
        {/* Left panel — form */}
        <div className="relative z-[1] flex w-full flex-col justify-center rounded-2xl bg-white p-6 shadow-[0_8px_24px_0_#00000014] sm:p-10 lg:w-1/2 lg:rounded-none lg:bg-[#f6f7f9] lg:p-0 lg:px-[159px] lg:py-12 lg:shadow-[0_25px_50px_0_#00000040]">
          <div className="mx-auto w-full max-w-[440px]">
            {/* Brand */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm sm:h-10 sm:w-10">
                <Image
                  src={logoUrl || DEFAULT_SALON_LOGO}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-bold leading-[26px] text-primary sm:text-[26px]">
                {displayName} Dashboard
              </span>
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-center text-2xl font-bold leading-tight tracking-[-1px] text-[#1d1f23] sm:mt-8 sm:text-[32px] sm:leading-10">
              {t("auth.login.welcome")}
            </h1>
            <p className="mt-2 text-center text-sm leading-[22px] text-[#9da1a7]">
              {t("auth.login.subtitle")}
            </p>

            <form
              className="mt-6 space-y-5 sm:mt-8 sm:space-y-6"
              onSubmit={handleSubmit}
            >
              {/* Username */}
              <div className="space-y-[11px]">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-[22px] text-[#1d1f23]"
                >
                  {t("auth.login.email")}
                </label>
                <InputGroup className="h-auto gap-1.5 rounded-[10px] border-[#dfe1e4] bg-[#f6f7f9] px-3 py-2">
                  <InputGroupAddon align="inline-start">
                    <Mail className="h-5 w-5 shrink-0 text-[#9da1a7]" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="email"
                    placeholder={t("auth.login.emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-auto text-sm leading-[22px] text-[#1d1f23] placeholder:text-[#9da1a7]"
                    required
                  />
                </InputGroup>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-[14px] text-[#1d1f23]"
                  >
                    {t("auth.login.password")}
                  </label>
                </div>
                <InputGroup className="mt-[11px] h-auto gap-1.5 rounded-[10px] border-[#dfe1e4] bg-[#f6f7f9] px-3 py-2">
                  <InputGroupAddon align="inline-start">
                    <Lock className="h-5 w-5 shrink-0 text-[#9da1a7]" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-auto text-sm leading-[22px] text-[#1d1f23] placeholder:text-[#9da1a7]"
                    required
                  />
                  <InputGroupButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="h-5 w-5 shrink-0 p-0 text-[#9da1a7] hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </InputGroupButton>
                </InputGroup>
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  aria-label={t("auth.login.rememberMe")}
                />
                <span className="text-sm font-medium leading-[22px] text-[#9da1a7]">
                  {t("auth.login.rememberMe")}
                </span>
              </label>

              <Button
                type="submit"
                className="h-12 w-full rounded-[10px] bg-primary px-4 text-base font-semibold leading-[26px] text-[#f6f7f9] shadow-[0_4px_8px_0_#00000014] hover:bg-primary/80"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="size-4" />
                    {t("auth.login.signingIn")}
                  </span>
                ) : (
                  t("auth.login.submit")
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right panel — illustration */}
        <div className="relative hidden w-1/2 overflow-hidden bg-[#f6f7f9] lg:flex lg:flex-col lg:justify-center lg:px-[105px]">
          <div className="pointer-events-none absolute right-24 top-[-85px] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="pointer-events-none absolute -left-20 top-[528px] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[80px]" />

          <div className="relative mx-auto w-full max-w-[585px]">
            <div className="relative mx-auto aspect-[585/437] max-h-[42vh] w-full overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#f6f7f900_0%,#f6f7f933_100%)]" />
              <Image
                src={loginIllustration}
                alt={t("auth.login.infoTitle")}
                fill
                sizes="(max-width: 1024px) 100vw, 585px"
                className="object-cover"
              />
            </div>

            <h2 className="mt-6 text-center text-[30px] font-bold leading-9 text-[#1d1f23]">
              {t("auth.login.infoTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-[503px] text-center text-lg leading-[29px] text-[#9da1a7]">
              {t("auth.login.infoDescription")}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-[24px]">
              <div className="flex h-[46px] items-center gap-3 rounded-xl border border-[#dfe1e4] bg-[#f6f7f9] px-3 shadow-[0_2px_4px_0_#00000012]">
                <CircleCheck className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-xs font-semibold leading-[15px] text-[#1d1f23]">
                  {t("auth.login.featureBooking")}
                </span>
              </div>
              <div className="flex h-[46px] items-center gap-3 rounded-xl border border-[#dfe1e4] bg-[#f6f7f9] px-3 shadow-[0_2px_4px_0_#00000012]">
                <CircleCheck className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-xs font-semibold leading-[15px] text-[#1d1f23]">
                  {t("auth.login.featureRevenue")}
                </span>
              </div>
            </div>

            <button className="mx-auto mt-6 flex items-center gap-2 text-base font-semibold leading-[26px] text-primary">
              {t("auth.login.exploreFeatures")}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
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
