"use client";

import { Bell, LogOut, Menu, Settings, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { authService } from "@/features/landing/services/auth.service";
import { cn } from "@/shared/lib/utils";
import { dashboardNavItems } from "@/features/dashboard/overview/data/data";
import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import LanguageSwitcher from "@/core/lang/components/LanguageSwitcher";
import { useAuthStore } from "@/core/store/authStore";
import { useSalonStore } from "@/core/store/salonStore";
import { useSalonSettings } from "@/features/dashboard/settings/hooks/useSalonSettings";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import DashboardContainer from "./DashboardContainer";

const isActiveRoute = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

const BRAND_TITLE = "MaiAI Owner Dashboard";

const DashboardHeader = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const salonName = useSalonStore((state) => state.salonName);
  const logoUrl = useSalonStore((state) => state.logoUrl);
  useSalonSettings();

  const userName = user?.name ?? t("dashboard.header.userFallback");
  const role = user?.role;
  const brandTitle = salonName || BRAND_TITLE;
  const navItems = dashboardNavItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role)),
  );

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

  const handleMobileLogout = () => {
    setIsMobileNavOpen(false);
    handleLogout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#DEE1E7] bg-[#F9FAFB]/90 shadow-[0px_2px_4px_0px_#00000012] backdrop-blur">
      <DashboardContainer className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Drawer
            open={isMobileNavOpen}
            onOpenChange={setIsMobileNavOpen}
            swipeDirection="left"
          >
            <DrawerTrigger
              aria-label={t("dashboard.header.openNavigationMenu")}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#DEE1E7] bg-white text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] transition-colors hover:bg-[#F3F4F6] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </DrawerTrigger>
            <DrawerContent
              className="bg-[#F9FAFB]"
              aria-describedby="dashboard-mobile-nav-description"
            >
              <DrawerHeader className="border-b border-[#DEE1E7] px-5 py-4 text-left">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <DrawerTitle className="text-lg font-bold text-primary">
                      {brandTitle}
                    </DrawerTitle>
                    <DrawerDescription
                      id="dashboard-mobile-nav-description"
                      className="text-sm text-[#8D95A5]"
                    >
                      {t("dashboard.header.mobileDescription")}
                    </DrawerDescription>
                  </div>
                  <button
                    type="button"
                    aria-label={t("dashboard.header.closeNavigationMenu")}
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#DEE1E7] bg-white text-[#171A21] transition-colors hover:bg-[#F3F4F6]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </DrawerHeader>

              <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const active = isActiveRoute(pathname, item.href);
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={cn(
                          "rounded-[12px] border px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "border-primary bg-primary text-white shadow-[0px_2px_4px_0px_#00000012]"
                            : "border-[#DEE1E7] bg-white text-[#171A21] hover:border-primary/30 hover:text-primary",
                        )}
                      >
                        {t(`dashboard.nav.${item.key}`)}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto rounded-[16px] border border-[#DEE1E7] bg-white p-4 shadow-[0px_2px_4px_0px_#00000012]">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar
                      name={userName}
                      src={user?.avatarUrl ?? undefined}
                      className="h-10 w-10"
                      online
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#171A21]">
                        {userName}
                      </p>
                      <p className="text-xs text-[#8D95A5]">
                        {user?.email ?? t("dashboard.header.ownerAccount")}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleMobileLogout}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#171A21] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2E37]"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("dashboard.header.logout")}
                  </button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <Link
            href="/dashboard/overview"
            className="flex shrink-0 items-center gap-3"
          >
            <Image
              src={logoUrl}
              alt={brandTitle}
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <span className="hidden font-bold text-primary sm:block text-xl tracking-tight">
              {brandTitle} Dashboard
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-[#DEE1E7] bg-[#FEF1F8] p-1 shadow-[0px_2px_4px_0px_#00000012] lg:flex">
          {navItems.map((item) => {
            const active = isActiveRoute(pathname, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white shadow-[0px_2px_4px_0px_#00000012]"
                    : "text-[#8D95A5] hover:text-primary",
                )}
              >
                {t(`dashboard.nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher className="hidden sm:flex" />
          <button
            type="button"
            aria-label={t("dashboard.header.notifications")}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#8D95A5] transition-colors hover:bg-[#F3F4F6] hover:text-[#1E2128]"
          >
            <Bell className="h-5 w-5" />
          </button>
          {role === "admin" && (
            <button
              type="button"
              aria-label={t("dashboard.header.settings")}
              onClick={() => router.push("/dashboard/integrations")}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#8D95A5] transition-colors hover:bg-[#F3F4F6] hover:text-[#1E2128]"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={t("dashboard.header.accountMenu")}
            >
              <InitialsAvatar
                name={userName}
                src={user?.avatarUrl ?? undefined}
                className="h-9 w-9"
                online
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === "admin" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/integrations")}
                    >
                      <User />
                      {t("dashboard.header.profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/integrations")}
                    >
                      <Settings />
                      {t("dashboard.header.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut />
                  {t("dashboard.header.logout")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DashboardContainer>
    </header>
  );
};

export default DashboardHeader;
