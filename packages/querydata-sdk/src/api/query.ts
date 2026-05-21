import { FineBIContext, QueryOptions } from '../types';

export class QueryAPI {
  private context: FineBIContext;
  private templateHelper: any;

  constructor(context: FineBIContext, templateHelper: any) {
    this.context = context;
    this.templateHelper = templateHelper;
  }

  /**
   * 閺屻儴顕楁禒顏囥€冮弶鎸庢殶閹?   */
  public async getDashboardData(options: QueryOptions): Promise<any> {
    const { window } = this.context;

    // 閸嬪洩顔?FineBI 閻ㄥ嫬澧犵粩顖氼嚠鐠炩剝瀵曟潪钘夋躬 window.BI 娑?    if (!window.BI) {
      throw new Error('FineBI SDK (window.BI) not found in the simulated environment.');
    }

    try {
      // 濡剝瀚欓崜宥囶伂鐠嬪啰鏁ょ紒鍕閼惧嘲褰囬弫鐗堝祦閻ㄥ嫰鈧槒绶敍宀冪箹闁插矂娓剁憰浣规禌閹广垺鍨氶惇鐔风杽閻?FineBI 閼惧嘲褰囬弫鐗堝祦閻ㄥ嫭鏌熷▔?      // 娓氬顩ч敍?return await window.BI.Dashboard.getData(options);
      console.log(`Querying data for dashboard: ${options.dashboardId}`);
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error querying dashboard data:', error);
      throw error;
    }
  }

  /**
 * 閺屻儴顕楁禒顏囥€冮弶璺ㄧ矋娴犺埖鏆熼幑? */
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
      throw new Error('[FineBI SDK] 缂傚搫鐨悳顖氼暔閸欐﹢鍣?FINE_AUTH_TOKEN');
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
