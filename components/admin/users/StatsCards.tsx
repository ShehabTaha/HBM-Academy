"use client";

import { UserStats } from "@/types/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, BookOpen } from "lucide-react";

interface StatsCardsProps {
  stats?: UserStats;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      icon: Users,
      description: "All registered users",
    },
    {
      title: "Active Users",
      value: stats?.active_users || 0,
      icon: UserCheck,
      description: "Active in last 7 days",
    },
    {
      title: "Inactive Users",
      value: stats?.inactive_users || 0,
      icon: UserX,
      description: "No recent activity",
    },
    {
      title: "Total Enrollments",
      value: stats?.total_enrollments || 0,
      icon: BookOpen,
      description: "Course enrollments",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {item.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
