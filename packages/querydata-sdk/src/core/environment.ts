import { JSDOM, VirtualConsole } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
import { merge } from 'lodash-es';

export interface EnvironmentOptions {
  dashboardId: string;
  finebiServerUrl: string; // 支持配置在线地址，如 http://192.168.5.172:10998
  scripts?: string[];
  html?: string;
  baseUrl?: string;
}

/**
 * 设置模拟的 Web 端运行环境
 */
export async function createBrowserEnvironment(options: EnvironmentOptions) {
  const html = options.html || `<!DOCTYPE html><html><body>
  <script>
      window.BI = window.BI || {};
      BI.fineServletURL = "/webroot/decision";
  </script>
 <div id="app"></div>
 </body></html>`;

  // 用于捕获控制台输出
  const virtualConsole = new VirtualConsole();
  virtualConsole.sendTo(console);

  const dom = new JSDOM(html, {
    url: options.baseUrl || 'http://localhost/',
    runScripts: 'dangerously',
    resources: 'usable',
    virtualConsole
  });

  const { window } = dom;

  // 拦截并模拟 Canvas API，防止在没装 canvas 依赖时抛出 Not implemented 错误
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
        measureText: () => ({ width: 10 }), // 随便给个默认宽度防止后续数学运算出错
        transform: () => { },
        rect: () => { },
        clip: () => { },
      };
    };
  }

  // 注入全量变量以便某些 script 依赖
  // 使用 Object.defineProperty 防止较新 Node 版本中 global.navigator 是 readonly 导致报错
  ['window', 'document', 'navigator', 'location'].forEach(prop => {
    Object.defineProperty(global, prop, {
      value: (window as any)[prop],
      writable: true,
      configurable: true
    });
  });

  // 捕获 jsdom 内脚本运行时错误（如 fineui 内部的 eval/new Function 求值失败），
  // 防止 reportException 在无监听器时将错误往外抛导致进程退出
  (window as any).addEventListener('error', (event: any) => {
    console.warn('[JSDOM Script Error]', event.message ?? event);
    event.preventDefault?.();
  });

  // ========== 1. 提取并注入环境变配置 ==========
  const dashboardEnv = await initDashboardDesignConfigure(options.dashboardId, options.finebiServerUrl);
  console.log(`[FineBI SDK] 仪表板环境变量提取完成。`);

  // 将提取的属性全部挂载到模拟的 window.BI 以及 window.Dec 上
  (window as any).BI = Object.assign((window as any).BI || {}, dashboardEnv.BI);

  // 映射到 global，方便直接访问全局变量
  const BI = (global as any).BI = (window as any).BI;

  BI.pool = BI.pool || {};
  BI.pool.confPool = BI.confPool || {};
  BI.pool.systemPool = BI.systemPool || {};

  // ========== 2. 加载指定的后续依赖包 ==========
  if (options.scripts && options.scripts.length > 0) {
    await loadDependencies(window, options.scripts, options.finebiServerUrl);
  }

  // 获取 custom pool 缓存数据
  const customPoolData = await initDashboardCustomPoolEnv(options.dashboardId, options.finebiServerUrl);
  console.log(`[FineBI SDK] 仪表板 Custom Pool 数据获取完成。`);
  // 注入 pool 变量（通过合并避免覆盖之前加载的参数）
  BI.pool = merge(BI.pool, customPoolData);

  return {
    window,
    document: window.document,
    dom,
    options
  };
}

function getFineAuthToken() {
  const token = process.env.FINE_AUTH_TOKEN;
  if (!token) {
    throw new Error('[FineBI SDK] 缺少环境变量 FINE_AUTH_TOKEN');
  }
  return token;
}



/**
 * 初始化仪表板配置环境
 * 请求仪表板 pool param 接口，解析返回的 JSON 并提取 BI 属性
 */
export async function initDashboardDesignConfigure(dashboardId: string, serverUrl: string) {
  const token = getFineAuthToken();
  const url = `${serverUrl}/v5/design/report/pool/${dashboardId}/param?entryType=1&fine_auth_token=${token}`;
  const basicUrl = `${serverUrl}/v5/design/report/pool/basic?fine_auth_token=${token}`;
  console.log(`[FineBI SDK] 正在获取仪表板配置信息`);
  console.log(`[FineBI SDK] 正在获取仪表板基础配置信息`);

  let res: Response, basicRes: Response;
  try {
    [res, basicRes] = await Promise.all([fetch(url), fetch(basicUrl)]);
  } catch (err) {
    throw new Error(`[FineBI SDK] 网络请求失败，请检查 FINEBI_BASE_URL、FINE_AUTH_TOKEN 和网络连通性: ${(err as Error).message}`);
  }
  if (!res.ok) {
    throw new Error(`请求仪表板配置信息失败: ${res.status} ${res.statusText}`);
  }
  if (!basicRes.ok) {
    throw new Error(`请求仪表板基础配置信息失败: ${basicRes.status} ${basicRes.statusText}`);
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

  // basePool / designConfigure / reportName 是 JSON 字符串，需要反序列化
  const parseJson = (str: string, key: string) => {
    try {
      return JSON.parse(str);
    } catch (err) {
      console.warn(`[FineBI SDK] 解析字段 ${key} 失败，将保留原始字符串:`, err);
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
 * 获取仪表板customPool
 * 访问 /v5/cache/report/pool/custom 接口，取回数据塞入 BI.pool
 */
export async function initDashboardCustomPoolEnv(dashboardId: string, serverUrl: string) {
  const token = getFineAuthToken();
  const url = `${serverUrl}/v5/design/report/pool/custom?reportId=${dashboardId}&entryType=1&fine_auth_token=${token}`;
  console.log(`[FineBI SDK] 正在获取仪表板Pool`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`请求 custom pool 失败: ${res.status} ${res.statusText}`);
  }

  // 这个接口一般直接返回 JSON
  const data = await res.json();

  return data.data;
}

/**
 * 加载指定的后续依赖包
 * 下载或者读取本地的依赖 js 并挂载到给定的 window 环境上
 */
export async function loadDependencies(window: any, scripts: string[], serverUrl?: string) {
  console.log(`[FineBI SDK] 开始加载 ${scripts.length} 个 JS 依赖文件...`);
  for (const scriptPath of scripts) {
    try {
      let code = '';
      const isUrl = scriptPath.startsWith('http://') || scriptPath.startsWith('https://') || scriptPath.startsWith('//');
      const isServerConfigured = serverUrl && !path.isAbsolute(scriptPath) && !scriptPath.startsWith('./') && (serverUrl.startsWith('http://') || serverUrl.startsWith('https://'));

      if (isUrl) {
        const targetUrl = scriptPath.startsWith('//') ? `http:${scriptPath}` : scriptPath;
        console.log(`[FineBI SDK] 正在拉取在线脚本: ${targetUrl}`);
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        code = await res.text();
        console.log(`[FineBI SDK] 加载成功: ${targetUrl}`);
      } else if (isServerConfigured) {
        // 如果给了在线基准地址，则拼接 URL
        const targetUrl = new URL(scriptPath, serverUrl!).href;
        console.log(`[FineBI SDK] 正在拉取拼接脚本: ${targetUrl}`);
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        code = await res.text();
        console.log(`[FineBI SDK] 加载成功: ${targetUrl}`);
      } else {
        // 保留作为本地路径计算的兼容
        const basePath = '';
        const fullPath = basePath ? path.resolve(basePath, scriptPath) : path.resolve(scriptPath);
        console.log(`[FineBI SDK] 正在读取本地脚本: ${fullPath}`);

        if (fs.existsSync(fullPath)) {
          code = fs.readFileSync(fullPath, 'utf-8');
          console.log(`[FineBI SDK] 读取成功: ${fullPath}`);
        } else {
          console.warn(`[Warning] Local script not found: ${fullPath}`);
          continue;
        }
      }

      const scriptEl = window.document.createElement('script');
      scriptEl.textContent = code;
      window.document.head.appendChild(scriptEl);
    } catch (error) {
      console.warn(`[Warning] Failed to load script ${scriptPath}:`, error);
    }
  }
  console.log(`[FineBI SDK] 所有依赖加载并挂载完毕。`);
}
