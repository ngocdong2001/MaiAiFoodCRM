"use client";

import { History, LayoutGrid, ListTree } from "lucide-react";
import { useTranslation } from "react-i18next";

import StatCard from "@/shared/components/molecules/StatCard";
import { Button } from "@/shared/components/ui/button";

type ServiceSummarySectionProps = {
  serviceCount: number;
  categoryCount: number;
  lastUpdatedLabel: string;
  onManageCategories: () => void;
};

const ServiceSummarySection = ({
  serviceCount,
  categoryCount,
  lastUpdatedLabel,
  onManageCategories,
}: ServiceSummarySectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <StatCard
        layout="inline"
        label={t("dashboard.services.summary.totalLabel")}
        value={t("dashboard.services.summary.totalValue", {
          count: serviceCount,
        })}
        icon={<LayoutGrid className="h-5 w-5" />}
        iconWrapperClassName="bg-[#FDE7F0] text-[#E5397F]"
      />

      <StatCard
        layout="inline"
        label={t("dashboard.services.summary.categoryLabel")}
        value={t("dashboard.services.summary.categoryValue", {
          count: categoryCount,
        })}
        icon={<ListTree className="h-5 w-5" />}
        iconWrapperClassName="bg-[#E7F3FE] text-[#2E7BEA]"
        action={
          <Button
            type="button"
            variant="ghost"
            onClick={onManageCategories}
            className="h-8 text-xs text-[#2E7BEA] hover:bg-[#E7F3FE]"
          >
            {t("dashboard.services.summary.manage")}
          </Button>
        }
      />

      <StatCard
        layout="inline"
        label={t("dashboard.services.summary.updatedLabel")}
        value={lastUpdatedLabel}
        icon={<History className="h-5 w-5" />}
        iconWrapperClassName="bg-[#FFF3E0] text-[#E58B1B]"
      />
    </div>
  );
};

export default ServiceSummarySection;
