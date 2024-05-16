export const FLUX_ANALYSIS_DASHBOARD_FOLDER = 'struttureenergia-monitoraggio-app' as const;

export const SANKEY_DASHBOARD = "AnalisiFlusso" as const;
export const DIAGNOSI_DASHBOARD = "Diagnosi" as const;

export const DAHSBOARDS = [SANKEY_DASHBOARD, DIAGNOSI_DASHBOARD] as const;
export type DASHBOARDS_NAME = typeof DAHSBOARDS[number];
