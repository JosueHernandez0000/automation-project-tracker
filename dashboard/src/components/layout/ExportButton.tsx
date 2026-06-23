import { FileDown } from "lucide-react";

import { useTheme } from "@/theme/useTheme";

/**
 * Export to PDF via the browser's print-to-PDF (no dependencies). Forces light mode
 * first so charts render their light-theme colors on paper, then restores the prior
 * theme after the print dialog closes. Print layout is handled by @media print in CSS.
 */
export function ExportButton() {
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);

  const handleExport = async () => {
    const wasDark = theme === "dark";
    if (wasDark) {
      setTheme("light");
      // Let charts re-render with light-theme colors before the snapshot.
      await new Promise((r) => setTimeout(r, 400));
    }
    const restore = () => {
      if (wasDark) setTheme("dark");
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <FileDown className="h-4 w-4" />
      <span className="hidden sm:inline">Save as PDF</span>
    </button>
  );
}
