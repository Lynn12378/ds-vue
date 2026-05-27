import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import CSRUtil from "@/assets/utils/legacy/CSRUtil.js";
import utility from "@/assets/utils/legacy/utility.js";
import dateUtils from "@/assets/utils/legacy/date.js";
import useLegacyCommon from "@/assets/utils/legacy/legacyCommon.js";

dayjs.extend(customParseFormat);

const legacyCommon = useLegacyCommon();

/**
 * 在千位數字前添加逗號。
 * @param {number|string} num 原始數字。
 * @returns {string} 格式化後字串。
 */
export function numberAddComma(num) {
  if (!num && num !== 0) {
    return "";
  }
  const comma = /\B(?=(\d{3})+(?!\d))/g;
  return num.toString().replace(comma, ",");
}

/**
 * 姓名遮蔽規則。
 * @param {string} str 原始姓名。
 * @returns {string} 遮蔽後字串。
 */
export function maskName(str) {
  if (str.length === 2) {
    return `${str[0]}*`;
  }

  if (str.length > 2) {
    const firstChar = str[0];
    const lastChar = str[str.length - 1];
    const maskedPart = "*".repeat(str.length - 2);
    return `${firstChar}${maskedPart}${lastChar}`;
  }

  return str;
}

/**
 * 地址遮蔽規則：阿拉伯數字（全形、半形）統一遮蔽。
 * @param {string} address 原始地址。
 * @returns {string} 遮蔽後地址。
 */
export function maskAddress(address) {
  return address.replace(/[\d０-９]/g, "*");
}

/**
 * 數字格式化（相容 legacy `$fmt`）。
 * @param {string|number} value 原始值。
 * @param {string} [pattern="#,###.####"] 格式樣板。
 * @param {boolean} [isInput=false] 是否輸入態格式化。
 * @returns {string|number} 格式化結果。
 */
export function formatNumber(value, pattern = "#,###.####", isInput = false) {
  return CSRUtil.$fmt(value, pattern, isInput);
}

/**
 * 金額格式化（保留 legacy `MoneyFormat` 行為）。
 * @param {string|number} value 原始值。
 * @returns {string} 金額字串。
 */
export function formatMoney(value) {
  return utility.MoneyFormat(String(value ?? ""));
}

/**
 * 以兩位小數輸出幣值格式。
 * @param {string|number} value 原始值。
 * @returns {string} 幣值字串。
 */
export function formatCurrency(value) {
  return utility.formatCurrency(value);
}

/**
 * 正規化時間欄位為 HHmmss。
 * @param {string} value 原始時間字串。
 * @returns {string} 正規化後時間。
 */
export function normalizeTimeText(value) {
  return utility.timeForTextfield(value);
}

/**
 * 清除全形空白。
 * @param {any} value 原始值。
 * @param {string} [keyword] 欄位關鍵字。
 * @param {boolean} [ignoreCase=false] 是否忽略大小寫。
 * @returns {any} 清理後結果。
 */
export function removeFullWidthSpace(value, keyword, ignoreCase = false) {
  if (keyword) {
    return utility.keyWordReplaceFullSpace(value, keyword, ignoreCase);
  }
  return utility.replaceFullSpace(value);
}

/**
 * 清除字串右側空白。
 * @param {any} value 原始值。
 * @returns {any} 清理後結果。
 */
export function trimRightSpace(value) {
  return utility.trimSpace(value);
}

/**
 * submit 前轉為大寫（相容 legacy 規則）。
 * @param {any} value 原始值。
 * @returns {any} 轉換後結果。
 */
export function toUpperCaseBeforeSubmit(value) {
  return utility.submitToUpper(value);
}

/**
 * 轉換日期格式（ROC/CE 類型）。
 * @param {string|number} value 原始日期值。
 * @param {"rocDate"|"ceDate"|"ceDateWithoutDash"|"rocDisplay"|"adIso"} [target="rocDate"] 目標格式。
 * @returns {string} 轉換後日期字串。
 */
export function convertDateFormat(value, target = "rocDate") {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (target === "rocDate") {
    return legacyCommon.tranCEorROCDate(String(value), "rocDate");
  }

  if (target === "ceDate") {
    return legacyCommon.tranCEorROCDate(String(value), "ceDate");
  }

  if (target === "ceDateWithoutDash") {
    return legacyCommon.tranCEorROCDate(String(value), "ceDateWithoutDash");
  }

  if (target === "rocDisplay") {
    return CSRUtil.toInputROC(String(value), "/");
  }

  if (target === "adIso") {
    return dateUtils.toY2K(String(value));
  }

  return String(value);
}

/**
 * 依指定樣板格式化日期。
 * @param {string|number|Date} value 原始日期值。
 * @param {string} [outputPattern="YYYY-MM-DD"] 輸出樣板。
 * @param {string} [inputPattern] 輸入樣板。
 * @returns {string} 格式化結果。
 */
export function formatDateByPattern(value, outputPattern = "YYYY-MM-DD", inputPattern) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const source = String(value);
  const parsed = inputPattern
    ? dayjs(source, inputPattern, true)
    : dayjs(source);

  if (!parsed.isValid()) {
    return source;
  }

  return parsed.format(outputPattern);
}

/**
 * 依型別執行敏感資料遮罩。
 * @param {string|number} value 原始值。
 * @param {"id"|"name"|"address"|"address2"} [type="id"] 遮罩型別。
 * @returns {string} 遮罩後結果。
 */
export function maskValue(value, type = "id") {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);
  if (type === "name") {
    return CSRUtil.maskHandler.getMaskName(text);
  }
  if (type === "address") {
    return CSRUtil.maskHandler.getMaskAddress(text);
  }
  if (type === "address2") {
    return CSRUtil.maskHandler.getMaskAddress2(text);
  }

  return CSRUtil.maskHandler.getMaskID(text);
}

const formatUtil = {
  numberAddComma,
  maskName,
  maskAddress,
  formatNumber,
  formatMoney,
  formatCurrency,
  normalizeTimeText,
  removeFullWidthSpace,
  trimRightSpace,
  toUpperCaseBeforeSubmit,
  convertDateFormat,
  formatDateByPattern,
  maskValue,
};

export default formatUtil;
