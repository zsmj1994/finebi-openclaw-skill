import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dashboardTools from '../src/tools/dashboard.js';
import * as subjectTools from '../src/tools/subject.js';
import { getWidgetData, setDashboardStyle } from '../src/tools/dashboard.js';
import { fineBIAuthFetch } from '../src/helpers.js';

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

// Mocking dependencies
vi.mock('../src/tools/subject.js', () => ({
  enterSubjectEdit: vi.fn(),
}));

vi.mock('../src/helpers.js', () => ({
  getConfig: vi.fn().mockResolvedValue({
    baseUrl: 'http://test.com',
    username: 'admin',
    password: 'password',
  }),
  fineBIAuthFetch: vi.fn(),
}));

describe('Dashboard Tools - setDashboardStyle', () => {
  const dashboardId = 'test-id';
  const styleData = { color: 'red' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update dashboard style', async () => {
    const mockConfig = {
      subjectId: 'sub-123',
      designConfigure: { existing: 'data' }
    };
    
    const mockSession = {
      success: true,
      data: {
        subjectEditSessionId: 'session-456'
      }
    };

    // Mock fineBIAuthFetch to return different values based on the call
    // First call for getDashboardDesignConfigure, second for the final save
    vi.mocked(fineBIAuthFetch)
      .mockResolvedValueOnce({ data: mockConfig } as any) // Response for getDashboardDesignConfigure
      .mockResolvedValueOnce({ success: true } as any);   // Response for the final save

    vi.mocked(subjectTools.enterSubjectEdit).mockResolvedValue(mockSession as any);

    const result = await setDashboardStyle(dashboardId, styleData);

    // Verify fineBIAuthFetch was called to get current config
    expect(fineBIAuthFetch).toHaveBeenCalledWith(
      expect.stringContaining('/pool/'),
      expect.objectContaining({ method: 'GET' })
    );

    // Verify enterSubjectEdit was called
    expect(subjectTools.enterSubjectEdit).toHaveBeenCalledWith('sub-123');

    // Verify fineBIAuthFetch was called to save with correct headers
    expect(fineBIAuthFetch).toHaveBeenLastCalledWith(
      expect.stringContaining('/cache/report/save'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          subjecteditsessionid: 'session-456'
        })
      })
    );
    expect(result.success).toBe(true);
  });

  it('should return error if enterSubjectEdit fails', async () => {
    vi.mocked(fineBIAuthFetch).mockResolvedValueOnce({
      data: { subjectId: 'sub-123' }
    } as any);
    
    vi.mocked(subjectTools.enterSubjectEdit).mockResolvedValue({
      success: false,
      error: 'Session error'
    } as any);

    const result = await setDashboardStyle(dashboardId, styleData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Session error');
  });
});

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
