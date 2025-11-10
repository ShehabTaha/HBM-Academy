import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

const SidebarItem = ({
  iconSrc,
  iconAlt,
  activeIconSrc,
  label,
  isActive,
  href,
  ref,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: {
  iconSrc: string;
  iconAlt: string;
  activeIconSrc: string;
  label: string;
  isActive: boolean;
  href: string;
  ref?: React.Ref<HTMLAnchorElement>;
  onMouseEnter: () => void;
  onMouseLeave: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}) => {
  // Replace with the desired active icon source
  const activeBg = "bg-gray-200 text-primary-blue"; // Replace with the desired active background class

  return (
    <Link
      href={href}
      className={cn(
        "flex border-0 items-center w-11/12 px-4 py-2 gap-3 bg-white font-medium hover:bg-gray-200 transition duration-150 ease-in-out rounded-lg hover:text-primary-blue focus:text-primary-blue focus:bg-gray-200 ml-2 focus:outline-none",
        isActive ? activeBg : "",
        "text-sm"
      )}
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <Icon
        src={isActive ? activeIconSrc : iconSrc}
        alt={iconAlt}
        className="ml-4"
        color="white"
      />
      <span>{label}</span>
    </Link>
  );
};

export default SidebarItem;
