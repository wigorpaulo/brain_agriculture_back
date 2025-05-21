export interface DashboardChartItem {
  label: string;
  value: number;
}

export interface DashboardCharts {
  byState: DashboardChartItem[];
  byPlantedCulture: DashboardChartItem[];
  bySoilUse: DashboardChartItem[];
}

export interface DashboardResponseDto {
  totalRuralProperties: number;
  totalAreal: number;
  charts: DashboardCharts;
}
