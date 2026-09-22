"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import ConfirmDialog from "@/shared/components/molecules/ConfirmDialog";
import FormDialog from "@/shared/components/molecules/FormDialog";
import FormField from "@/shared/components/molecules/FormField";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  settingsService,
  type CreateUserInput,
  type TeamUser,
} from "../../services/settings.service";

const TeamSection = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<TeamUser | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(() => {
    settingsService
      .listUsers()
      .then((data) => {
        setUsers(data);
        setError(null);
      })
      .catch(() => setError(t("dashboard.settings.team.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setFormError(null);
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const input: CreateUserInput = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      password: String(data.get("password") ?? ""),
      phone: String(data.get("phone") ?? "").trim(),
      role: "staff",
    };
    setSubmitting(true);
    setFormError(null);
    settingsService
      .createUser(input)
      .then(() => {
        setDialogOpen(false);
        form.reset();
        load();
      })
      .catch((err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? t("dashboard.settings.team.createError");
        setFormError(message);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = () => {
    if (!deleting) return;
    setDeletePending(true);
    settingsService
      .deleteUser(deleting.id)
      .then(load)
      .catch(() => setError(t("dashboard.settings.team.deleteError")))
      .finally(() => {
        setDeletePending(false);
        setDeleting(null);
      });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#171A21]">
            {t("dashboard.settings.team.title")}
          </h2>
          <p className="mt-1 text-sm text-[#8D95A5]">
            {t("dashboard.settings.team.description")}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="h-10 gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.settings.team.create")}
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
        {loading ? (
          <p className="px-6 py-6 text-sm text-[#8D95A5]">
            {t("dashboard.settings.team.loading")}
          </p>
        ) : users.length === 0 ? (
          <p className="px-6 py-6 text-sm text-[#8D95A5]">
            {t("dashboard.settings.team.empty")}
          </p>
        ) : (
          <div className="divide-y divide-[#DEE1E7]">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <InitialsAvatar
                  name={user.name}
                  src={user.avatarUrl ?? undefined}
                  className="h-10 w-10"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#171A21]">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-[#8D95A5]">
                    {user.email}
                  </p>
                </div>
                <span className="rounded-full bg-[#A17DE8]/10 px-3 py-1 text-xs font-semibold text-[#A17DE8]">
                  {t(`dashboard.settings.team.roles.${user.role}`)}
                </span>
                <button
                  type="button"
                  aria-label={t("dashboard.settings.team.delete")}
                  onClick={() => setDeleting(user)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[#8D95A5] transition-colors hover:bg-[#FDF0F0] hover:text-[#D64545]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setFormError(null);
        }}
        title={t("dashboard.settings.team.createTitle")}
        description={t("dashboard.settings.team.createDescription")}
        error={formError ?? undefined}
        submitLabel={t("dashboard.settings.team.create")}
        submittingLabel={t("dashboard.settings.team.creating")}
        submitting={submitting}
        onSubmit={handleCreate}
        scrollable
      >
        <div className="space-y-4">
          <FormField label={t("dashboard.settings.team.name")} required>
            <Input name="name" required placeholder="Full name" />
          </FormField>
          <FormField label={t("dashboard.settings.team.email")} required>
            <Input name="email" type="email" required placeholder="staff@salon.com" />
          </FormField>
          <FormField label={t("dashboard.settings.team.password")} required>
            <Input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
            />
          </FormField>
          <FormField label={t("dashboard.settings.team.phone")}>
            <Input name="phone" type="tel" placeholder="(555) 123-4567" />
          </FormField>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={t("dashboard.settings.team.deleteTitle")}
        description={t("dashboard.settings.team.deleteDescription", {
          name: deleting?.name ?? "",
        })}
        confirmLabel={t("dashboard.settings.team.delete")}
        cancelLabel={t("dashboard.settings.team.cancel")}
        pendingLabel={t("dashboard.settings.team.deleting")}
        pending={deletePending}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TeamSection;