"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

interface RoleCompetencyComparisonProps {
  data: CompetencyData | null;
  isLoading: boolean;
}

export function RoleCompetencyComparison({
  data,
  isLoading,
}: RoleCompetencyComparisonProps) {
  const chartData = useMemo(() => {
    if (!data?.roleComparisonData) return [];
    return data.roleComparisonData.slice(0, 6); // Top 6 competencies to avoid overcrowding
  }, [data]);

  // Extract roles dynamically
  const roles = useMemo(() => {
    if (chartData.length === 0) return [];
    return Object.keys(chartData[0]).filter((k) => k !== "competency");
  }, [chartData]);

  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (isLoading) {
    return <Skeleton className="w-full h-[450px] rounded-xl" />;
  }

  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Comparison</CardTitle>
          <CardDescription>Mastery levels by role</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No role comparison data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Role-Based Competency Comparison</CardTitle>
        <CardDescription>
          Comparing proficiency levels across different job roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={0}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="competency" tick={{ fontSize: 12 }} />
              <YAxis unit="%" />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "Mastery"]}
                contentStyle={{ borderRadius: "8px" }}
              />
              <Legend />
              {roles.map((role, index) => (
                <Bar
                  key={role}
                  dataKey={role}
                  name={role}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
