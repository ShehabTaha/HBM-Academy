"use client";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarGroup,
  SidebarTrigger,
  SidebarInset,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import React from "react";
import SidebarItem from "@/components/admin/SidebarItem";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/Icon";

const Logo = ({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
      loading="eager"
    />
  );
};

const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const [homeIconSrc, setHomeIconSrc] = useState("/Icons/home.svg");
  const changeHomeIcon = (newSrc: string) => {
    setHomeIconSrc(newSrc);
  };
  const [productIconSrc, setProductIconSrc] = useState("/Icons/products.svg");
  const [channelsIconSrc, setChannelsIconSrc] = useState("/Icons/channels.svg");
  const [usersIconSrc, setUsersIconSrc] = useState("/Icons/users.svg");
  const [salesIconSrc, setSalesIconSrc] = useState("/Icons/sales.svg");
  const [analyticsIconSrc, setAnalyticsIconSrc] = useState(
    "/Icons/analytics.svg"
  );
  const homeLinkRef = useRef<HTMLElement>(null);

  const changeProductIcon = (newSrc: string) => {
    setProductIconSrc(newSrc);
  };
  const changechannelsIcon = (newSrc: string) => {
    setChannelsIconSrc(newSrc);
  };
  const changesalesIcon = (newSrc: string) => {
    setSalesIconSrc(newSrc);
  };
  const changeusersIcon = (newSrc: string) => {
    setUsersIconSrc(newSrc);
  };
  const changeanalyticsIcon = (newSrc: string) => {
    setAnalyticsIconSrc(newSrc);
  };
  const [homeIconActive, setHomeIconActive] = useState(true);

  useEffect(() => {
    if (homeLinkRef.current) {
      homeLinkRef.current.focus();
    }
  }, []);
  return (
    <>
      {/* Outer Sidebar */}
      <aside
        className="
  bg-white
  h-screen
  w-60
  flex
  flex-col
  border-r
  border-gray-200
  shadow-sm
  transition-all
  duration-300
  ease-in-out
"
      >
        {/* Header with logo and name */}
        <div className="flex items-center px-5 py-4 gap-2">
          {/* Logo Icon */}
          <Logo
            src="/logo.png"
            alt="logo"
            height={300}
            width={300}
            className="logo"
          />

          {/* Collapse Arrow/Trigger as needed */}
        </div>

        {/* Menu section */}
        <nav className="flex-1 mt-2">
          <ul className="space-y-1">
            {/* Active link */}
            <li>
              <SidebarItem
                iconSrc={homeIconSrc}
                activeIconSrc="/Icons/home-selected.svg"
                iconAlt="home"
                label="Home"
                isActive={homeIconActive}
                href="/dashboard/home"
                ref={homeLinkRef}
                onMouseEnter={() => changeHomeIcon("/Icons/home-selected.svg")}
                onMouseLeave={(event) => {
                  if (!event.currentTarget.contains(document.activeElement)) {
                    changeHomeIcon("/Icons/home.svg");
                  }
                }}
                onFocus={() => changeHomeIcon("/Icons/home-selected.svg")}
                onBlur={() => {
                  changeHomeIcon("/Icons/home.svg");
                  setHomeIconActive(false);
                }}
              />
            </li>
            <li>
              <SidebarItem
                iconSrc={productIconSrc}
                activeIconSrc="/Icons/products-selected.svg"
                iconAlt="products"
                label="Products"
                isActive={false}
                href="/dashboard/products"
                onMouseEnter={() =>
                  changeProductIcon("/Icons/products-selected.svg")
                }
                onMouseLeave={(event) => {
                  if (!event.currentTarget.contains(document.activeElement)) {
                    changeProductIcon("/Icons/products.svg");
                  }
                }}
                onFocus={() =>
                  changeProductIcon("/Icons/products-selected.svg")
                }
                onBlur={() => changeProductIcon("/Icons/products.svg")}
              />
            </li>
            <li>
              <SidebarItem
                iconSrc={channelsIconSrc}
                activeIconSrc="/Icons/channels-selected.svg"
                iconAlt="channels"
                label="Channels"
                isActive={false}
                href="/dashboard/channels"
                onMouseEnter={() =>
                  changechannelsIcon("/Icons/products-selected.svg")
                }
                onMouseLeave={(event) => {
                  if (!event.currentTarget.contains(document.activeElement)) {
                    changechannelsIcon("/Icons/products.svg");
                  }
                }}
                onFocus={() =>
                  changechannelsIcon("/Icons/products-selected.svg")
                }
                onBlur={() => changechannelsIcon("/Icons/products.svg")}
              />
            </li>
            <li>
              <SidebarItem
                iconSrc={salesIconSrc}
                activeIconSrc="/Icons/sales-selected.svg"
                iconAlt="sales"
                label="Sales"
                isActive={false}
                href="/dashboard/sales"
                onMouseEnter={() =>
                  changeProductIcon("/Icons/sales-selected.svg")
                }
                onMouseLeave={(event) => {
                  if (!event.currentTarget.contains(document.activeElement)) {
                    changeProductIcon("/Icons/products.svg");
                  }
                }}
                onFocus={() =>
                  changeProductIcon("/Icons/products-selected.svg")
                }
                onBlur={() => changeProductIcon("/Icons/products.svg")}
              />
            </li>
            <li>
              <SidebarItem
                iconSrc={productIconSrc}
                activeIconSrc="/Icons/products-selected.svg"
                iconAlt="products"
                label="Products"
                isActive={false}
                href="/dashboard/products"
                onMouseEnter={() =>
                  changeProductIcon("/Icons/products-selected.svg")
                }
                onMouseLeave={(event) => {
                  if (!event.currentTarget.contains(document.activeElement)) {
                    changeProductIcon("/Icons/products.svg");
                  }
                }}
                onFocus={() =>
                  changeProductIcon("/Icons/products-selected.svg")
                }
                onBlur={() => changeProductIcon("/Icons/products.svg")}
              />
            </li>
            <li>
              <SidebarItem
                iconSrc={productIconSrc}
                activeIconSrc="/Icons/products-selected.svg"
                iconAlt="products"
                label="Products"
                isActive={false}
                href="/dashboard/products"
                onMouseEnter={() =>
                  changeProductIcon("/Icons/products-selected.svg")
                }
                onMouseLeave={(event) => {
                  if (!event.currentTarget.contains(document.activeElement)) {
                    changeProductIcon("/Icons/products.svg");
                  }
                }}
                onFocus={() =>
                  changeProductIcon("/Icons/products-selected.svg")
                }
                onBlur={() => changeProductIcon("/Icons/products.svg")}
              />
            </li>
            {/* Rest of menu items */}
          </ul>
        </nav>
      </aside>
      {/* Collapsed = w-16 or w-20 only icons */}
      <aside
        className="
  hidden
  bg-white
  h-screen
  w-16
  flex
  flex-col
  border-r
  border-gray-200
  shadow-sm
  transition-all
  duration-300
  ease-in-out
"
      >
        <div className="flex justify-center py-4">
          <Logo
            src="/logo.png"
            alt="logo"
            height={300}
            width={300}
            className="logo"
          />
        </div>
        <nav className="flex-1 mt-2">
          <ul className="space-y-1">
            <li>
              <button className="flex items-center justify-center w-full py-2 text-purple-700">
                <Icon src="/Icons/home.svg" alt="home" />
              </button>
            </li>
            {/* ...repeat for other icons */}
          </ul>
        </nav>
      </aside>

      {children}
    </>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
};

export default Layout;
