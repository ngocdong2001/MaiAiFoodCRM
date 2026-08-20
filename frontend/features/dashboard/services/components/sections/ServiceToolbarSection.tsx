"use client";

import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

import PageHeader from "@/shared/components/molecules/PageHeader";
import SearchInput from "@/shared/components/molecules/SearchInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import type {
  ServiceCategory,
  ServiceStatusFilter,
} from "../../types/service.types";

type ServiceToolbarSectionProps = {
  query: string;
  onQueryChange: (value: string) => void;
  categories: ServiceCategory[];
  categoryFilter: "all" | number;
  onCategoryFilterChange: (value: "all" | number) => void;
  statusFilter: ServiceStatusFilter;
  onStatusFilterChange: (value: ServiceStatusFilter) => void;
};

const statusLabels: Record<ServiceStatusFilter, string> = {
  all: "dashboard.services.statusAll",
  active: "dashboard.services.statusActive",
  inactive: "dashboard.services.statusInactive",
};

const ServiceToolbarSection = ({
  query,
  onQueryChange,
  categories,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
}: ServiceToolbarSectionProps) => {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t("dashboard.services.title")}
      subtitle={t("dashboard.services.subtitle")}
      actions={
        <>
          <SearchInput
            value={query}
            onValueChange={onQueryChange}
            placeholder={t("dashboard.services.searchPlaceholder")}
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={t("dashboard.services.filterLabel")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#DEE1E7] bg-white"
            >
              <Filter className="h-4 w-4 text-[#8D95A5]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {t("dashboard.services.categoryGroup")}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={String(categoryFilter)}
                onValueChange={(value) =>
                  onCategoryFilterChange(
                    value === "all" ? "all" : Number(value),
                  )
                }
              >
                <DropdownMenuRadioItem value="all">
                  {t("dashboard.services.allCategories")}
                </DropdownMenuRadioItem>
                {categories.map((category) => (
                  <DropdownMenuRadioItem
                    key={category.id}
                    value={String(category.id)}
                  >
                    {category.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>
                {t("dashboard.services.statusGroup")}
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(value) =>
                  onStatusFilterChange(value as ServiceStatusFilter)
                }
              >
                {(Object.keys(statusLabels) as ServiceStatusFilter[]).map(
                  (status) => (
                    <DropdownMenuRadioItem key={status} value={status}>
                      {t(statusLabels[status])}
                    </DropdownMenuRadioItem>
                  ),
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
};

export default ServiceToolbarSection;
