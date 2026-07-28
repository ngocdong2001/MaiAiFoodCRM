"use client";

import { Activity, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";
import { dashboardNavItems } from "@/features/dashboard/overview/data/data";
import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";

import DashboardContainer from "./DashboardContainer";

const isActiveRoute = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
};

const DashboardHeader = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#DEE1E7] bg-[#F9FAFB]/90 shadow-[0px_2px_4px_0px_#00000012] backdrop-blur">
      <DashboardContainer className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F04CAC]">
            <Activity className="h-5 w-5 text-white" />
          </span>
          <span className="hidden font-bold text-[#F04CAC] sm:block text-xl tracking-tight">
            MaiAI Owner Dashboard
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[#DEE1E7] bg-[#FEF1F8] p-1 shadow-[0px_2px_4px_0px_#00000012] lg:flex">
          {dashboardNavItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#F04CAC] text-white shadow-[0px_2px_4px_0px_#00000012]"
                    : "text-[#8D95A5] hover:text-[#F04CAC]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="hidden h-10 items-center rounded-[10px] bg-[#F3F4F6] px-4 text-sm font-medium text-[#1E2128] shadow-[0px_4px_8px_0px_#00000014,0px_1px_2px_0px_#0000000a] transition-colors hover:bg-[#E9EAED] sm:inline-flex"
          >
            Claim Early Access
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#8D95A5] transition-colors hover:bg-[#F3F4F6] hover:text-[#1E2128]"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#8D95A5] transition-colors hover:bg-[#F3F4F6] hover:text-[#1E2128]"
          >
            <Settings className="h-5 w-5" />
          </button>
          <InitialsAvatar name="Sarah Lee" className="h-9 w-9" online />
        </div>
      </DashboardContainer>
    </header>
  );
};

export default DashboardHeader;
