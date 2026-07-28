"use client";

import { Sparkles, CheckCircle2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";

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
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

import EarlyAccessDialogForm from "./EarlyAccessDialogForm";

type EarlyAccessDialogProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
};

const PERKS = [
  "hero.form.perk1",
  "hero.form.perk2",
  "hero.form.perk3",
] as const;

const EarlyAccessDialog = ({ open, onOpenChange }: EarlyAccessDialogProps) => {
  const { t } = useTranslation();
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);

  const handleFormSuccess = () => {
    onOpenChange(false);
    setIsThankYouOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="p-0! sm:max-w-2xl overflow-hidden"
          showCloseButton
        >
          <div className="grid sm:grid-cols-[1fr_1.6fr]">
            {/* Left panel */}
            <div className="relative hidden sm:flex flex-col justify-between bg-primary px-6 py-8 text-primary-foreground overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("hero.form.badge")}
                </div>
                <h2 className="text-xl font-semibold leading-snug">
                  {t("hero.form.title")}
                </h2>
                <p className="text-sm text-primary-foreground/75">
                  {t("hero.form.subtitle")}
                </p>
              </div>

              <ul className="relative z-10 mt-6 space-y-2.5">
                {PERKS.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
                    <span className="text-primary-foreground/85">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right panel – form */}
            <div className="flex flex-col gap-5 px-5 py-7 sm:px-7">
              {/* Mobile header */}
              <div className="sm:hidden space-y-1">
                <div className="inline-flex items-center gap-1.5 text-primary text-xs font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("hero.form.badge")}
                </div>
                <h2 className="text-lg font-semibold">
                  {t("hero.form.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("hero.form.subtitle")}
                </p>
              </div>

              {/* Desktop header */}
              <div className="hidden sm:block space-y-0.5">
                <h3 className="text-base font-semibold">
                  {t("hero.form.formHeading")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("hero.form.formSubheading")}
                </p>
              </div>

              <EarlyAccessDialogForm onSuccess={handleFormSuccess} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isThankYouOpen} onOpenChange={setIsThankYouOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-primary/10 text-primary">
              <Sparkles />
            </AlertDialogMedia>
            <AlertDialogTitle>{t("hero.form.thankYouTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("hero.form.thankYouDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsThankYouOpen(false)}>
              {t("hero.form.thankYouClose")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EarlyAccessDialog;
