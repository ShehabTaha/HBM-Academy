import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarGroup,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";

const AdminSidebar = () => {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarGroup>
            <Link href="/" className="logo">
              <Image
                src="/logo.png"
                alt="logo"
                width={200}
                height={200}
              ></Image>
            </Link>
          </SidebarGroup>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link href="/admin/dashboard" data-testid="sidebar-link-home">
                    Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link
                    href="/admin/dashboard/channels"
                    data-testid="sidebar-link-channels"
                  >
                    Channels
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </SidebarHeader>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-2 p-4"></div>
        <SidebarTrigger />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminSidebar;
