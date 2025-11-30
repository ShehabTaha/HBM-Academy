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
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  { name: "Home", icon: Home, href: "/dashboard/home" },
  { name: "Courses", icon: Blocks, href: "/dashboard/courses" },
  { name: "Video Library", icon: Video, href: "/dashboard/video-library" },
  { name: "Users", icon: Users, href: "/dashboard/users" },
  { name: "Analytics", icon: ChartPie, href: "/dashboard/analytics" },
];

const footerItems = [
  {
    name: "Account",
    icon: CircleUser,
    href: "/dashboard/profile",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
  {
    name: "Logout",
    icon: LogOut,
    href: "/dashboard/logout",
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

  return (
    <>
      <Sidebar
        className={`bg-white min-w-24 justify-between  h-screen flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out
        ${state === "collapsed" ? "w-20" : "max-sm:min-w-10"}
        `}
        collapsible="icon"
      >
        <SidebarHeader className="flex flex-col gap-1 px-5 pt-4 pb-2 ">
          {/* Logo and title */}
          <div className="flex items-center  gap-2">
            <Image
              src="https://horizons-cdn.hostinger.com/51932ab3-81fd-4818-a897-f8f7513b0735/53134d16e871b8173f959fb0e15b222a.png"
              alt="Logo"
              width={70}
              height={60}
              className={` mx-0 transition-all ease-in-out
              ${
                state === "collapsed"
                  ? "w-[80] h-[60] max-w-none ml-0"
                  : " left-5.5 relative"
              }
              `}
            />
            {state === "expanded" && (
              <p className="text-3xl relative font-medium whitespace-nowrap transition-all ease-in-out bottom-[-5]">
                HBM
                <span className="relative right-[-5] top-[-25] text-sm">
                  Academy
                </span>
              </p>
            )}
          </div>

          {/* Sidebar trigger */}
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
                      (segment, i) => segment === pathSegments[i]
                    ));

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      className={`
                      flex items-center gap-6 w-10/12 px-6 py-2 rounded-lg
                      font-medium transition ml-6 mt-3
                      ${
                        isActive
                          ? "bg-gray-100 text-primary-blue"
                          : "text-gray-400 hover:bg-gray-100 hover:text-primary-blue"
                      }
                      ${state === "collapsed" ? " justify-center px-0" : ""}
                    `}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className="flex items-center gap-2"
                      >
                        <ItemIcon size={28} strokeWidth={1.5} />
                        {state !== "collapsed" && (
                          <span className="truncate transition-all ease-in-out">
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
                    (segment, i) => segment === pathSegments[i]
                  ));

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    className={`
                      flex items-center gap-3 w-10/12 px-6 py-2 rounded-lg
                      font-medium transition ml-6 mt-3 self-end
                      ${
                        isActive
                          ? "bg-gray-100 text-primary-blue"
                          : "text-gray-400 hover:bg-gray-100 hover:text-primary-blue"
                      }
                      ${state === "collapsed" ? " justify-center px-0" : ""}
                    `}
                    tabIndex={isActive ? 0 : -1}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className="flex items-center gap-2"
                    >
                      <ItemIcon
                        size={28}
                        strokeWidth={1.5}
                        className="w-6 h-6"
                      />
                      {state !== "collapsed" && (
                        <span className="truncate transition-all ease-in-out">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
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
  return (
    <SidebarProvider className="h-screen">
      <div className="flex">
        <AppSidebar />
      </div>
      <main
        className={
          "flex-1 mr-18 ml-15 lg:pl-10 w-full gap-y-12 items-center flex-col flex max-sm:mx-0 max-sm:text-sm max-sm:pr-7 max-sm:w-11/12 pt-1 pb-10 "
        }
      >
        {children}
      </main>
    </SidebarProvider>
  );
}
