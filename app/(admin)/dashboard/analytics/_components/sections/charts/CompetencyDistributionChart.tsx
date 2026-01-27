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
  Cell,
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

interface CompetencyDistributionChartProps {
  data: CompetencyData | null;
  isLoading: boolean;
}

export function CompetencyDistributionChart({
  data,
  isLoading,
}: CompetencyDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!data?.competencies) return [];
    // Sort by mastery percentage descending
    return [...data.competencies]
      .sort((a, b) => b.masteryPercentage - a.masteryPercentage)
      .slice(0, 15); // Top 15
  }, [data]);

  const getColor = (percent: number) => {
    if (percent >= 80) return "#10b981"; // Green
    if (percent >= 60) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[500px] rounded-xl" />;
  }

  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competency Distribution</CardTitle>
          <CardDescription>Mastery levels by competency</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No distribution data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Competency Distribution</CardTitle>
        <CardDescription>
          Percentage of students achieving mastery (80%+)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                formatter={(value: number) => [
                  `${value.toFixed(1)}%`,
                  "Mastery Rate",
                ]}
                contentStyle={{ borderRadius: "8px" }}
              />
              <Bar
                dataKey="masteryPercentage"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColor(entry.masteryPercentage)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
