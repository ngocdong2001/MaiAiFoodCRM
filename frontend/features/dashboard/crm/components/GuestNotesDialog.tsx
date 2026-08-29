"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";

type Props = { open: boolean; initialValue: string; submitting: boolean; onOpenChange: (open: boolean) => void; onSave: (content: string) => void };

const GuestNotesDialog = (props: Props) => props.open ? <Content key={props.initialValue} {...props} /> : null;
const Content = ({ open, initialValue, submitting, onOpenChange, onSave }: Props) => {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialValue);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{t("dashboard.crm.notes.title")}</DialogTitle><DialogDescription>{t("dashboard.crm.notes.description")}</DialogDescription></DialogHeader><Textarea rows={7} value={content} onChange={(event) => setContent(event.target.value)} /><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>{t("dashboard.crm.notes.cancel")}</Button><Button disabled={!content.trim() || submitting} onClick={() => onSave(content.trim())}>{submitting ? t("dashboard.crm.notes.saving") : t("dashboard.crm.notes.saveNotes")}</Button></DialogFooter></DialogContent></Dialog>;
};
export default GuestNotesDialog;