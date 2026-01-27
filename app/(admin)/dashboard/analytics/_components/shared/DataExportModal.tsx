/**
 * DataExportModal Component
 * Export analytics data to CSV or PDF
 */

"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  AnalyticsOverview,
  CompetencyData,
  ExportProgress,
} from "@/lib/analytics/types";
import { exportToCSV } from "@/lib/analytics/utils/data-export";

interface DataExportModalProps {
  open: boolean;
  onClose: () => void;
  analyticsData?: AnalyticsOverview | null;
  competencyData?: CompetencyData | null;
}

export function DataExportModal({
  open,
  onClose,
  analyticsData,
  competencyData,
}: DataExportModalProps) {
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [sections, setSections] = useState({
    kpis: true,
    competencies: true,
    softSkills: false,
    employment: false,
    certifications: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Simulate export progress
      setProgress({
        currentSection: "Preparing data...",
        progress: 0,
        isComplete: false,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (format === "csv") {
        // Export selected sections as CSV
        const exports: Array<{ filename: string; blob: Blob }> = [];

        if (sections.kpis && analyticsData) {
          setProgress({
            currentSection: "KPIs",
            progress: 33,
            isComplete: false,
          });
          // Create KPI export data
          const kpiData = [
            {
              Metric: "Total Students",
              Value: analyticsData.totalStudents.value,
              Target: analyticsData.totalStudents.target,
            },
            // ... other KPIs
          ];
          const { blob } = exportToCSV(kpiData, "kpis.csv");
          exports.push({ filename: "kpis.csv", blob });
        }

        if (sections.competencies && competencyData) {
          setProgress({
            currentSection: "Competencies",
            progress: 66,
            isComplete: false,
          });
          const competencyExport = competencyData.competencies.map((c) => ({
            Competency: c.name,
            Category: c.category,
            "Mastery %": c.masteryPercentage,
            "Days to Mastery": c.averageDaysToMastery,
          }));
          const { blob } = exportToCSV(competencyExport, "competencies.csv");
          exports.push({ filename: "competencies.csv", blob });
        }

        // Download all files
        exports.forEach(({ filename, blob }) => {
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        });

        setProgress({
          currentSection: "Complete",
          progress: 100,
          isComplete: true,
        });

        setTimeout(() => {
          onClose();
          setIsExporting(false);
          setProgress(null);
        }, 1000);
      } else {
        // PDF export would use jsPDF
        alert("PDF export requires jsPDF - not yet implemented");
        setIsExporting(false);
        setProgress(null);
      }
    } catch (error) {
      console.error("Export failed:", error);
      setProgress({
        currentSection: "Error",
        progress: 0,
        isComplete: false,
        error: "Export failed",
      });
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Analytics Data</DialogTitle>
          <DialogDescription>
            Choose format and sections to export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as "csv" | "pdf")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label
                  htmlFor="csv"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (Excel compatible)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label
                  htmlFor="pdf"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  PDF Report
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <Label>Include Sections</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kpis"
                  checked={sections.kpis}
                  onCheckedChange={(checked) =>
                    setSections({ ...sections, kpis: checked as boolean })
                  }
                />
                <Label htmlFor="kpis" className="cursor-pointer">
                  KPI Summary
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="competencies"
                  checked={sections.competencies}
                  onCheckedChange={(checked) =>
                    setSections({
                      ...sections,
                      competencies: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="competencies" className="cursor-pointer">
                  Competency Mastery
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="softSkills"
                  checked={sections.softSkills}
                  onCheckedChange={(checked) =>
                    setSections({ ...sections, softSkills: checked as boolean })
                  }
                />
                <Label htmlFor="softSkills" className="cursor-pointer">
                  Soft Skills
                </Label>
              </div>
            </div>
          </div>

          {/* Progress */}
          {progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{progress.currentSection}</span>
                <span>{progress.progress}%</span>
              </div>
              <Progress value={progress.progress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
