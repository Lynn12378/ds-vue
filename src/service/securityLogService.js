import customAxios from "@/assets/libs/customAxios/index.js";

/**
 * 寫入 copy 行為安全日誌。
 * @param {Record<string, any>} [params={}] copy 行為參數。
 * @returns {Promise<any>} 安全日誌 API 回應。
 */
export function logCopyAction(params = {}) {
  return customAxios.get(
    "/ZZWeb/servlet/HttpDispatcher/ZZM0_0105/ctrlMsavelog",
    {
      params,
    }
  );
}
