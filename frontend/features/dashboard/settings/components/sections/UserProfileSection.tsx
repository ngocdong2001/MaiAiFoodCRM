"use client";

import { AxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { useAuthStore, type AuthUser } from "@/core/store/authStore";
import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";

const UserProfileSection = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  if (!user) return <p className="text-sm text-[#8D95A5]">{t("dashboard.settings.profile.loading")}</p>;

  return <UserProfileForm key={user.id} user={user} />;
};

const UserProfileForm = ({ user }: { user: AuthUser }) => {
  const { t } = useTranslation();
  const updateProfile = useUpdateProfile();
  const [values, setValues] = useState(() => ({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", avatarUrl: user?.avatarUrl ?? "" }));
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    updateProfile.mutate(values, {
      onSuccess: () => setMessage({ type: "success", text: t("dashboard.settings.profile.saved") }),
      onError: (error) => {
        const duplicate = error instanceof AxiosError && error.response?.data?.message === "Email is already in use";
        setMessage({ type: "error", text: t(duplicate ? "dashboard.settings.profile.emailInUse" : "dashboard.settings.profile.saveError") });
      },
    });
  };

  return (
    <section className="max-w-3xl rounded-xl border border-[#DEE1E7] bg-white p-6 shadow-[0px_1px_2px_0px_#0000000a]">
      <div className="border-b border-[#E7EAF0] pb-5">
        <h2 className="text-lg font-semibold text-[#171A21]">{t("dashboard.settings.profile.title")}</h2>
        <p className="mt-1 text-sm text-[#8D95A5]">{t("dashboard.settings.profile.description")}</p>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <InitialsAvatar name={values.name || user.name} src={values.avatarUrl || undefined} className="h-20 w-20 text-xl" />
          <div className="min-w-0 flex-1 space-y-1.5"><Label htmlFor="profile-avatar">{t("dashboard.settings.profile.avatarUrl")}</Label><Input id="profile-avatar" type="url" value={values.avatarUrl} onChange={(event) => setValues((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder={t("dashboard.settings.profile.avatarPlaceholder")} /><p className="text-xs text-[#8D95A5]">{t("dashboard.settings.profile.avatarHint")}</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="profile-name">{t("dashboard.settings.profile.name")}</Label><Input id="profile-name" value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} required /></div>
          <div className="space-y-1.5"><Label htmlFor="profile-email">{t("dashboard.settings.profile.email")}</Label><Input id="profile-email" type="email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} required /></div>
          <div className="space-y-1.5"><Label htmlFor="profile-phone">{t("dashboard.settings.profile.phone")}</Label><Input id="profile-phone" value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} /></div>
          <div className="space-y-1.5"><Label>{t("dashboard.settings.profile.role")}</Label><Input value={user.role} disabled /></div>
        </div>
        {message && <p role="status" className={message.type === "success" ? "rounded-lg bg-[#E9F8EE] px-3 py-2 text-sm text-[#238049]" : "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"}>{message.text}</p>}
        <div className="flex justify-end"><Button type="submit" disabled={updateProfile.isPending}>{updateProfile.isPending ? t("dashboard.settings.profile.saving") : t("dashboard.settings.profile.save")}</Button></div>
      </form>
    </section>
  );
};

export default UserProfileSection;