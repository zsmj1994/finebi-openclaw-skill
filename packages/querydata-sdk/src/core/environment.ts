import { JSDOM, VirtualConsole } from 'jsdom';
import { merge } from 'lodash-es';

export interface EnvironmentOptions {
  dashboardId: string;
  finebiServerUrl: string;
  inlineScripts?: string[];
  html?: string;
  baseUrl?: string;
}

/**
 * Set up a browser-like runtime for dashboard querying.
 */
export async function createBrowserEnvironment(options: EnvironmentOptions) {
  const html = options.html || `<!DOCTYPE html><html><body>
  <script>
      window.BI = window.BI || {};
      BI.fineServletURL = "/webroot/decision";
  </script>
 <div id="app"></div>
 </body></html>`;

  const virtualConsole = new VirtualConsole();
  virtualConsole.sendTo(console);

  const dom = new JSDOM(html, {
    url: options.baseUrl || 'http://localhost/',
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole
  });

  const { window } = dom;

  if (typeof (window as any).HTMLCanvasElement !== 'undefined') {
    (window as any).HTMLCanvasElement.prototype.getContext = function () {
      return {
        fillRect: () => { },
        clearRect: () => { },
        getImageData: (x: number, y: number, w: number, h: number) => ({ data: new Array(w * h * 4) }),
        putImageData: () => { },
        createImageData: () => [],
        setTransform: () => { },
        drawImage: () => { },
        save: () => { },
        fillText: () => { },
        restore: () => { },
        beginPath: () => { },
        moveTo: () => { },
        lineTo: () => { },
        closePath: () => { },
        stroke: () => { },
        translate: () => { },
        scale: () => { },
        rotate: () => { },
        arc: () => { },
        fill: () => { },
        measureText: () => ({ width: 10 }),
        transform: () => { },
        rect: () => { },
        clip: () => { },
      };
    };
  }

  ['window', 'document', 'navigator', 'location'].forEach(prop => {
    Object.defineProperty(global, prop, {
      value: (window as any)[prop],
      writable: true,
      configurable: true
    });
  });

  const dashboardEnv = await initDashboardDesignConfigure(options.dashboardId, options.finebiServerUrl);
  console.log('[FineBI SDK] Dashboard environment variables initialized.');

  (window as any).BI = Object.assign((window as any).BI || {}, dashboardEnv.BI);

  const BI = (global as any).BI = (window as any).BI;

  BI.pool = BI.pool || {};
  BI.pool.confPool = BI.confPool || {};
  BI.pool.systemPool = BI.systemPool || {};

  if (options.inlineScripts && options.inlineScripts.length > 0) {
    injectInlineScripts(window, options.inlineScripts);
  }

  const customPoolData = await initDashboardCustomPoolEnv(options.dashboardId, options.finebiServerUrl);
  console.log('[FineBI SDK] Custom pool data initialized.');
  BI.pool = merge(BI.pool, customPoolData);

  return {
    window,
    document: window.document,
    dom,
    options
  };
}

function getFineAccessToken() {
  const token = process.env.FINE_ACCESS_TOKEN;
  if (!token) {
    throw new Error('[FineBI SDK] Missing required environment variable FINE_ACCESS_TOKEN');
  }
  return token;
}

/**
 * Initialize dashboard design configuration.
 */
export async function initDashboardDesignConfigure(dashboardId: string, serverUrl: string) {
  const token = getFineAccessToken();
  const headers = {
    'X-Fine-Access-Key': token,
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  const url = `${serverUrl}/v5/design/report/pool/${dashboardId}/param?entryType=1`;
  const basicUrl = `${serverUrl}/v5/design/report/pool/basic`;
  console.log('[FineBI SDK] Fetching dashboard design configuration');
  console.log('[FineBI SDK] Fetching dashboard basic configuration');

  const [res, basicRes] = await Promise.all([
    fetch(url, { headers }),
    fetch(basicUrl, { headers })
  ]);

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard design configuration: ${res.status} ${res.statusText}`);
  }
  if (!basicRes.ok) {
    throw new Error(`Failed to fetch dashboard basic configuration: ${basicRes.status} ${basicRes.statusText}`);
  }

  const json = await res.json();
  const basicJson = await basicRes.json();
  const data = json.data as {
    lockedBy: string;
    reportName: string;
    basePool: string;
    designConfigure: string;
    sessionId: string;
    subjectId: string;
    theme: string;
    title: string;
  };
  const basicData = basicJson.data as {
    confPool: any;
    systemPool: any;
  };

  const parseJson = (str: string, key: string) => {
    try {
      return JSON.parse(str);
    } catch (err) {
      console.warn(`[FineBI SDK] Failed to parse ${key}, keeping original value.`, err);
      return str;
    }
  };

  const parseMaybeJson = (value: any, key: string) => {
    if (typeof value !== 'string') {
      return value;
    }
    return parseJson(value, key);
  };

  const biProperties = {
    basePool: parseJson(data.basePool, 'basePool'),
    designConfigure: parseJson(data.designConfigure, 'designConfigure'),
    reportName: parseJson(data.reportName, 'reportName'),
    confPool: parseMaybeJson(basicData?.confPool, 'confPool'),
    systemPool: parseMaybeJson(basicData?.systemPool, 'systemPool'),
    sessionId: data.sessionId,
    subjectId: data.subjectId,
    theme: data.theme,
    title: data.title,
    lockedBy: data.lockedBy,
  };

  return {
    BI: biProperties
  };
}

/**
 * Fetch dashboard custom pool data.
 */
export async function initDashboardCustomPoolEnv(dashboardId: string, serverUrl: string) {
  const token = getFineAccessToken();
  const url = `${serverUrl}/v5/design/report/pool/custom?reportId=${dashboardId}&entryType=1`;
  console.log('[FineBI SDK] Fetching dashboard custom pool');

  const res = await fetch(url, {
    headers: {
      'X-Fine-Access-Key': token,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch custom pool: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data;
}

function injectInlineScripts(window: any, scripts: readonly string[]) {
  for (const code of scripts) {
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = code;
    window.document.head.appendChild(scriptEl);
  }
}
