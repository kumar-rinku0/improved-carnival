"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { MoreHorizontal, Pencil, Ban, Trash2, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type User = {
  _id?: string;
  name: string;
  permissions: string;
  role: string;
  email: string;
  status?: UserStatus;
};

type UserStatus = "Active" | "Deactivated" | "Pending";

// colors for user status
// Active: green, Deactivated: red, Pending: yellow
const statusColors: Record<UserStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Deactivated: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

export const columns: ColumnDef<User>[] = [
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
          User
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium text-gray-900">{name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown />
        </Button>
      );
    },
  },
  {
    accessorKey: "permissions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Permissions
          <ArrowUpDown />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as UserStatus;
      const color = statusColors[status];
      return (
        <div className={`w-fit text-xs font-medium px-2 py-1 rounded ${color}`}>
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-100 rounded">
              <Pencil className="w-4 h-4 text-gray-600" />
              Edit
            </div>
            <div className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-100 rounded">
              <Ban className="w-4 h-4" />
              Suspend
            </div>
            <div className="flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-100 rounded">
              <Trash2 className="w-4 h-4 text-gray-600" />
              Deactivate
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
