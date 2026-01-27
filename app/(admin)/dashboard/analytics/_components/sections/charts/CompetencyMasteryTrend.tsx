"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
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

interface CompetencyMasteryTrendProps {
  data: CompetencyData | null;
  isLoading: boolean;
}

export function CompetencyMasteryTrend({
  data,
  isLoading,
}: CompetencyMasteryTrendProps) {
  const chartData = useMemo(() => {
    if (!data?.trendData) return [];
    return data.trendData;
  }, [data]);

  // Extract competency keys dynamically from the first data point, excluding "month"
  const dataKeys = useMemo(() => {
    if (chartData.length === 0) return [];
    return Object.keys(chartData[0]).filter((k) => k !== "month");
  }, [chartData]);

  // Colors for lines
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F",
  ];

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] rounded-xl" />;
  }

  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competency Mastery Trend</CardTitle>
          <CardDescription>Improvement over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No trend data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Competency Mastery Trend</CardTitle>
        <CardDescription>
          Tracking mastery percentage improvement over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip
                formatter={(value: any) => [`${value}%`, "Evaluate"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend />
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={
                    key === "Average Mastery"
                      ? "#0f172a"
                      : colors[index % colors.length]
                  }
                  strokeWidth={key === "Average Mastery" ? 3 : 2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                  strokeDasharray={key === "Average Mastery" ? "5 5" : ""}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
