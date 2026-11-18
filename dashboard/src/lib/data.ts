import type { Dataset } from "@/types";

/**
 * Load the dataset produced by the Python pipeline. It lives in /public/data so it
 * is served as a static asset and can be regenerated without rebuilding the app.
 * BASE_URL keeps the path correct under the relative `base: "./"` build.
 * The standalone HTML export embeds the dataset instead (see vite-env.d.ts).
 */
export async function loadDataset(): Promise<Dataset> {
  if (window.__DASHBOARD_DATA__) return window.__DASHBOARD_DATA__;
  const url = `${import.meta.env.BASE_URL}data/projects.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load dataset (${res.status}). Run: uv run python -m pipeline.build_data`);
  }
  return (await res.json()) as Dataset;
}
