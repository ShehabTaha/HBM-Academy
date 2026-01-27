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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function SessionsSection() {
  const {
    sessions,
    loading,
    isRevoking,
    revokeSession,
    revokeAllOtherSessions,
  } = useUserSessions();

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Active Sessions</h3>
          <p className="text-sm text-gray-500">
            Manage devices accessing your account
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-100 hover:bg-red-50"
          onClick={revokeAllOtherSessions}
          disabled={isRevoking || sessions.length <= 1}
        >
          Sign out all other sessions
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => {
          const Icon = getDeviceIcon(session.device_type);
          const isCurrent = index === 0; // Assuming first is current for demo simulation

          return (
            <div
              key={session.id}
              className={cn(
                "p-6 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all",
                isCurrent
                  ? "bg-blue-50 border-blue-100 ring-1 ring-blue-100"
                  : "border-gray-100 hover:border-gray-200",
              )}
            >
              <div className="flex space-x-4">
                <div
                  className={cn(
                    "p-3 rounded-lg h-fit",
                    isCurrent ? "bg-blue-100" : "bg-gray-100",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      isCurrent ? "text-blue-600" : "text-gray-500",
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-gray-900">
                      {session.device_name} ({session.browser})
                    </h4>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="mr-1.5 h-3 w-3" />
                      {session.country || "Unknown Location"} (
                      {session.ip_address})
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="mr-1.5 h-3 w-3" />
                      Last active:{" "}
                      {formatDistanceToNow(new Date(session.last_activity))} ago
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-400 mt-2 uppercase font-medium tracking-widest">
                    Signed in: {new Date(session.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {!isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 self-end md:self-center"
                  onClick={() => revokeSession(session.id)}
                  disabled={isRevoking}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No active sessions found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
