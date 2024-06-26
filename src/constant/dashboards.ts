export const FLUX_ANALYSIS_DASHBOARD_FOLDER = 'struttureenergia-monitoraggio-app' as const;

export const SANKEY_DASHBOARD = "AnalisiFlusso" as const;
export const DIAGNOSI_DASHBOARD = "Diagnosi" as const;

export const DAHSBOARDS = [SANKEY_DASHBOARD, DIAGNOSI_DASHBOARD] as const;
export type DASHBOARDS_NAME = typeof DAHSBOARDS[number];

export type DiagnosiPanelConfig = { id: number; h: number; w: number; x: number; y: number; isHeader: boolean};
export type DiagnosiDashboardConfig = Record<string, DiagnosiPanelConfig[]>;
export type DiagnosiDashboardBlockLayout = 'horizontal' | 'vertical' | 'two-per-row';

export const diagnosiDashboardPanelConfiguration = {
  'b1': [
    { id: 5, h: 1, w: 24, x: 0, y: 0, isHeader: true },
    { id: 2, h: 10, w: 6, x: 0, y: 1, isHeader: false },
    { id: 3, h: 10, w: 6, x: 6, y: 1, isHeader: false },
    { id: 21, h: 10, w: 6, x: 12, y: 1, isHeader: false },
    { id: 7, h: 10, w: 6, x: 18, y: 1, isHeader: false },
  ],
  'b2': [
    { id: 6, h: 1, w: 24, x: 0, y: 11, isHeader: true },
    { id: 1, h: 9, w: 24, x: 0, y: 12, isHeader: false },
    { id: 8, h: 9, w: 24, x: 0, y: 21, isHeader: false },
    { id: 4, h: 9, w: 24, x: 0, y: 30, isHeader: false },
    { id: 22, h: 9, w: 24, x: 0, y: 39, isHeader: false },
    { id: 9, h: 9, w: 24, x: 0, y: 48, isHeader: false },
  ],
  'b3': [
    { id: 10, h: 1, w: 24, x: 0, y: 57, isHeader: true },
    { id: 12, h: 11, w: 12, x: 0, y: 58, isHeader: false },
    { id: 14, h: 11, w: 12, x: 12, y: 58, isHeader: false },
    { id: 13, h: 11, w: 12, x: 0, y: 69, isHeader: false },
    { id: 11, h: 11, w: 12, x: 12, y: 69, isHeader: false },
    { id: 15, h: 11, w: 24, x: 0, y: 80, isHeader: false },
  ],
  'b4': [
    { id: 20, h: 1, w: 24, x: 0, y: 91, isHeader: true },
    { id: 16, h: 11, w: 24, x: 0, y: 92, isHeader: false },
    { id: 18, h: 11, w: 12, x: 0, y: 103, isHeader: false }
  ],
  'b5': [
    { id: 17, h: 1, w: 24, x: 0, y: 114, isHeader: true },
    { id: 19, h: 11, w: 24, x: 0, y: 115, isHeader: false }
  ]
} as const;
