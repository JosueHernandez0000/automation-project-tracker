/// <reference types="vite/client" />

/**
 * Set only in the standalone single-file HTML export (`uv run create-html`): the
 * dataset and map geometry are embedded in the page, because `fetch` is blocked when
 * the file is opened from disk (file://), e.g. from an email or SharePoint download.
 */
interface Window {
  __DASHBOARD_DATA__?: import("@/types").Dataset;
  __GEO_DATA__?: object;
}
