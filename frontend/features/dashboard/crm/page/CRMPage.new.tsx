"use client";

import axios from "axios";
import { UserPlus } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useTranslation } from "react-i18next";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";

import GuestFormDialog from "../components/GuestFormDialog";
import GuestNotesDialog from "../components/GuestNotesDialog";
import CRMGuestProfileSection from "../components/sections/CRMGuestProfileSection";
import CRMGuestsListSection from "../components/sections/CRMGuestsListSection";
import { useCreateGuest, useDeleteGuest, useGuests, useGuestTags, useUpdateGuest, useUpdateGuestNotes } from "../hooks/useCRM";
import type { GuestCard, GuestFormValues, GuestSegment } from "../types/crm.types";

const segments: GuestSegment[] = ["All", "VIP", "Loyal", "At Risk"];
const apiError = (error: unknown) => axios.isAxiosError<{ message?: string }>(error) ? error.response?.data.message ?? "CRM operation failed" : "CRM operation failed";

const CRMPage = () => {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<GuestSegment>("All");
  const [query, setQuery] = useState("");
  const [selectedGuestKey, setSelectedGuestKey] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestCard | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<GuestCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim());

  const guestsQuery = useGuests({ search: deferredQuery || undefined, segment: segment === "All" ? undefined : segment });
  const tagsQuery = useGuestTags();
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const updateNotes = useUpdateGuestNotes();
  const deleteGuest = useDeleteGuest();
  const guests = guestsQuery.data ?? [];
  const selectedGuest = guests.find((guest) => guest.key === selectedGuestKey) ?? guests[0];

  const submit = async (values: GuestFormValues) => {
    setError(null);
    try {
      if (editingGuest) await updateGuest.mutateAsync({ id: editingGuest.id, values });
      else await createGuest.mutateAsync(values);
      setFormOpen(false);
    } catch (caught) { setError(apiError(caught)); }
  };

  const saveNotes = async (content: string) => {
    if (!selectedGuest) return;
    try { await updateNotes.mutateAsync({ id: selectedGuest.id, content }); setNotesOpen(false); }
    catch (caught) { setError(apiError(caught)); }
  };

  const confirmDelete = async () => {
    if (!deletingGuest) return;
    try { await deleteGuest.mutateAsync(deletingGuest.id); setDeletingGuest(null); setSelectedGuestKey(""); }
    catch (caught) { setError(apiError(caught)); }
  };

  const totalGuests = guests.length;
  const vipGuests = guests.filter((guest) => guest.segment === "VIP").length;
  const atRiskGuests = guests.filter((guest) => guest.segment === "At Risk").length;

  return <section className="overflow-hidden rounded-xl border border-[#DEE1E7] bg-white shadow-[0px_1px_2px_0px_#0000000a]">
    <div className="border-b border-[#EEF1F5] px-4 py-3 sm:px-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-lg font-semibold">{t("dashboard.crm.title")}</h1><p className="text-xs text-[#8D95A5]">{t("dashboard.crm.subtitle")}</p></div><Button className="h-8" onClick={() => { setEditingGuest(null); setError(null); setFormOpen(true); }}><UserPlus className="mr-1 h-3.5 w-3.5" />{t("dashboard.crm.addGuest")}</Button></div>
      <div className="mt-3 flex flex-wrap gap-2"><Stat text={t("dashboard.crm.totalGuests", { count: totalGuests })} /><Stat text={t("dashboard.crm.vip", { count: vipGuests })} /><Stat text={t("dashboard.crm.atRisk", { count: atRiskGuests })} /></div>
    </div>

    {guestsQuery.isPending ? <div className="h-120 animate-pulse bg-[#F8FAFC]" /> : guestsQuery.isError ? <div className="p-8 text-center text-sm text-destructive"><p>Could not load guests from the database.</p><Button variant="outline" className="mt-3" onClick={() => guestsQuery.refetch()}>Try again</Button></div> : <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
      <CRMGuestsListSection guests={guests} selectedGuestKey={selectedGuest?.key ?? ""} onSelectGuest={setSelectedGuestKey} query={query} onQueryChange={setQuery} segment={segment} segments={segments} onSegmentChange={setSegment} />
      {selectedGuest ? <CRMGuestProfileSection guest={selectedGuest} onEdit={() => { setEditingGuest(selectedGuest); setError(null); setFormOpen(true); }} onEditNotes={() => setNotesOpen(true)} onDelete={() => setDeletingGuest(selectedGuest)} /> : <div className="p-8 text-center text-sm text-[#8D95A5]">{t("dashboard.crm.emptyState")}</div>}
    </div>}

    <GuestFormDialog open={formOpen} guest={editingGuest} tags={tagsQuery.data ?? []} submitting={createGuest.isPending || updateGuest.isPending} error={error} onOpenChange={setFormOpen} onSubmit={submit} />
    <GuestNotesDialog open={notesOpen} initialValue={selectedGuest?.notes ?? ""} submitting={updateNotes.isPending} onOpenChange={setNotesOpen} onSave={saveNotes} />
    <AlertDialog open={Boolean(deletingGuest)} onOpenChange={(open) => !open && setDeletingGuest(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete guest?</AlertDialogTitle><AlertDialogDescription>{deletingGuest?.name} will be removed. Guests with booking history are archived to preserve records.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white" disabled={deleteGuest.isPending} onClick={confirmDelete}>{deleteGuest.isPending ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
};

const Stat = ({ text }: { text: string }) => <span className="rounded-md border border-[#E7EBF2] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#566074]">{text}</span>;
export default CRMPage;