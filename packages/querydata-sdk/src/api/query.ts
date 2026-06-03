import { FineBIContext, WidgetDataOptions } from '../types';

export class QueryAPI {
  private context: FineBIContext;
  private templateHelper: any;

  constructor(context: FineBIContext, templateHelper: any) {
    this.context = context;
    this.templateHelper = templateHelper;
  }


  /**
   * Query widget data.
   */
  public async getWidgetData(wId: string, options: WidgetDataOptions = {}): Promise<any> {
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

    const json = await response.json();
    const { perform, ...rest } = json;
    if (options.compact !== false && rest.data?.resultType === 'CHART') {
      const { resultType, shared, geoms } = rest.data;
      const compactGeoms = Array.isArray(geoms)
        ? geoms.map((geom) => {
          if (!geom || typeof geom !== 'object') {
            return geom;
          }
          const { options: _options, ...restGeom } = geom;
          return restGeom;
        })
        : geoms;

      return {
        ...rest,
        data: { resultType, shared, geoms: compactGeoms },
      };
    }

    return rest;
  }
}
