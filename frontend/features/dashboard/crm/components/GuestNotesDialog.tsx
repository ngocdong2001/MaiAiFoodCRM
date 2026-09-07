"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import FormDialog from "@/shared/components/molecules/FormDialog";
import FormSection from "@/shared/components/molecules/FormSection";
import { Textarea } from "@/shared/components/ui/textarea";

type Props = {
  open: boolean;
  initialValue: string;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (content: string) => void;
};

const GuestNotesDialog = (props: Props) =>
  props.open ? <Content key={props.initialValue} {...props} /> : null;

const Content = ({
  open,
  initialValue,
  submitting,
  onOpenChange,
  onSave,
}: Props) => {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialValue);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(content.trim());
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("dashboard.crm.notes.title")}
      description={t("dashboard.crm.notes.description")}
      submitLabel={t("dashboard.crm.notes.saveNotes")}
      submittingLabel={t("dashboard.crm.notes.saving")}
      cancelLabel={t("dashboard.crm.notes.cancel")}
      submitting={submitting}
      submitDisabled={!content.trim()}
      onSubmit={submit}
    >
      <FormSection>
        <Textarea
          rows={7}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </FormSection>
    </FormDialog>
  );
};

export default GuestNotesDialog;
