"use client";

import { Activity, Bell, LogOut, Menu, Settings, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { authService } from "@/features/landing/services/auth.service";
import { cn } from "@/shared/lib/utils";
import { dashboardNavItems } from "@/features/dashboard/overview/data/data";
import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
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

const DashboardHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
              aria-label="Open navigation menu"
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
                      MaiAI Owner Dashboard
                    </DrawerTitle>
                    <DrawerDescription
                      id="dashboard-mobile-nav-description"
                      className="text-sm text-[#8D95A5]"
                    >
                      Quick navigation and account actions.
                    </DrawerDescription>
                  </div>
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#DEE1E7] bg-white text-[#171A21] transition-colors hover:bg-[#F3F4F6]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </DrawerHeader>

              <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
                <nav className="flex flex-col gap-2">
                  {dashboardNavItems.map((item) => {
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
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto rounded-[16px] border border-[#DEE1E7] bg-white p-4 shadow-[0px_2px_4px_0px_#00000012]">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar
                      name="Sarah Lee"
                      className="h-10 w-10"
                      online
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#171A21]">
                        Sarah Lee
                      </p>
                      <p className="text-xs text-[#8D95A5]">Owner account</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleMobileLogout}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#171A21] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2E37]"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Activity className="h-5 w-5 text-white" />
            </span>
            <span className="hidden font-bold text-primary sm:block text-xl tracking-tight">
              MaiAI Owner Dashboard
            </span>
          </Link>
        </div>

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
                    ? "bg-primary text-white shadow-[0px_2px_4px_0px_#00000012]"
                    : "text-[#8D95A5] hover:text-primary",
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
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Account menu"
            >
              <InitialsAvatar name="Sarah Lee" className="h-9 w-9" online />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sarah Lee</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut />
                  Log out
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
