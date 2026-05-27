import customAxios from "@/assets/libs/customAxios/index.js";

/**
 * 發送通用請求設定。
 * @param {import('axios').AxiosRequestConfig} config axios 請求設定。
 * @returns {Promise<any>} API 回應資料。
 */
export function apiRequest(config) {
  return customAxios.request(config);
}

/**
 * 發送 GET 請求。
 * @param {string} url API 路徑。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 請求設定。
 * @returns {Promise<any>} API 回應資料。
 */
export function apiGet(url, config = {}) {
  return customAxios.get(url, config);
}

/**
 * 發送 POST 請求。
 * @param {string} url API 路徑。
 * @param {any} [data={}] 請求內容。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 請求設定。
 * @returns {Promise<any>} API 回應資料。
 */
export function apiPost(url, data = {}, config = {}) {
  return customAxios.post(url, data, config);
}

/**
 * 發送 PUT 請求。
 * @param {string} url API 路徑。
 * @param {any} [data={}] 請求內容。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 請求設定。
 * @returns {Promise<any>} API 回應資料。
 */
export function apiPut(url, data = {}, config = {}) {
  return customAxios.put(url, data, config);
}

/**
 * 發送 DELETE 請求。
 * @param {string} url API 路徑。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 請求設定。
 * @returns {Promise<any>} API 回應資料。
 */
export function apiDelete(url, config = {}) {
  return customAxios.delete(url, config);
}
