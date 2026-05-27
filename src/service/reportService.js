import { apiPost } from "@/service/httpService.js";

const DEFAULT_CREATE_CSV_API_PATH = "/ZZWeb/servlet/HttpDispatcher/Report/executeCreateCsvFile";
const DEFAULT_CREATE_XLS_API_PATH = "/ZZWeb/servlet/HttpDispatcher/Report/executeCreateXlsFile";

/**
 * 呼叫通用報表任務 API。
 * @param {string} apiPath API 路徑。
 * @param {Record<string, any>} [payload={}] 請求內容。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 設定。
 * @returns {Promise<any>} API 回應資料。
 */
export function postReportTask(apiPath, payload = {}, config = {}) {
  if (typeof apiPath !== "string" || apiPath.trim() === "") {
    return Promise.reject(new Error("未提供報表 API 路徑"));
  }

  return apiPost(apiPath, payload, config);
}

/**
 * 執行報表前置檢核。
 * @param {string} apiPath 前置檢核 API 路徑。
 * @param {Record<string, any>} [payload={}] 檢核參數。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 設定。
 * @returns {Promise<any>} 檢核結果。
 */
export function requestReportPrecheck(apiPath, payload = {}, config = {}) {
  if (typeof apiPath !== "string" || apiPath.trim() === "") {
    return Promise.resolve({ skipped: true, reason: "no-precheck-api" });
  }

  return postReportTask(apiPath, payload, config);
}

/**
 * 建立 CSV 產檔任務。
 * @param {Record<string, any>} [payload={}] 任務參數。
 * @param {string} [apiPath=DEFAULT_CREATE_CSV_API_PATH] CSV 任務 API 路徑。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 設定。
 * @returns {Promise<any>} 任務建立結果。
 */
export function requestCreateCsvFile(
  payload = {},
  apiPath = DEFAULT_CREATE_CSV_API_PATH,
  config = {}
) {
  return postReportTask(apiPath, payload, config);
}

/**
 * 建立 XLS 產檔任務。
 * @param {Record<string, any>} [payload={}] 任務參數。
 * @param {string} [apiPath=DEFAULT_CREATE_XLS_API_PATH] XLS 任務 API 路徑。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 設定。
 * @returns {Promise<any>} 任務建立結果。
 */
export function requestCreateXlsFile(
  payload = {},
  apiPath = DEFAULT_CREATE_XLS_API_PATH,
  config = {}
) {
  return postReportTask(apiPath, payload, config);
}

const reportService = {
  postReportTask,
  requestReportPrecheck,
  requestCreateCsvFile,
  requestCreateXlsFile,
};

export default reportService;
