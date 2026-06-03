import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { QueryAPI } from '../dist/index.js';

const originalFetch = globalThis.fetch;
const originalToken = process.env.FINE_ACCESS_TOKEN;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalToken === undefined) {
    delete process.env.FINE_ACCESS_TOKEN;
  } else {
    process.env.FINE_ACCESS_TOKEN = originalToken;
  }
});

function createQueryApi(fetchBodies) {
  process.env.FINE_ACCESS_TOKEN = 'test-token';
  globalThis.fetch = async (_url, init) => {
    fetchBodies.push(JSON.parse(init.body));
    return {
      ok: true,
      async json() {
        return {
          perform: 'large-payload',
          data: {
            resultType: 'CHART',
            shared: { axis: ['x'] },
            geoms: [
              {
                type: 'interval',
                options: { roundRadius: 0, borderColor: '#FFFFFF' },
                dataModel: { fields: ['a'] },
              },
            ],
            tableData: { rows: Array.from({ length: 10 }, (_, index) => index) },
            unnecessary: 'large-field',
          },
        };
      },
    };
  };

  const context = {
    window: {
      BI: {
        Utils: {
          getWidgetCalculationById() {
            return { queryInfo: { fields: ['a'] } };
          },
        },
      },
    },
    document: {},
    dom: {},
    finebiServerUrl: 'https://finebi.example.com/',
  };
  const templateHelper = {
    getWidgetHelper() {
      return {};
    },
    getReportId() {
      return 'report-1';
    },
  };

  return new QueryAPI(context, templateHelper);
}

describe('QueryAPI.getWidgetData', () => {
  it('compacts chart response data by default', async () => {
    const fetchBodies = [];
    const api = createQueryApi(fetchBodies);

    const result = await api.getWidgetData('widget-1');

    assert.deepEqual(result.data, {
      resultType: 'CHART',
      shared: { axis: ['x'] },
      geoms: [{ type: 'interval', dataModel: { fields: ['a'] } }],
    });
    assert.equal('compact' in fetchBodies[0], false);
  });

  it('allows response compaction to be disabled explicitly', async () => {
    const fetchBodies = [];
    const api = createQueryApi(fetchBodies);

    const result = await api.getWidgetData('widget-1', { compact: false });

    assert.deepEqual(result.data, {
      resultType: 'CHART',
      shared: { axis: ['x'] },
      geoms: [
        {
          type: 'interval',
          options: { roundRadius: 0, borderColor: '#FFFFFF' },
          dataModel: { fields: ['a'] },
        },
      ],
      tableData: { rows: Array.from({ length: 10 }, (_, index) => index) },
      unnecessary: 'large-field',
    });
    assert.equal('compact' in fetchBodies[0], false);
  });
});
