import pageUiPure from "@/assets/utils/legacy/pageUiPure.js";
import msgDisplayerUtil from "@/assets/utils/legacy/msgDisplayer.js";
import rptUtilPure from "@/assets/utils/legacy/rptUtilPure.js";
import CSRUtil from "@/assets/utils/legacy/CSRUtil.js";

export const {
  getType,
  isBasicType,
  isArray,
  isNotEmptyArray,
  isFunction,
  isObject,
  isString,
  isNumeric,
  trim,
  lTrim,
  rTrim,
  stringToArray,
  arrayToString,
  getSpan,
  setSpan,
  resolveContentMode,
  buildDefaultColumnProps,
  resolveButtonDisabledMap,
} = pageUiPure;

/**
 * 安全讀取巢狀欄位值。
 * @param {any} source 來源物件。
 * @param {string|string[]} path 欄位路徑。
 * @param {any} [fallbackValue=undefined] 讀取失敗時回傳值。
 * @returns {any} 讀取到的值或 fallback。
 */
export function safeGet(source, path, fallbackValue = undefined) {
  if (!path) {
    return source;
  }

  const parts = Array.isArray(path) ? path : String(path).split(".");
  let cursor = source;

  for (let i = 0; i < parts.length; i += 1) {
    const key = parts[i];
    if (cursor === null || cursor === undefined || !(key in Object(cursor))) {
      return fallbackValue;
    }
    cursor = cursor[key];
  }

  return cursor;
}

/**
 * 深拷貝資料，避免共享參照被誤改。
 * @template T
 * @param {T} value 原始資料。
 * @returns {T} 複製後資料。
 */
export function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

/**
 * 將字串或陣列輸入轉為陣列。
 * @param {any} value 輸入值。
 * @param {string} [delimiter=","] 分隔符號。
 * @returns {Array<any>} 轉換後陣列。
 */
export function toArray(value, delimiter = ",") {
  return stringToArray(value, delimiter);
}

/**
 * 將陣列轉為逗號字串。
 * @param {Array<any>} value 輸入陣列。
 * @returns {string} 逗號字串。
 */
export function toCommaString(value) {
  return arrayToString(value);
}

/**
 * 取得 legacy 回應中的 ErrMsg 區塊。
 * @param {any} response API 回應。
 * @returns {any} ErrMsg 物件。
 */
export function getReturnMessage(response) {
  return CSRUtil.getReturnMessage(response);
}

/**
 * 將 legacy 訊息資料標準化。
 * @param {any} messages 原始訊息資料。
 * @returns {Array<any>} 正規化訊息陣列。
 */
export function normalizeLegacyMessages(messages) {
  return msgDisplayerUtil.normalizeLegacyMessages(messages);
}

/**
 * 依 legacy 規則組出 alert 訊息文字。
 * @param {any} messages 原始訊息資料。
 * @returns {string} alert 字串。
 */
export function buildLegacyAlertMessage(messages) {
  return msgDisplayerUtil.buildLegacyAlertMessage(messages);
}

/**
 * 建立底部通知欄 payload。
 * @param {any} messages 原始訊息資料。
 * @returns {any} 底部通知 payload。
 */
export function buildBottomNotifyPayload(messages) {
  return msgDisplayerUtil.buildBottomNotifyPayload(messages);
}

/**
 * 判斷目標型別是否需要清空底部訊息。
 * @param {string} targetType 目標型別。
 * @returns {boolean} 是否需要清空。
 */
export function shouldClearBottomMsgByTargetType(targetType) {
  return msgDisplayerUtil.shouldClearBottomMsgByTargetType(targetType);
}

/**
 * 依 URL 推導報表 webName。
 * @param {string} locationHref 當前網址。
 * @returns {{useBig5EncodeServer:boolean,webName:string}} webName 推導結果。
 */
export function resolveReportWebName(locationHref) {
  return rptUtilPure.resolveWebName(locationHref);
}

/**
 * 取出 legacy 錯誤訊息文字。
 * @param {any} response API 回應。
 * @returns {string} 錯誤訊息字串。
 */
export function extractLegacyErrorMessage(response) {
  return rptUtilPure.extractLegacyErrorMessage(response);
}

/**
 * 建立報表 hidden 參數清單。
 * @param {Record<string, any>} [options={}] 報表參數。
 * @returns {Array<{name:string,value:any}>} hidden 參數清單。
 */
export function buildReportParameterEntries(options = {}) {
  return rptUtilPure.buildPrintParameterEntries(options);
}

/**
 * 建立條碼 URL。
 * @param {Record<string, any>} [options={}] 條碼參數。
 * @param {string} [webName] webName。
 * @returns {string} 條碼 URL。
 */
export function buildBarcodeUrl(options = {}, webName) {
  return rptUtilPure.buildBarcodeUrl(options, webName);
}

/**
 * 合併來源物件到目標物件，僅覆蓋已定義值。
 * @param {Record<string, any>} [target={}] 目標物件。
 * @param {Record<string, any>} [source={}] 來源物件。
 * @returns {Record<string, any>} 合併後物件。
 */
export function mergeDefined(target = {}, source = {}) {
  const output = { ...target };
  const entries = Object.entries(source);

  for (let i = 0; i < entries.length; i += 1) {
    const [key, value] = entries[i];
    if (value !== undefined) {
      output[key] = value;
    }
  }

  return output;
}

const commonV2 = {
  getType,
  isBasicType,
  isArray,
  isNotEmptyArray,
  isFunction,
  isObject,
  isString,
  isNumeric,
  trim,
  lTrim,
  rTrim,
  stringToArray,
  arrayToString,
  getSpan,
  setSpan,
  resolveContentMode,
  buildDefaultColumnProps,
  resolveButtonDisabledMap,
  safeGet,
  deepClone,
  toArray,
  toCommaString,
  getReturnMessage,
  normalizeLegacyMessages,
  buildLegacyAlertMessage,
  buildBottomNotifyPayload,
  shouldClearBottomMsgByTargetType,
  resolveReportWebName,
  extractLegacyErrorMessage,
  buildReportParameterEntries,
  buildBarcodeUrl,
  mergeDefined,
};

export default commonV2;
