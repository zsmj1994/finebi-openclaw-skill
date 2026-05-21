import path from 'path';
import { createBrowserEnvironment, EnvironmentOptions } from './core/environment';
import { QueryAPI } from './api/query';
import { FilterAPI } from './api/filter';
import { LinkageAPI } from './api/linkage';
import { FineBIContext } from './types';
import { initTemplateHelper } from './helper/templatehelper';

export class FineBIQueryDataSDK {
  private context: FineBIContext;
  private templateHelper: any;
  public query: QueryAPI;
  public filter: FilterAPI;
  public linkage: LinkageAPI;

  private constructor(context: FineBIContext, templateHelper: any) {
    this.context = context;
    this.templateHelper = templateHelper;
    this.query = new QueryAPI(this.context, this.templateHelper);
    this.filter = new FilterAPI(this.context, this.templateHelper);
    this.linkage = new LinkageAPI(this.context, this.templateHelper);
  }

  /**
   * 创建并初始化 SDK 实例
   * @param options 用于准备模拟运行环境的配置
   */
  public static async create(options: EnvironmentOptions): Promise<FineBIQueryDataSDK> {
    const env = await createBrowserEnvironment({
      scripts: [
        path.resolve(__dirname, '../assets/fineui-base.min.js'),
        path.resolve(__dirname, '../assets/BICst.js'),
        path.resolve(__dirname, '../assets/i18n.js'),
        path.resolve(__dirname, '../assets/static.min.js'),
      ],
      ...options
    });
    const context: FineBIContext = {
      window: env.window,
      document: env.document,
      dom: env.dom,
      finebiServerUrl: env.options.finebiServerUrl
    };
    const templateHelper = initTemplateHelper(context);
    console.log('FineBI Query Data SDK initialized successfully.');
    return new FineBIQueryDataSDK(context, templateHelper);
  }

  /**
   * 销毁并释放资源
   */
  public destroy() {
    this.context.window.close();
  }
}

export * from './types';
export * from './core/environment';
export * from './api/query';
export * from './api/filter';
export * from './api/linkage';
