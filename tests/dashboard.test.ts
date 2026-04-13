import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dashboardTools from '../src/tools/dashboard.js';
import * as subjectTools from '../src/tools/subject.js';
import { setDashboardStyle } from '../src/tools/dashboard.js';
import { fineBIAuthFetch } from '../src/helpers.js';

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
      expect.anything(),
      expect.stringContaining('/pool/'),
      expect.objectContaining({ method: 'GET' })
    );

    // Verify enterSubjectEdit was called
    expect(subjectTools.enterSubjectEdit).toHaveBeenCalledWith('sub-123');

    // Verify fineBIAuthFetch was called to save with correct headers
    expect(fineBIAuthFetch).toHaveBeenLastCalledWith(
      expect.anything(),
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
