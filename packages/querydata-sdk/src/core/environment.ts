import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { JSDOM, VirtualConsole } from 'jsdom';

export interface EnvironmentOptions {
  dashboardId: string;
  finebiServerUrl: string;
  scripts?: string[];
  html?: string;
  baseUrl?: string;
}

interface BrowserEnvironment {
  window: any;
  document: Document;
  dom: JSDOM;
  options: EnvironmentOptions;
}

export async function createBrowserEnvironment(options: EnvironmentOptions): Promise<BrowserEnvironment> {
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

  if (typeof window.HTMLCanvasElement !== 'undefined') {
    window.HTMLCanvasElement.prototype.getContext = function () {
      return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Array(w * h * 4) }),
        putImageData: () => {},
        createImageData: () => [],
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 10 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
      } as any;
    };
  }

  ['window', 'document', 'navigator', 'location'].forEach((prop) => {
    Object.defineProperty(globalThis, prop, {
      value: (window as Record<string, unknown>)[prop],
      writable: true,
      configurable: true
    });
  });

  const dashboardEnv = await initDashboardDesignConfigure(options.dashboardId, options.finebiServerUrl);
  console.log('[FineBI SDK] Dashboard design environment extracted.');

  const customPoolData = await initDashboardCustomPoolEnv(options.dashboardId, options.finebiServerUrl);
  console.log('[FineBI SDK] Dashboard custom pool loaded.');

  const windowWithBI = window as any;
  windowWithBI.BI = Object.assign(windowWithBI.BI || {}, dashboardEnv.BI);
  windowWithBI.BI.pool = customPoolData;
  (globalThis as any).BI = windowWithBI.BI;

  if (options.scripts && options.scripts.length > 0) {
    await loadDependencies(window, options.scripts, options.finebiServerUrl);
  }

  return {
    window,
    document: window.document,
    dom,
    options
  };
}

export async function initDashboardDesignConfigure(dashboardId: string, serverUrl: string) {
  const url = `${serverUrl}/webroot/decision/link/035I`;
  console.log(`[FineBI SDK] Fetching dashboard page: ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard page: ${res.status} ${res.statusText}`);
  }

  const htmlText = await res.text();
  const dom = new JSDOM(htmlText);
  const inlineScripts = dom.window.document.querySelectorAll('script:not([src])');
  let targetScriptContent = '';

  for (const script of inlineScripts) {
    if (script.textContent) {
      targetScriptContent += `${script.textContent}\n`;
    }
  }

  if (!targetScriptContent) {
    throw new Error('No inline dashboard script was found in the response HTML.');
  }

  const sandbox: Record<string, any> = {
    window: {},
    document: { title: '' },
    console,
  };
  sandbox.BI = sandbox.window.BI = {};
  sandbox.Dec = sandbox.window.Dec = {};

  const context = vm.createContext(sandbox);
  try {
    const script = new vm.Script(targetScriptContent);
    script.runInContext(context);
  } catch (error) {
    console.error('[FineBI SDK] Failed to execute dashboard inline script.', error);
  }

  const biProperties = Object.keys(sandbox.window.BI || {}).length > 0
    ? sandbox.window.BI
    : (sandbox.window.Dec || {});

  console.log(`[FineBI SDK] Extracted dashboard globals: ${Object.keys(biProperties).join(', ')}`);

  return {
    rawScript: targetScriptContent,
    BI: biProperties
  };
}

export async function initDashboardCustomPoolEnv(dashboardId: string, serverUrl: string): Promise<any> {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBVGFkbWluIiwidGVuYW50SWQiOiJkZWZhdWx0IiwiaXNzIjoiZmFucnVhbiIsImRlc2NyaXB0aW9uIjoiQVRhZG1pbihBVGFkbWluKSIsImV4cCI6MTc3NjM5MjgzNCwiaWF0IjoxNzc2Mzg5MjM0LCJqdGkiOiJsMStEQU1sRTU4LzRWYUk0c0NLd1JpVkI5WC9IeTl6OXpTQWZpUDc2bGhNcFFvTjcifQ.h-tvOl_Yiu3MhocB8H7lrPKr9TF-PSJ8iH6VkOR3sig';
  const url = `${serverUrl}/webroot/decision/v5/design/report/pool/custom?reportId=${dashboardId}&entryType=1&fine_auth_token=${token}`;
  console.log(`[FineBI SDK] Fetching dashboard custom pool: ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch custom pool: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.data;
}

export async function loadDependencies(window: any, scripts: string[], serverUrl?: string): Promise<void> {
  console.log(`[FineBI SDK] Loading ${scripts.length} script dependencies...`);

  for (const scriptPath of scripts) {
    try {
      let code = '';
      const isUrl = scriptPath.startsWith('http://') || scriptPath.startsWith('https://') || scriptPath.startsWith('//');
      const isServerConfigured = !!serverUrl && (serverUrl.startsWith('http://') || serverUrl.startsWith('https://'));

      if (isUrl) {
        const targetUrl = scriptPath.startsWith('//') ? `http:${scriptPath}` : scriptPath;
        console.log(`[FineBI SDK] Downloading remote script: ${targetUrl}`);
        const res = await fetch(targetUrl);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        code = await res.text();
      } else if (isServerConfigured && serverUrl) {
        const targetUrl = new URL(scriptPath, serverUrl).href;
        console.log(`[FineBI SDK] Downloading server script: ${targetUrl}`);
        const res = await fetch(targetUrl);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        code = await res.text();
      } else {
        const basePath = serverUrl || '';
        const fullPath = basePath ? path.resolve(basePath, scriptPath) : path.resolve(scriptPath);
        console.log(`[FineBI SDK] Reading local script: ${fullPath}`);

        if (!fs.existsSync(fullPath)) {
          console.warn(`[FineBI SDK] Local script not found: ${fullPath}`);
          continue;
        }

        code = fs.readFileSync(fullPath, 'utf-8');
      }

      const scriptEl = window.document.createElement('script');
      scriptEl.textContent = code;
      window.document.head.appendChild(scriptEl);
    } catch (error) {
      console.warn(`[FineBI SDK] Failed to load script ${scriptPath}:`, error);
    }
  }

  console.log('[FineBI SDK] All dependencies loaded.');
}
