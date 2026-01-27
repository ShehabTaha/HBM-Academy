/**
 * Data Export Utilities
 * CSV and PDF generation for analytics reports
 */

import { parse as parseCSV } from "papaparse";

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Convert analytics data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string = "export.csv",
): {
  csv: string;
  blob: Blob;
  download: () => void;
} {
  if (data.length === 0) {
    return {
      csv: "",
      blob: new Blob([""], { type: "text/csv" }),
      download: () => {},
    };
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV rows
  const csvRows: string[] = [];

  // Add header row
  csvRows.push(headers.map((h) => escapeCSVValue(h)).join(","));

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      return escapeCSVValue(formatCSVValue(value));
    });
    csvRows.push(values.join(","));
  });

  const csv = csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Create download function
  const download = () => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { csv, blob, download };
}

/**
 * Escape special characters in CSV values
 */
function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format value for CSV output
 */
function formatCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

// ============================================================================
// MULTI-SHEET CSV EXPORT
// ============================================================================

export interface CSVSheet<T = Record<string, unknown>> {
  name: string;
  data: T[];
}

/**
 * Export multiple sheets as separate CSV files in a ZIP
 * Note: Requires JSZip library for actual ZIP creation
 */
export function exportMultipleCSV(
  sheets: CSVSheet[],
): Array<{ filename: string; csv: string; blob: Blob }> {
  return sheets.map((sheet) => {
    const { csv, blob } = exportToCSV(sheet.data, `${sheet.name}.csv`);
    return {
      filename: `${sheet.name}.csv`,
      csv,
      blob,
    };
  });
}

// ============================================================================
// PDF EXPORT (using jsPDF)
// ============================================================================

/**
 * Generate PDF report from analytics data
 * Note: This is a template - actual implementation requires jsPDF
 */
export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  sections: PDFSection[];
  includeCharts: boolean;
  footer?: string;
}

export interface PDFSection {
  title: string;
  content: string | string[];
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
  chart?: {
    type: "bar" | "line" | "pie" | "radar";
    imageDataUrl: string; // Base64 encoded image
  };
}

/**
 * Generate PDF report structure
 */
export function generatePDFReport(options: PDFReportOptions): {
  structure: PDFReportOptions;
  // Actual PDF would be generated here with jsPDF
  generatePDF?: () => Blob;
} {
  validatePDFOptions(options);

  return {
    structure: options,
    // Implementation with jsPDF would go here
    generatePDF: () => {
      // Placeholder - actual implementation would use jsPDF
      console.log("PDF generation requires jsPDF library");
      return new Blob([], { type: "application/pdf" });
    },
  };
}

/**
 * Validate PDF export options
 */
function validatePDFOptions(options: PDFReportOptions): void {
  if (!options.title || options.title.trim() === "") {
    throw new Error("PDF title is required");
  }

  if (!Array.isArray(options.sections) || options.sections.length === 0) {
    throw new Error("At least one section is required");
  }

  options.sections.forEach((section, index) => {
    if (!section.title) {
      throw new Error(`Section ${index + 1} is missing a title`);
    }
  });
}

/**
 * Convert chart canvas to image data URL for PDF
 */
export function chartToImageDataURL(chartElement: HTMLCanvasElement): string {
  return chartElement.toDataURL("image/png");
}

// ============================================================================
// EXPORT TEMPLATES
// ============================================================================

/**
 * Generate KPI summary export
 */
export function generateKPISummaryExport(data: {
  totalStudents: number;
  activeUsers: number;
  completionRate: number;
  passRate: number;
  softSkillsAverage: number;
  placementRate: number;
  certifications: number;
  attendance: number;
  satisfaction: number;
}): Array<{
  Metric: string;
  Value: string;
  Target: string;
  Status: string;
}> {
  return [
    {
      Metric: "Total Students",
      Value: data.totalStudents.toString(),
      Target: "-",
      Status: "-",
    },
    {
      Metric: "Active Users (7d)",
      Value: data.activeUsers.toString(),
      Target: "-",
      Status: "-",
    },
    {
      Metric: "Course Completion Rate",
      Value: `${data.completionRate}%`,
      Target: "85%",
      Status: data.completionRate >= 85 ? "✓" : "⚠",
    },
    {
      Metric: "Assessment Pass Rate",
      Value: `${data.passRate}%`,
      Target: "85%",
      Status: data.passRate >= 85 ? "✓" : "⚠",
    },
    {
      Metric: "Soft Skills Average",
      Value: `${data.softSkillsAverage}%`,
      Target: "85%",
      Status: data.softSkillsAverage >= 85 ? "✓" : "⚠",
    },
    {
      Metric: "Job Placement Rate",
      Value: `${data.placementRate}%`,
      Target: "75%",
      Status: data.placementRate >= 75 ? "✓" : "⚠",
    },
    {
      Metric: "Certifications Issued",
      Value: data.certifications.toString(),
      Target: "-",
      Status: "-",
    },
    {
      Metric: "Attendance Rate",
      Value: `${data.attendance}%`,
      Target: "95%",
      Status: data.attendance >= 95 ? "✓" : "⚠",
    },
    {
      Metric: "Student Satisfaction",
      Value: `${data.satisfaction}/5`,
      Target: "4.6/5",
      Status: data.satisfaction >= 4.6 ? "✓" : "⚠",
    },
  ];
}

/**
 * Generate competency mastery export
 */
export function generateCompetencyExport(
  data: Array<{
    name: string;
    category: string;
    isCritical: boolean;
    masteryPercentage: number;
    averageDaysToMastery: number;
    studentsAttempted: number;
    studentsMastered: number;
  }>,
): Array<{
  Competency: string;
  Category: string;
  Critical: string;
  "Mastery %": string;
  "Avg Days": string;
  Attempted: number;
  Mastered: number;
}> {
  return data.map((comp) => ({
    Competency: comp.name,
    Category: comp.category,
    Critical: comp.isCritical ? "Yes" : "No",
    "Mastery %": `${comp.masteryPercentage}%`,
    "Avg Days": comp.averageDaysToMastery.toString(),
    Attempted: comp.studentsAttempted,
    Mastered: comp.studentsMastered,
  }));
}

/**
 * Generate role performance export
 */
export function generateRolePerformanceExport(
  data: Array<{
    role: string;
    enrollment: number;
    completionRate: number;
    averageScore: number;
    softSkillsAverage: number;
    jobPlacementRate: number;
  }>,
): Array<{
  Role: string;
  Enrollment: number;
  "Completion %": string;
  "Avg Score": string;
  "Soft Skills": string;
  "Placement %": string;
}> {
  return data.map((role) => ({
    Role: role.role,
    Enrollment: role.enrollment,
    "Completion %": `${role.completionRate}%`,
    "Avg Score": `${role.averageScore}%`,
    "Soft Skills": `${role.softSkillsAverage}%`,
    "Placement %": `${role.jobPlacementRate}%`,
  }));
}

/**
 * Generate at-risk students export
 */
export function generateAtRiskExport(
  data: Array<{
    studentName: string;
    email: string;
    role: string;
    riskScore: number;
    riskLevel: string;
    attendanceRate: number;
    averageScore: number;
    missedSessions: number;
  }>,
): Array<{
  Student: string;
  Email: string;
  Role: string;
  "Risk Score": number;
  "Risk Level": string;
  "Attendance %": string;
  "Avg Score": string;
  "Missed Sessions": number;
}> {
  return data.map((student) => ({
    Student: student.studentName,
    Email: student.email,
    Role: student.role,
    "Risk Score": student.riskScore,
    "Risk Level": student.riskLevel,
    "Attendance %": `${student.attendanceRate}%`,
    "Avg Score": `${student.averageScore}%`,
    "Missed Sessions": student.missedSessions,
  }));
}

// ============================================================================
// EXPORT PROGRESS TRACKING
// ============================================================================

export interface ExportProgress {
  currentSection: string;
  progress: number; // 0-100
  isComplete: boolean;
  error?: string;
}

/**
 * Track export progress for large datasets
 */
export class ExportProgressTracker {
  private totalSections: number;
  private completedSections: number;
  private currentSection: string;
  private callbacks: ((progress: ExportProgress) => void)[];

  constructor(totalSections: number) {
    this.totalSections = totalSections;
    this.completedSections = 0;
    this.currentSection = "";
    this.callbacks = [];
  }

  onProgress(callback: (progress: ExportProgress) => void): void {
    this.callbacks.push(callback);
  }

  startSection(sectionName: string): void {
    this.currentSection = sectionName;
    this.notify();
  }

  completeSection(): void {
    this.completedSections++;
    this.notify();
  }

  fail(error: string): void {
    this.callbacks.forEach((callback) =>
      callback({
        currentSection: this.currentSection,
        progress: this.getProgress(),
        isComplete: false,
        error,
      }),
    );
  }

  private getProgress(): number {
    return (this.completedSections / this.totalSections) * 100;
  }

  private notify(): void {
    const progress: ExportProgress = {
      currentSection: this.currentSection,
      progress: this.getProgress(),
      isComplete: this.completedSections === this.totalSections,
    };

    this.callbacks.forEach((callback) => callback(progress));
  }
}

// ============================================================================
// BATCH EXPORT
// ============================================================================

/**
 * Export all analytics sections
 */
export async function exportAllSections(
  sections: CSVSheet[],
  onProgress?: (progress: ExportProgress) => void,
): Promise<Array<{ filename: string; blob: Blob }>> {
  const tracker = new ExportProgressTracker(sections.length);

  if (onProgress) {
    tracker.onProgress(onProgress);
  }

  const exports: Array<{ filename: string; blob: Blob }> = [];

  for (const section of sections) {
    try {
      tracker.startSection(section.name);

      const { blob } = exportToCSV(section.data, `${section.name}.csv`);
      exports.push({
        filename: `${section.name}.csv`,
        blob,
      });

      tracker.completeSection();

      // Small delay to prevent UI blocking
      await new Promise((resolve) => setTimeout(resolve, 10));
    } catch (error) {
      tracker.fail(`Failed to export ${section.name}: ${error}`);
      throw error;
    }
  }

  return exports;
}
