import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWidgetData } from '../src/tools/dashboard.js';

const sdkMocks = vi.hoisted(() => ({
  createSdkMock: vi.fn(),
  destroyMock: vi.fn(),
  sdkQueryGetWidgetDataMock: vi.fn(),
  sdkFilterApplyFilterMock: vi.fn(),
  sdkLinkageApplyLinkageMock: vi.fn(),
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
