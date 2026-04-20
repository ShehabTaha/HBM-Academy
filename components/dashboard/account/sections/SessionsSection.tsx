"use client";

import React from "react";
import { useUserSessions } from "@/hooks/account/useUserSessions";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  XCircle,
  MapPin,
  Clock,
  RefreshCw,
  Timer,
  Globe,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { UserSession } from "@/types/account";

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SessionSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-center gap-6 animate-pulse">
      <div className="flex space-x-4 flex-1">
        <div className="h-12 w-12 bg-gray-100 rounded-lg shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-100 rounded w-2/5" />
          <div className="h-3 bg-gray-100 rounded w-3/5" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
      <div className="h-8 w-20 bg-gray-100 rounded-lg self-end md:self-center" />
    </div>
  );
}

// ─── Device icon helper ───────────────────────────────────────────────────────
function DeviceIcon({ type }: { type: UserSession["device_type"] }) {
  const Icon =
    type === "mobile" ? Smartphone : type === "tablet" ? Tablet : Monitor;
  return <Icon className="h-6 w-6" />;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: UserSession["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "active" ? "bg-green-500" : "bg-gray-400"
        )}
      />
      {status}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SessionsSection() {
  const { sessions, loading, isRevoking, refresh, revokeSession, revokeAllOtherSessions } =
    useUserSessions();

  const otherSessions = sessions.filter((s) => !s.is_current);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Active Sessions</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage every device currently signed in to your account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              className={cn("h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
            onClick={revokeAllOtherSessions}
            disabled={isRevoking || otherSessions.length === 0}
          >
            Sign out all other sessions
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <>
            <SessionSkeleton />
            <SessionSkeleton />
            <SessionSkeleton />
          </>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No active sessions found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Sessions are recorded when you sign in.
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isRevoking={isRevoking}
              onRevoke={() => revokeSession(session.id)}
            />
          ))
        )}

        {/* Empty others state */}
        {!loading && sessions.length > 0 && otherSessions.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-gray-100 bg-gray-50 py-6 text-center">
            <Wifi className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No other active sessions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({
  session,
  isRevoking,
  onRevoke,
}: {
  session: UserSession;
  isRevoking: boolean;
  onRevoke: () => void;
}) {
  const location = [session.city, session.country]
    .filter(Boolean)
    .join(", ") || "Location unavailable";

  return (
    <div
      className={cn(
        "p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-200",
        session.is_current
          ? "bg-blue-50/60 border-blue-100 ring-1 ring-blue-100"
          : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      )}
    >
      {/* Left: Device info */}
      <div className="flex items-start space-x-4">
        <div
          className={cn(
            "p-3 rounded-xl h-fit shrink-0",
            session.is_current ? "bg-blue-100" : "bg-gray-100"
          )}
        >
          <span
            className={cn(
              session.is_current ? "text-blue-600" : "text-gray-500"
            )}
          >
            <DeviceIcon type={session.device_type} />
          </span>
        </div>

        <div className="space-y-2 min-w-0">
          {/* Device name + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900 leading-none">
              {session.device_name}
            </h4>
            {session.is_current && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                This device
              </span>
            )}
            <StatusBadge status={session.status} />
          </div>

          {/* Browser */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <Globe className="h-3.5 w-3.5 text-gray-400" />
            {session.browser || "Unknown browser"}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="mr-1.5 h-3 w-3 text-gray-400 shrink-0" />
              {location}
              {session.ip_address && (
                <span className="ml-1 text-gray-400">
                  ({session.ip_address})
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="mr-1.5 h-3 w-3 text-gray-400 shrink-0" />
              Last active:{" "}
              {formatDistanceToNow(new Date(session.last_activity), {
                addSuffix: true,
              })}
            </div>
            {session.duration && (
              <div className="flex items-center text-xs text-gray-500">
                <Timer className="mr-1.5 h-3 w-3 text-gray-400 shrink-0" />
                Duration: {session.duration}
              </div>
            )}
          </div>

          {/* Signed in timestamp */}
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            Signed in:{" "}
            {new Date(session.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>

      {/* Right: Revoke button */}
      {!session.is_current && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 self-end md:self-center shrink-0"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {isRevoking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          Sign Out
        </Button>
      )}
    </div>
  );
}
