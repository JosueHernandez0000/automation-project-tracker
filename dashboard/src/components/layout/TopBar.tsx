import { ExportButton } from "./ExportButton";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand to-brand-2" />
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Automation Portfolio</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Impact &amp; time-savings overview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
