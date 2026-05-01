"use client";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useSidebar } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  Blocks,
  ChartPie,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  CircleUser,
  Menu,
  Video,
  ClipboardCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useSessionHeartbeat } from "@/hooks/account/useSessionHeartbeat";

const menuItems = [
  { name: "Home", icon: Home, href: "/dashboard/home" },
  { name: "Courses", icon: Blocks, href: "/dashboard/courses" },
  { name: "Video Library", icon: Video, href: "/dashboard/video-library" },
  { name: "Users", icon: Users, href: "/dashboard/users" },
  { name: "Submissions", icon: ClipboardCheck, href: "/dashboard/submissions" },
  { name: "Analytics", icon: ChartPie, href: "/dashboard/analytics" },
];

const footerItems = [
  {
    name: "Account",
    icon: CircleUser,
    href: "/dashboard/account",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

function CustomSidebarTrigger() {
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <button
      onClick={toggleSidebar}
      className={`p-2 hover:bg-gray-100 rounded-lg transition h-7 w-7  top-8 max-md:static fixed z-30 flex items-center justify-center
        ${
          state === "expanded"
            ? "left-[220]  "
            : "left-[80] bg-primary-blue hover:bg-primary-blue-hover "
        }
        `}
    >
      {isMobile ? (
        <Menu className="w-5 h-5 text-gray-500" />
      ) : state === "expanded" ? (
        <ChevronLeft className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronRight className="w-5 h-5 text-gray-50" />
      )}
    </button>
  );
}
function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      if ((session?.user as Record<string, unknown>)?.sessionId) {
        await fetch("/api/user/sessions/revoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: (session?.user as Record<string, unknown>)?.sessionId }),
        });
      }
    } catch (e) {
      console.error("Failed to revoke session on logout", e);
    }
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  return (
    <>
      <Sidebar
        className={`bg-white min-w-24 justify-between  h-screen flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out
        ${state === "collapsed" ? "w-20" : "max-sm:min-w-10"}
        `}
        collapsible="icon"
      >
        <SidebarHeader className="flex flex-col gap-1 px-4 py-6">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain shrink-0"
            />
            {state === "expanded" && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-lg font-bold truncate leading-tight tracking-tight">
                  HBM Academy
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Admin Panel
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className=" flex-1 mt-8 gap-12 max-sm:overflow-visible">
          <SidebarGroup>
            <SidebarMenu>
              {menuItems.map((item) => {
                const ItemIcon = item.icon;
                const itemSegments = item.href.split("/").filter(Boolean);
                const pathSegments = pathname.split("/").filter(Boolean);
                const isActive =
                  pathname === item.href ||
                  (pathSegments.length >= itemSegments.length &&
                    itemSegments.every(
                      (segment, i) => segment === pathSegments[i],
                    ));

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.name}
                      className={`
                        transition-colors h-11 px-3
                        ${
                          isActive
                            ? "bg-gray-100 text-primary-blue font-semibold"
                            : "text-gray-500 hover:bg-gray-100 hover:text-primary-blue font-medium"
                        }
                        ${state === "collapsed" ? "justify-center" : ""}
                      `}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className="flex items-center gap-3 w-full"
                      >
                        <ItemIcon size={22} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                        {state !== "collapsed" && (
                          <span className="truncate">
                            {item.name}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="mb-0 align-bottom">
          <SidebarMenu>
            {footerItems.map((item) => {
              const ItemIcon = item.icon;
              const itemSegments = item.href.split("/").filter(Boolean);
              const pathSegments = pathname.split("/").filter(Boolean);
              const isActive =
                pathname === item.href ||
                (pathSegments.length >= itemSegments.length &&
                  itemSegments.every(
                    (segment, i) => segment === pathSegments[i],
                  ));

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.name}
                    className={`
                      transition-colors h-11 px-3 mt-1
                      ${
                        isActive
                          ? "bg-gray-100 text-primary-blue font-semibold"
                          : "text-gray-500 hover:bg-gray-100 hover:text-primary-blue font-medium"
                      }
                      ${state === "collapsed" ? "justify-center" : ""}
                    `}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className="flex items-center gap-3 w-full"
                    >
                      <ItemIcon size={22} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                      {state !== "collapsed" && (
                        <span className="truncate">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

            {/* Logout Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Logout"
                className={`
                  transition-colors h-11 px-3 mt-1 cursor-pointer
                  text-red-600 hover:bg-red-50 hover:text-red-700 font-medium
                  ${state === "collapsed" ? "justify-center" : ""}
                `}
              >
                <LogOut size={22} strokeWidth={1.5} className="shrink-0" />
                {state !== "collapsed" && (
                  <span className="truncate">
                    Logout
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <CustomSidebarTrigger />
    </>
  );
}

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useSessionHeartbeat();

  return (
    <SidebarProvider className="h-screen">
      <div className="flex">
        <AppSidebar />
      </div>
      <main
        className={
          "flex-1 mr-8 ml-8 lg:pl-10 w-full max-w-[1600px] gap-y-12 items-center flex-col flex pt-1 pb-10 "
        }
      >
        {children}
      </main>
    </SidebarProvider>
  );
}
