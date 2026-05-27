import dateUtils from "@/assets/utils/legacy/date.js";
import useLegacyCommon from "@/assets/utils/legacy/legacyCommon.js";

const EMAIL_RE = /^\w{1,}[@][\w-]{1,}([.]([\w-]{1,})){1,}$/;
const URL_RE = /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i;
const NUMBER_RE = /^[+-]?[\d,]*\.?\d*([eE][+-]?\d+)?$/;
const INTEGER_RE = /^-?\d+$/;

const legacyCommon = useLegacyCommon();

/**
 * 判斷值是否為空（null/undefined/空字串）。
 * @param {any} value 欲判斷的值。
 * @returns {boolean} 是否為空。
 */
export function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

/**
 * 必填檢核。
 * @param {any} value 欲判斷的值。
 * @returns {boolean} 是否通過必填。
 */
export function isRequired(value) {
  return !isEmpty(value);
}

/**
 * 計算文字長度（可設定非 ASCII 權重）。
 * @param {any} value 原始文字。
 * @param {number} [nonAsciiWeight=2] 非 ASCII 字元權重。
 * @returns {number} 計算後長度。
 */
export function getTextLength(value, nonAsciiWeight = 2) {
  const text = String(value ?? "");
  let length = 0;

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    length += code > 127 ? nonAsciiWeight : 1;
  }

  return length;
}

/**
 * 最小長度檢核。
 * @param {any} value 原始文字。
 * @param {number} min 最小長度。
 * @param {number} [nonAsciiWeight=2] 非 ASCII 權重。
 * @returns {boolean} 是否符合最小長度。
 */
export function minLength(value, min, nonAsciiWeight = 2) {
  return getTextLength(value, nonAsciiWeight) >= Number(min);
}

/**
 * 最大長度檢核。
 * @param {any} value 原始文字。
 * @param {number} max 最大長度。
 * @param {number} [nonAsciiWeight=2] 非 ASCII 權重。
 * @returns {boolean} 是否符合最大長度。
 */
export function maxLength(value, max, nonAsciiWeight = 2) {
  return getTextLength(value, nonAsciiWeight) <= Number(max);
}

/**
 * 數字格式檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否為合法數字。
 */
export function isNumber(value) {
  if (isEmpty(value)) {
    return false;
  }

  const normalized = String(value).replace(/,/g, "").trim();
  return NUMBER_RE.test(normalized) && Number.isNaN(Number(normalized)) === false;
}

/**
 * 整數格式檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否為整數。
 */
export function isInteger(value) {
  if (isEmpty(value)) {
    return false;
  }
  return INTEGER_RE.test(String(value).trim());
}

/**
 * 正數檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否為大於 0 的數字。
 */
export function isPositiveNumber(value) {
  return isNumber(value) && Number(String(value).replace(/,/g, "")) > 0;
}

/**
 * Email 格式檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否為合法 Email。
 */
export function isEmail(value) {
  if (isEmpty(value)) {
    return false;
  }
  return EMAIL_RE.test(String(value).trim());
}

/**
 * URL 格式檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否為合法 URL。
 */
export function isUrl(value) {
  if (isEmpty(value)) {
    return false;
  }
  return URL_RE.test(String(value).trim());
}

/**
 * 民國日期檢核。
 * @param {any} value 原始值。
 * @param {boolean} [yearLimit=false] 是否套用年份限制。
 * @param {boolean} [allowBeforeRoc=false] 是否允許民國前。
 * @returns {boolean} 是否為合法民國日期。
 */
export function isRocDate(value, yearLimit = false, allowBeforeRoc = false) {
  if (isEmpty(value)) {
    return false;
  }
  return dateUtils.isROCdate(String(value), yearLimit, allowBeforeRoc);
}

/**
 * 西元日期檢核。
 * @param {any} value 原始值。
 * @param {boolean} [yearLimit=false] 是否套用年份限制。
 * @returns {boolean} 是否為合法西元日期。
 */
export function isAdDate(value, yearLimit = false) {
  if (isEmpty(value)) {
    return false;
  }
  return dateUtils.isADdate(String(value), yearLimit);
}

/**
 * 年月格式檢核（YYYYMM 或 ROC 年月）。
 * @param {any} value 原始值。
 * @param {boolean} [isRoc=false] 是否民國年月。
 * @returns {boolean} 是否合法。
 */
export function isDateYM(value, isRoc = false) {
  if (isEmpty(value)) {
    return false;
  }
  return dateUtils.dateJs.isDateYM(String(value), isRoc);
}

/**
 * 日期區間檢核（起日 <= 迄日）。
 * @param {any} startDate 起始日期。
 * @param {any} endDate 結束日期。
 * @param {boolean} [isRoc=false] 是否民國日期。
 * @returns {boolean} 區間是否合法。
 */
export function isDateRangeValid(startDate, endDate, isRoc = false) {
  if (isEmpty(startDate) || isEmpty(endDate)) {
    return true;
  }

  const diff = isRoc
    ? dateUtils.diffDayROC(String(startDate), String(endDate))
    : dateUtils.diffDayY2K(String(startDate), String(endDate));

  return Number.isFinite(diff) && diff >= 0;
}

/**
 * 身分證字號檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否合法。
 */
export function checkROCID(value) {
  if (isEmpty(value)) {
    return false;
  }
  return legacyCommon.checkROCID(String(value));
}

/**
 * 護照號碼檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否合法。
 */
export function checkROCPassport(value) {
  if (isEmpty(value)) {
    return false;
  }
  return legacyCommon.checkROCPassport(String(value));
}

/**
 * 居留證號檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否合法。
 */
export function checkROCARC(value) {
  if (isEmpty(value)) {
    return false;
  }
  return legacyCommon.checkROCARC(String(value));
}

/**
 * 統一編號檢核。
 * @param {any} value 原始值。
 * @returns {boolean} 是否合法。
 */
export function checkUniSN(value) {
  if (isEmpty(value)) {
    return false;
  }
  return legacyCommon.checkUniSN(String(value));
}

/**
 * 通用證件檢核（身份證/居留證/護照）。
 * @param {any} value 原始值。
 * @returns {boolean} 是否通過其中一種檢核。
 */
export function checkID(value) {
  if (isEmpty(value)) {
    return false;
  }

  const source = String(value);
  return checkROCID(source) || checkROCARC(source) || checkROCPassport(source);
}

/**
 * 驗證 API 回應 payload，整理 returnCode 與訊息。
 * @param {any} payload API 回應內容。
 * @returns {{returnCode:number|null,displayMsgDescs:string,isSuccess:boolean,isNotifyOnly:boolean}} 驗證結果。
 */
export function validateResponsePayload(payload) {
  const codeRaw = payload?.ErrMsg?.returnCode;
  const parsedCode = Number(codeRaw);
  const hasCode = Number.isNaN(parsedCode) === false;
  const returnCode = hasCode ? parsedCode : null;

  const displayMsgDescs = payload?.ErrMsg?.displayMsgDescs ?? "";

  return {
    returnCode,
    displayMsgDescs,
    isSuccess: returnCode === 0,
    isNotifyOnly: returnCode === 99,
  };
}

/**
 * 建立可直接提供給 Quasar/VeeValidate 的 rule 函式。
 * @param {(value:any)=>boolean} validatorFn 驗證函式。
 * @param {string} message 失敗時訊息。
 * @returns {(value:any)=>true|string} rule 函式。
 */
export function createRule(validatorFn, message) {
  return (value) => (validatorFn(value) ? true : message);
}

const validatorV2 = {
  isEmpty,
  isRequired,
  getTextLength,
  minLength,
  maxLength,
  isNumber,
  isInteger,
  isPositiveNumber,
  isEmail,
  isUrl,
  isRocDate,
  isAdDate,
  isDateYM,
  isDateRangeValid,
  checkROCID,
  checkROCPassport,
  checkROCARC,
  checkUniSN,
  checkID,
  validateResponsePayload,
  createRule,
};

export default validatorV2;
