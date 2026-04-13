/**
 * Dataset and report tools for FineBI.
 */
import { randomUUID } from "node:crypto";

import type {
  Dataset,
  QueryResult,
  ToolResult,
  DataRow,
} from "../types.js";
import { getConfig, fineBIAuthFetch } from "../helpers.js";



/**
 * Query/search for public datasets by keyword.
 *
 * @param params - Contains keyword, pageIndex, pageSize
 */
export async function queryDataset(params: {
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
} = {}): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const body: Record<string, any> = {
      filter: {
        itemTypes: [3],
      },
      sort: 0,
      privilege: "use",
      pageIndex: params.pageIndex || 1,
      pageSize: params.pageSize || 150,
    };

    if (params.keyword) {
      body.keyword = params.keyword;
    }

    const data = await fineBIAuthFetch(config, "/v5/conf/packages/search", {
      method: "POST",
      data: body,
    });

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 预览数据数据集数据.
 *
 * @param params - Contains tableName, pageIndex, limit, keyword
 */
export async function previewDatasetData(params: {
  tableName: string;
  keyword?: string;
  limit?: number;
  pageIndex?: number;
}): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const taskId = randomUUID();
    const body = {
      keyword: params.keyword || "",
      limit: params.limit || 5000,
      pageIndex: params.pageIndex || 1,
      tableName: params.tableName,
    };

    const data = await fineBIAuthFetch(
      config,
      `/v5/conf/tables/fields/page?taskId=${taskId}`,
      {
        method: "POST",
        data: body,
      }
    );

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 获取公共数据的数据集列表
 *
 * @param params - Contains pageIndex, pageSize
 */
export async function getPublickDatasetsList(params: {
  pageIndex?: number;
  pageSize?: number;
} = {}): Promise<ToolResult<any>> {
  try {
    const config = await getConfig();
    const body = {
      filter: {
        itemTypes: [3],
      },
      sort: 0,
      privilege: "use",
      pageIndex: params.pageIndex || 1,
      pageSize: params.pageSize || 150,
    };

    const data = await fineBIAuthFetch(config, "/v5/conf/packages/list", {
      method: "POST",
      data: body,
    });

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
