"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

import type { GuestCard, GuestFormValues, GuestTag } from "../types/crm.types";

type Props = {
  open: boolean;
  guest: GuestCard | null;
  tags: GuestTag[];
  submitting: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GuestFormValues) => void;
};

const initialValues = (guest: GuestCard | null): GuestFormValues => ({
  name: guest?.name ?? "",
  email: guest?.email ?? "",
  phone: guest?.phone ?? "",
  avatarUrl: guest?.avatarUrl ?? "",
  gender: guest?.gender ?? "",
  dateOfBirth: guest?.dateOfBirth ?? "",
  loyaltyPoints: guest?.loyaltyPoints.toString() ?? "0",
  notes: guest?.notes ?? "",
  tagIds: guest?.tags.map((tag) => tag.id) ?? [],
});

const GuestFormDialog = (props: Props) => {
  if (!props.open) return null;
  return <GuestFormContent key={props.guest?.id ?? "new"} {...props} />;
};

const GuestFormContent = ({ open, guest, tags, submitting, error, onOpenChange, onSubmit }: Props) => {
  const [values, setValues] = useState(() => initialValues(guest));
  const update = <Key extends keyof GuestFormValues>(key: Key, value: GuestFormValues[Key]) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit(values); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{guest ? "Edit guest" : "Add guest"}</DialogTitle>
          <DialogDescription>Manage contact details, loyalty, tags, and owner notes.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input value={values.name} onChange={(event) => update("name", event.target.value)} required /></Field>
            <Field label="Phone"><Input value={values.phone} onChange={(event) => update("phone", event.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={values.email} onChange={(event) => update("email", event.target.value)} /></Field>
            <Field label="Birthday"><Input type="date" value={values.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} /></Field>
            <Field label="Gender"><Input value={values.gender} onChange={(event) => update("gender", event.target.value)} /></Field>
            <Field label="Loyalty points"><Input type="number" min="0" value={values.loyaltyPoints} onChange={(event) => update("loyaltyPoints", event.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Avatar URL"><Input type="url" value={values.avatarUrl} onChange={(event) => update("avatarUrl", event.target.value)} /></Field></div>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Guest tags</legend>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const checked = values.tagIds.includes(tag.id);
                return <label key={tag.id} className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${checked ? "border-primary bg-primary/10 text-primary" : "border-[#DEE1E7]"}`}><input type="checkbox" className="sr-only" checked={checked} onChange={() => update("tagIds", checked ? values.tagIds.filter((id) => id !== tag.id) : [...values.tagIds, tag.id])} />{tag.name}</label>;
              })}
            </div>
          </fieldset>
          <Field label="Owner notes"><Textarea value={values.notes} onChange={(event) => update("notes", event.target.value)} rows={4} /></Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="mx-0 mb-0 px-0 pb-0"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save guest"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;

export default GuestFormDialog;