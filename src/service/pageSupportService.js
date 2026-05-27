import customAxios from "@/assets/libs/customAxios/index.js";

/**
 * 依功能代碼查詢 pageSupport 設定。
 * @param {string} funcId 功能代碼。
 * @returns {Promise<any>} pageSupport 查詢結果。
 */
export function fetchPageSupportByFuncId(funcId) {
  return customAxios.get("/ZZC0_0700/queryByFuncId", {
    params: { funcId },
  });
}

/**
 * 檢查 pageSupport 服務是否可用。
 * @returns {Promise<any>} 服務可用性結果。
 */
export function checkPageSupportAvailable() {
  return customAxios.get("/ZZC0_0700/available");
}
