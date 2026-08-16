"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtime(
  channelName: string,
  config: {
    table: string;
    filter?: string;
    event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  },
  onPayload: (payload: any) => void,
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = (supabase.channel(channelName) as any)
      .on(
        "postgres_changes",
        {
          event: config.event ?? "*",
          schema: "public",
          table: config.table,
          filter: config.filter,
        },
        onPayload,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, config.event, config.filter, config.table, onPayload]);
}
