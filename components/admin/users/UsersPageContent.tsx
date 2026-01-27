"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUsers, useUserAnalytics } from "@/hooks/useUsers"; // Updated import
import { useUserActions } from "@/hooks/useUserActions"; // Updated import
import { UsersHeader } from "./UsersHeader"; // Updated import
import { StatsCards } from "./StatsCards";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { UsersFilters } from "./UsersFilters"; // Updated import
import { UsersTable } from "./UsersTable"; // Updated import
import { BulkActionsBar } from "./BulkActionsBar";
import { createColumns } from "./columns";
import { User } from "@/types/users"; // Updated import
import { downloadCSV } from "@/utils/export";
import { useToast } from "@/components/ui/use-toast";

// Modals
import { StudentDetailModal } from "./modals/StudentDetailModal"; // Use generic naming later? For now stick to file rename later.
import { EditStudentModal } from "./modals/EditStudentModal";
import {
  VerifyEmailModal,
  SuspendStudentModal,
  DeleteStudentModal,
} from "./modals/ActionModals";

export function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();

  // Params
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || undefined;
  const safeStatus = status === "all" ? undefined : status;
  const verified =
    searchParams.get("verified") === "true"
      ? true
      : searchParams.get("verified") === "false"
        ? false
        : undefined;
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  // Data Fetching
  const {
    users,
    pagination,
    stats,
    isLoading: isUsersLoading,
    mutate,
  } = useUsers(page, limit, search, safeStatus, verified, sortBy, sortOrder);
  const { data: analyticsData, isLoading: isAnalyticsLoading } =
    useUserAnalytics();
  const { verifyEmail, suspendUser, deleteUser } = useUserActions();

  // State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Modal States
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Handlers
  const handleView = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  }, []);

  const handleAction = useCallback(
    (action: string, user: User) => {
      setSelectedUser(user);
      if (action === "verify_email") setIsVerifyOpen(true);
      if (action === "suspend") setIsSuspendOpen(true);
      if (action === "delete") setIsDeleteOpen(true);
      if (action === "reset_password") {
        toast({
          title: "Reset Password",
          description: "Password reset processing (mock)",
        });
      }
    },
    [toast],
  );

  const handleExport = useCallback(() => {
    // Get the current users from the table state instead of closure
    if (users.length > 0) {
      downloadCSV(users, `users-${new Date().toISOString().split("T")[0]}`);
    }
  }, [users]);

  const columns = useMemo(
    () => createColumns(handleView, handleEdit, handleAction),
    [handleView, handleEdit, handleAction],
  );

  return (
    <div className="space-y-6">
      <UsersHeader onExport={handleExport} />

      <StatsCards stats={stats} isLoading={isUsersLoading} />

      {/* Temporarily disabled to debug re-render loop */}
      {/* <AnalyticsCharts data={analyticsData} isLoading={isAnalyticsLoading} /> */}

      <div className="space-y-4">
        <UsersFilters />

        <UsersTable
          columns={columns}
          data={users}
          isLoading={isUsersLoading}
          pageCount={pagination?.pages || 0}
          pageIndex={page - 1}
          pageSize={limit}
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", (p + 1).toString());
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
          }}
          onSelectionChange={setSelectedIds}
        />
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onSuspend={() => setIsSuspendOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
        onExport={handleExport}
      />

      {/* Modals - Keeping modal names for now but passing user data */}
      <StudentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        student={selectedUser}
        onEdit={() => {
          setIsDetailOpen(false);
          setIsEditOpen(true);
        }}
        onVerify={() => {
          setIsDetailOpen(false);
          setIsVerifyOpen(true);
        }}
        onSuspend={() => {
          setIsDetailOpen(false);
          setIsSuspendOpen(true);
        }}
        onDelete={() => {
          setIsDetailOpen(false);
          setIsDeleteOpen(true);
        }}
      />

      <EditStudentModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        student={selectedUser}
        onSuccess={() => mutate()}
      />

      <VerifyEmailModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        count={selectedIds.length > 0 && !selectedUser ? selectedIds.length : 1}
        onConfirm={async () => {
          if (selectedUser) {
            await verifyEmail(selectedUser.id);
            mutate();
            setIsVerifyOpen(false);
            toast({
              title: "Verified",
              description: "Email verified successfully.",
            });
          }
        }}
      />

      <SuspendStudentModal
        isOpen={isSuspendOpen}
        onClose={() => setIsSuspendOpen(false)}
        studentName={selectedUser?.name}
        onConfirm={async (reason: string) => {
          if (selectedUser) {
            await suspendUser(selectedUser.id, reason);
            mutate();
            setIsSuspendOpen(false);
            toast({
              title: "Suspended",
              description: "User account suspended.",
            });
          }
        }}
      />

      <DeleteStudentModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        studentName={selectedUser?.name}
        onConfirm={async () => {
          if (selectedUser) {
            await deleteUser(selectedUser.id);
            mutate();
            setIsDeleteOpen(false);
            toast({ title: "Deleted", description: "User account deleted." });
          }
        }}
      />
    </div>
  );
}
