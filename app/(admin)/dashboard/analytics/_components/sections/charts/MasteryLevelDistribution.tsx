"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CompetencyData } from "@/lib/analytics/types";
import { Skeleton } from "@/components/ui/skeleton";

interface MasteryLevelDistributionProps {
  data: CompetencyData | null;
  isLoading: boolean;
}

export function MasteryLevelDistribution({
  data,
  isLoading,
}: MasteryLevelDistributionProps) {
  const chartData = useMemo(() => {
    if (!data?.masteryDistribution) return [];
    return data.masteryDistribution;
  }, [data]);

  if (isLoading) {
    return <Skeleton className="w-full h-[350px] rounded-xl" />;
  }

  if (!data || chartData.length === 0) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>Mastery Levels</CardTitle>
          <CardDescription>Student distribution</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
          No distribution data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Mastery Level Distribution</CardTitle>
        <CardDescription>
          Breakdown of students by proficiency level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex flex-col items-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="studentCount"
                nameKey="level"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, "Students"]} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text (Total Students) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-4">
            <div className="text-3xl font-bold">
              {chartData.reduce((acc, curr) => acc + curr.studentCount, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Students</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
