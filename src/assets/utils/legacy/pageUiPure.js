// PageUI 純邏輯工具：僅保留資料運算，不包含 DOM 與 window 相依。

/**
 * getType 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function getType(value) {
  if (typeof value === 'undefined') {
    return 'undefined'
  }
  return Object.prototype.toString.call(value)
}

/**
 * isBasicType 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
export function isBasicType(value) {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean'
}

/**
 * isArray 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
export function isArray(value) {
  return value !== null && getType(value) === '[object Array]' && isNumeric(value.length)
}

/**
 * isNotEmptyArray 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
export function isNotEmptyArray(value) {
  return isArray(value) && value.length > 0
}

/**
 * isFunction 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
export function isFunction(value) {
  return value !== null && getType(value) === '[object Function]'
}

/**
 * isObject 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
export function isObject(value) {
  return value !== null && getType(value) === '[object Object]' && !isArray(value) && !isFunction(value)
}

/**
 * isString 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
export function isString(value) {
  return isBasicType(value) && getType(value) === '[object String]'
}

/**
 * isNumeric 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
export function isNumeric(value) {
  return isBasicType(value) && /^-?(0|[1-9]\d*|(?=\.))(\.\d+)?$/.test(String(value))
}

/**
 * trim 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
export function trim(value) {
  return isString(value) ? value.replace(/(^\s*)|(\s*$)/g, '') : value
}

/**
 * lTrim 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
export function lTrim(value) {
  return isString(value) ? value.replace(/(^\s*)/g, '') : value
}

/**
 * rTrim 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
export function rTrim(value) {
  return isString(value) ? value.replace(/(\s*$)/g, '') : value
}

/**
 * stringToArray 功能說明。
 * @param {any} stringValue 參數 stringValue。
 * @param {any} splitChar 參數 splitChar。
 * @param {any} ' 參數 '。
 * @returns {any} 執行結果。
 */
export function stringToArray(stringValue, splitChar = ',') {
  if (isArray(stringValue)) {
    return stringValue
  }

  if (!isBasicType(stringValue)) {
    return [trim(String(stringValue ?? ''))]
  }

  return String(stringValue)
    .split(splitChar)
    .map(item => trim(item))
}

/**
 * arrayToString 功能說明。
 * @param {any} arrayValue 參數 arrayValue。
 * @returns {any} 執行結果。
 */
export function arrayToString(arrayValue) {
  if (!isArray(arrayValue)) {
    return ''
  }

  const result = []
  for (let i = 0; i < arrayValue.length; i += 1) {
    const value = arrayValue[i]
    if (isBasicType(value)) {
      result.push(String(value))
    }
  }

  return result.join(', ')
}

/**
 * getSpan 功能說明。
 * @param {any} setting 參數 setting。
 * @param {any} span 參數 span。
 * @returns {any} 執行結果。
 */
export function getSpan(setting, span) {
  return setting && setting.attrs ? setting.attrs[span] || 1 : 1
}

/**
 * setSpan 功能說明。
 * @param {any} setting 參數 setting。
 * @param {any} span 參數 span。
 * @param {any} spanNum 參數 spanNum。
 * @returns {any} 執行結果。
 */
export function setSpan(setting, span, spanNum) {
  if (!isObject(setting)) {
    return setting
  }

  if (!isObject(setting.attrs)) {
    setting.attrs = {}
  }
  setting.attrs[span] = spanNum
  return setting
}

/**
 * 對應 PageUI.createContent 的模式判斷邏輯：
 * - 無 header + 無 content 直接視為不合法配置
 * - `headerInTop` 會改成雙列模式（doubleRowSpan）
 * @returns {any} 執行結果。
 */
export function resolveContentMode(config = {}) {
  const noHeader = !!config.noHeader
  const noContent = !!config.noContent
  const headerInTop = !!config.headerInTop

  return {
    noHeader,
    noContent,
    headerInTop,
    isInvalid: noHeader && noContent,
    doubleColSpan: !headerInTop && !noHeader && !noContent,
    doubleRowSpan: headerInTop && (!noHeader || !noContent)
  }
}

/**
 * 對應舊版 createContent 的預設欄寬規則：
 * - 一般模式：每欄平均分配
 * - header/content 雙欄模式：每欄拆成 30% + 70%
 * @returns {any} 執行結果。
 */
export function buildDefaultColumnProps(colsInTable, doubleColSpan) {
  const count = isNumeric(colsInTable) ? parseInt(colsInTable, 10) : 2
  const safeCount = count > 0 ? count : 2
  const oneColumnProp = 100 / safeCount

  const result = []
  for (let i = 0; i < safeCount; i += 1) {
    if (doubleColSpan) {
      result.push(oneColumnProp * 0.3)
      result.push(oneColumnProp * 0.7)
    } else {
      result.push(oneColumnProp)
    }
  }

  return result
}

/**
 * 對應 setButtonsEnable 的資料規則運算：
 * - `enableArray` 視為允許清單
 * - `skipCheckMap` 若已帶入，表示要保留原 disabled 狀態
 * @returns {any} 執行結果。
 */
export function resolveButtonDisabledMap(buttonIds, enableArray, skipCheckMap = {}) {
  const ids = isArray(buttonIds) ? buttonIds : []
  const enables = stringToArray(enableArray, ',')
  const enableMap = {}

  for (let i = 0; i < enables.length; i += 1) {
    enableMap[enables[i]] = true
  }

  const disabledMap = {}
  for (let i = 0; i < ids.length; i += 1) {
    const id = ids[i]
    if (!isString(id) || trim(id) === '') {
      continue
    }

    if (Object.prototype.hasOwnProperty.call(skipCheckMap, id)) {
      disabledMap[id] = !!skipCheckMap[id]
    } else {
      disabledMap[id] = !enableMap[id]
    }
  }

  return disabledMap
}

const pageUiPure = {
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
  resolveButtonDisabledMap
}

export default pageUiPure