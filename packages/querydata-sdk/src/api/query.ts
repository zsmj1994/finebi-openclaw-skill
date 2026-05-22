import { FineBIContext, QueryOptions } from '../types';

export class QueryAPI {
  private context: FineBIContext;
  private templateHelper: any;

  constructor(context: FineBIContext, templateHelper: any) {
    this.context = context;
    this.templateHelper = templateHelper;
  }

  /**
   * Query dashboard data.
   */
  public async getDashboardData(options: QueryOptions): Promise<any> {
    const { window } = this.context;

    if (!window.BI) {
      throw new Error('FineBI SDK (window.BI) not found in the simulated environment.');
    }

    try {
      console.log(`Querying data for dashboard: ${options.dashboardId}`);
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error querying dashboard data:', error);
      throw error;
    }
  }

  /**
   * Query widget data.
   */
  public async getWidgetData(wId: string): Promise<any> {
    const { window } = this.context;
    const BI = window.BI;

    if (!window.BI) {
      throw new Error('FineBI SDK (window.BI) not found in the simulated environment.');
    }

    const templateHelper = this.templateHelper;
    const widgetHelper = templateHelper.getWidgetHelper(wId);
    const widgetBeanData = BI.Utils.getWidgetCalculationById(widgetHelper, {});
    const serverUrl = this.context.finebiServerUrl.replace(/\/$/, '');
    const reportId = templateHelper.getReportId();
    const token = process.env.FINE_ACCESS_TOKEN;

    if (!token) {
      throw new Error('[FineBI SDK] Missing required environment variable FINE_ACCESS_TOKEN');
    }

    const url = `${serverUrl}/v5/design/widget/data?reportId=${reportId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fine-Access-Key': token,
      },
      body: JSON.stringify(widgetBeanData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request widget data failed: ${response.status} ${response.statusText}. ${errorText}`);
    }

    return response.json();
  }
}
