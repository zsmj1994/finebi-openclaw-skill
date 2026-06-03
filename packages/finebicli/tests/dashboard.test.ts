import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWidgetData, resolveDashboardWidgets } from '../src/tools/dashboard.js';

const sdkMocks = vi.hoisted(() => ({
  createSdkMock: vi.fn(),
  destroyMock: vi.fn(),
  sdkQueryGetWidgetDataMock: vi.fn(),
  sdkFilterApplyFilterMock: vi.fn(),
  sdkLinkageApplyLinkageMock: vi.fn(),
  fineBIAuthFetchMock: vi.fn(),
}));

vi.mock('finebi-querydata-sdk', () => ({
  FineBIQueryDataSDK: {
    create: sdkMocks.createSdkMock,
  },
}));

vi.mock('../src/helpers.js', () => ({
  getConfig: vi.fn().mockResolvedValue({
    baseUrl: 'http://test.com',
    accessToken: 'access-key-123',
  }),
  fineBIAuthFetch: sdkMocks.fineBIAuthFetchMock,
}));

describe('Dashboard Tools - getWidgetData', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    sdkMocks.createSdkMock.mockResolvedValue({
      query: {
        getWidgetData: sdkMocks.sdkQueryGetWidgetDataMock,
      },
      filter: {
        applyFilter: sdkMocks.sdkFilterApplyFilterMock,
      },
      linkage: {
        applyLinkage: sdkMocks.sdkLinkageApplyLinkageMock,
      },
      destroy: sdkMocks.destroyMock,
    });
  });

  it('applies filter and linkage before querying widget data', async () => {
    const filter = { widgetId: 'filter-widget', value: { type: 1, value: ['East'] } };
    const linkage = {
      widgetId: 'source-widget',
      payload: {
        dId: 'area',
        fieldId: 'field-1',
        text: 'East',
        value: [{ dId: 'area', fieldId: 'field-1', text: 'East' }],
      },
    };
    const data = { rows: [{ value: 1 }] };

    sdkMocks.sdkFilterApplyFilterMock.mockResolvedValue(true);
    sdkMocks.sdkLinkageApplyLinkageMock.mockResolvedValue(true);
    sdkMocks.sdkQueryGetWidgetDataMock.mockResolvedValue(data);

    const result = await getWidgetData('dashboard-1', 'target-widget', filter, linkage);

    expect(sdkMocks.createSdkMock).toHaveBeenCalledWith({
      dashboardId: 'dashboard-1',
      finebiServerUrl: 'http://test.com',
    });
    expect(sdkMocks.sdkFilterApplyFilterMock).toHaveBeenCalledWith(filter);
    expect(sdkMocks.sdkLinkageApplyLinkageMock).toHaveBeenCalledWith('source-widget', linkage.payload);
    expect(sdkMocks.sdkQueryGetWidgetDataMock).toHaveBeenCalledWith('target-widget');
    expect(sdkMocks.destroyMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true, data });
  });
});

describe('Dashboard Tools - resolveDashboardWidgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns widget ids and display names for all data widgets in a dashboard', async () => {
    sdkMocks.fineBIAuthFetchMock.mockResolvedValue({
      data: {
        designConfigure: JSON.stringify({
          reportId: 'dashboard-1',
          reportName: 'Sales Dashboard',
          reportWidgets: {
            chart_wid: {
              title: 'Fallback Chart Title',
              realWidgetId: 'chart_real',
              type: 1,
            },
            table_wid: {
              title: 'Table Widget Title',
              realWidgetId: 'table_real',
              type: 1,
            },
            filter_wid: {
              title: 'Region Filter',
              realWidgetId: 'filter_real',
              type: 2,
            },
          },
          widgets: {
            chart_real: { name: 'Revenue Chart' },
          },
        }),
      },
    });

    const result = await resolveDashboardWidgets('dashboard-1');

    expect(sdkMocks.fineBIAuthFetchMock).toHaveBeenCalledWith(
      '/v5/design/report/pool/dashboard-1/param',
      { method: 'GET' }
    );
    expect(result).toEqual({
      success: true,
      data: {
        dashboardId: 'dashboard-1',
        dashboardName: 'Sales Dashboard',
        widgets: [
          {
            widgetId: 'chart_wid',
            name: 'Revenue Chart',
            title: 'Revenue Chart',
            realWidgetId: 'chart_real',
            type: 1,
          },
          {
            widgetId: 'table_wid',
            name: 'Table Widget Title',
            title: 'Table Widget Title',
            realWidgetId: 'table_real',
            type: 1,
          },
        ],
      },
    });
  });
});
