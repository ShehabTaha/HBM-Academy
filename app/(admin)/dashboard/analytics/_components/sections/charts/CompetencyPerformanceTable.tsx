"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompetencyData, CompetencyMetric } from "@/lib/analytics/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CompetencyPerformanceTableProps {
  data: CompetencyData | null;
  isLoading: boolean;
}

export function CompetencyPerformanceTable({
  data,
  isLoading,
}: CompetencyPerformanceTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CompetencyMetric;
    direction: "asc" | "desc";
  } | null>(null);
  const [filter, setFilter] = useState("");

  const sortedData = useMemo(() => {
    if (!data?.competencies) return [];
    let sortableItems = [...data.competencies];

    if (filter) {
      sortableItems = sortableItems.filter((item) =>
        item.name.toLowerCase().includes(filter.toLowerCase()),
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort: Mastery % desc
      sortableItems.sort((a, b) => b.masteryPercentage - a.masteryPercentage);
    }
    return sortableItems;
  }, [data, sortConfig, filter]);

  const requestSort = (key: keyof CompetencyMetric) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[500px] rounded-xl" />;
  }

  if (!data?.competencies) return null;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Competency Performance Details</CardTitle>
            <CardDescription>
              Detailed view of mastery metrics per competency
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search competencies..."
              className="pl-8"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("name")}
                    className="flex items-center gap-1 p-0 hover:bg-transparent"
                  >
                    Competency
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("masteryPercentage")}
                    className="flex items-center gap-1 p-0 hover:bg-transparent ml-auto"
                  >
                    Mastery %
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("studentsAttempted")}
                    className="flex items-center gap-1 p-0 hover:bg-transparent ml-auto"
                  >
                    Students
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => requestSort("averageDaysToMastery")}
                    className="flex items-center gap-1 p-0 hover:bg-transparent ml-auto"
                  >
                    Avg Days
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {comp.name}
                        {comp.isCritical && (
                          <Badge
                            variant="outline"
                            className="text-xs border-red-200 text-red-700 bg-red-50"
                          >
                            Critical
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{comp.category}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-bold ${
                          comp.masteryPercentage >= 80
                            ? "text-green-600"
                            : comp.masteryPercentage >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {comp.masteryPercentage.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {comp.studentsAttempted}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(comp.averageDaysToMastery)} days
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={
                          comp.masteryPercentage >= 80
                            ? "bg-green-100 text-green-800"
                            : comp.masteryPercentage >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {comp.masteryPercentage >= 80
                          ? "Mastered"
                          : comp.masteryPercentage >= 60
                            ? "Proficient"
                            : "Needs Work"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No competencies found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
