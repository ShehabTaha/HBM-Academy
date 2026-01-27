import { User } from "../types/users";
import { formatDistanceToNow, parseISO } from "date-fns";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatRelativeTime = (dateString: string | undefined) => {
  if (!dateString) return "Never";
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch (e) {
    return "Invalid date";
  }
};

export const getUserStatusColor = (status: User["status"]) => {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "inactive":
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    case "suspended":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

export const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return "bg-emerald-500";
  if (percentage >= 50) return "bg-blue-500";
  if (percentage > 0) return "bg-amber-500";
  return "bg-slate-200";
};

export const calculateUserStatus = (user: User): User["status"] => {
  if (user.deleted_at) return "suspended";
  if (user.last_active) {
    const activeDate = new Date(user.last_active);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (activeDate > sevenDaysAgo) return "active";
  }
  return "inactive";
};
