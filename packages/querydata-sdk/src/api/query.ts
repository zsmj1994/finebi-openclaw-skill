import { FineBIContext, QueryOptions } from '../types';

export class QueryAPI {
  private context: FineBIContext;
  private templateHelper: any;

  constructor(context: FineBIContext, templateHelper: any) {
    this.context = context;
    this.templateHelper = templateHelper;
  }

  /**
   * 查询仪表板数据
   */
  public async getDashboardData(options: QueryOptions): Promise<any> {
    const { window } = this.context;

    // 假设 FineBI 的前端对象挂载在 window.BI 上
    if (!window.BI) {
      throw new Error('FineBI SDK (window.BI) not found in the simulated environment.');
    }

    try {
      // 模拟前端调用组件获取数据的逻辑，这里需要替换成真实的 FineBI 获取数据的方法
      // 例如： return await window.BI.Dashboard.getData(options);
      console.log(`Querying data for dashboard: ${options.dashboardId}`);
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error querying dashboard data:', error);
      throw error;
    }
  }

  /**
 * 查询仪表板组件数据
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
    const token = process.env.FINE_AUTH_TOKEN;
    if (!token) {
      throw new Error('[FineBI SDK] 缺少环境变量 FINE_AUTH_TOKEN');
    }
    const url = `${serverUrl}/v5/design/widget/data?reportId=${reportId}&fine_auth_token=${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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