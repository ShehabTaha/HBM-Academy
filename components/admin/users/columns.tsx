"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/users";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Ban, Trash, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, getUserStatusColor } from "@/utils/user-utils";

export const createColumns = (
  onView: (u: User) => void,
  onEdit: (u: User) => void,
  onAction: (action: string, u: User) => void,
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className="font-medium hover:underline cursor-pointer"
          onClick={() => onView(row.original)}
        >
          {row.getValue("name")}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return <span>{row.getValue("email")}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const val = row.original.status;
      return (
        <Badge className={`${getUserStatusColor(val)} capitalize border`}>
          {val}
        </Badge>
      );
    },
  },
  {
    accessorKey: "courses_enrolled",
    header: "Courses",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.courses_completed}/{row.original.courses_enrolled}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Joined
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    accessorKey: "last_active",
    header: "Last Active",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(row.original.last_active)}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(user)}>
              <Eye className="mr-2 h-4 w-4" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction("suspend", user)}>
              <Ban className="mr-2 h-4 w-4" /> Suspend
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onAction("delete", user)}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
