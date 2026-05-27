// Legacy utility.js pure-logic migration layer for Vue/Quasar projects.
// NOTE: DOM、frame、window 覆寫與 submit 攔截等 UI 耦合功能不在此檔案實作。

const EMAIL_PREFIX_RE = /^EMAIL/i
const FULL_WIDTH_SPACE_RE = /　/g

/**
 * isPlainObject 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && Array.isArray(value) === false
}

/**
 * shouldSkipUpperCase 功能說明。
 * @param {any} fieldName 參數 fieldName。
 * @returns {boolean} 執行結果。
 */
function shouldSkipUpperCase(fieldName) {
  return typeof fieldName === 'string' && EMAIL_PREFIX_RE.test(fieldName)
}

/**
 * submit 前轉大寫（純資料版）
 * - 會跳過欄位名以 EMAIL 開頭的欄位
 * - 支援 string / array / object
 * @returns {void} 執行結果。
 */
export function submitToUpper(input) {
  if (typeof input === 'string') {
    return input.toUpperCase()
  }

  if (Array.isArray(input)) {
    return input.map(item => submitToUpper(item))
  }

  if (isPlainObject(input) === false) {
    return input
  }

  // 欄位描述物件相容：{ name, id, value, autoToUppercase }
  if (typeof input.value === 'string') {
    const fieldName = input.name || input.id || ''
    if (input.autoToUppercase === false || shouldSkipUpperCase(fieldName)) {
      return { ...input }
    }
    return {
      ...input,
      value: input.value.toUpperCase()
    }
  }

  const output = {}
  Object.keys(input).forEach(key => {
    const value = input[key]
    if (typeof value === 'string' && shouldSkipUpperCase(key) === false) {
      output[key] = value.toUpperCase()
      return
    }
    output[key] = value
  })
  return output
}

/**
 * 將字串左側補上指定字元直到達到目標長度。
 * @returns {any} 執行結果。
 */
export function addPrefix(str, len, prestr) {
  const targetLength = parseInt(len, 10)
  if (Number.isFinite(targetLength) === false || targetLength <= 0) {
    return String(str ?? '')
  }

  const prefix = String(prestr ?? '')
  let source = String(str ?? '')
  while (source.length < targetLength) {
    source = `${prefix}${source}`
  }
  return source
}

/**
 * normalizeNumericString 功能說明。
 * @param {any} inputString 參數 inputString。
 * @returns {any} 執行結果。
 */
function normalizeNumericString(inputString) {
  if (typeof inputString === 'number') {
    return Number.isFinite(inputString) ? String(inputString) : null
  }

  if (typeof inputString !== 'string') {
    return null
  }

  const source = inputString.trim()
  if (source === '') {
    return ''
  }

  if (/^-?(0|[1-9]\d*|(?=\.))(\.\d+)?$/.test(source) === false) {
    return null
  }

  return source
}

/**
 * 金額格式化：整數段補千分位，保留原始小數位與正負號。
 * @returns {any} 執行結果。
 */
export function MoneyFormat(inputString) {
  const normalized = normalizeNumericString(inputString)
  if (normalized === null) {
    return inputString
  }
  if (normalized === '') {
    return ''
  }

  const isNegative = normalized.startsWith('-')
  const source = isNegative ? normalized.slice(1) : normalized
  const parts = source.split('.', 2)
  let integerPart = (parts[0] || '0').replace(/^0+(?=\d)/, '')
  const floatPart = parts.length > 1 ? parts[1] : ''

  if (integerPart === '') {
    integerPart = '0'
  }

  const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const merged = floatPart !== '' ? `${formattedInt}.${floatPart}` : formattedInt
  return isNegative ? `-${merged}` : merged
}

/**
 * legacy 日期字串格式化：由右往左每 2 碼插入分隔點。
 * 範例：920101 -> 92.01.01
 * @returns {any} 執行結果。
 */
export function DateFormat(strDate) {
  const source = String(strDate ?? '')
  if (source === '') {
    return ''
  }

  let textString = ''
  let pairCounter = 0

  for (let i = source.length - 1; i >= 0; i -= 1) {
    if (pairCounter === 2 && source.length - 1 - i < 6) {
      textString = `.${textString}`
      pairCounter = 0
    }
    pairCounter += 1
    textString = `${source.charAt(i)}${textString}`
  }

  return textString
}

/**
 * pad2 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function pad2(value) {
  return String(value).padStart(2, '0')
}

/**
 * 將時間字串轉為 hhmmss。
 * 支援 hh:mm:ss 與 hh.mm.ss；不足位補 0，超過 6 碼截斷。
 * @returns {any} 執行結果。
 */
export function timeForTextfield(timevalue) {
  if (timevalue === null || timevalue === void 0 || timevalue === '') {
    return ''
  }

  const source = String(timevalue)
  let timeArray
  if (source.indexOf(':') >= 0) {
    timeArray = source.split(':')
  } else if (source.indexOf('.') >= 0) {
    timeArray = source.split('.')
  } else {
    return source
  }

  let normalized = ''
  for (let i = 0; i < timeArray.length; i += 1) {
    const parsed = parseInt(timeArray[i], 10)
    if (Number.isNaN(parsed)) {
      return source
    }
    normalized += pad2(parsed)
  }

  if (normalized.length > 6) {
    return normalized.substring(0, 6)
  }

  while (normalized.length < 6) {
    normalized += '0'
  }

  return normalized
}

/**
 * replaceFullWidthSpaceInString 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function replaceFullWidthSpaceInString(value) {
  return typeof value === 'string' ? value.replace(FULL_WIDTH_SPACE_RE, '') : value
}

/**
 * 清除全形空白：
 * - string: 直接清理
 * - object: 只清理符合關鍵字欄位（key）或全部欄位
 * @returns {any} 執行結果。
 */
export function keyWordReplaceFullSpace(source, keyWord, ingornCase) {
  if (typeof source === 'string') {
    return replaceFullWidthSpaceInString(source)
  }

  if (Array.isArray(source)) {
    return source.map(item => keyWordReplaceFullSpace(item, keyWord, ingornCase))
  }

  if (isPlainObject(source) === false) {
    return source
  }

  const keyWordExp = keyWord
    ? new RegExp(String(keyWord).toUpperCase(), ingornCase ? 'i' : '')
    : null

  const output = {}
  Object.keys(source).forEach(key => {
    const value = source[key]
    if (typeof value !== 'string') {
      output[key] = value
      return
    }

    if (keyWordExp && keyWordExp.test(String(key).toUpperCase()) === false) {
      output[key] = value
      return
    }

    output[key] = replaceFullWidthSpaceInString(value)
  })
  return output
}

/**
 * 清除所有全形空白。
 * @returns {any} 執行結果。
 */
export function replaceFullSpace(source) {
  return keyWordReplaceFullSpace(source)
}

/**
 * trimRightSpaceInString 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function trimRightSpaceInString(value) {
  return typeof value === 'string' ? value.replace(/\s+$/, '') : value
}

/**
 * 清除字串右側空白（支援 string / array / object）。
 * @returns {any} 執行結果。
 */
export function trimSpace(source) {
  if (typeof source === 'string') {
    return trimRightSpaceInString(source)
  }

  if (Array.isArray(source)) {
    return source.map(item => trimSpace(item))
  }

  if (isPlainObject(source) === false) {
    return source
  }

  const output = {}
  Object.keys(source).forEach(key => {
    output[key] = trimRightSpaceInString(source[key])
  })
  return output
}

/**
 * 舊版幣值格式化相容：輸出千分位與 2 位小數。
 * @returns {any} 執行結果。
 */
export function formatCurrency(num) {
  let normalized = String(num ?? '').replace(/\$|,/g, '')
  if (normalized === '' || Number.isNaN(Number(normalized))) {
    normalized = '0'
  }

  const absNumber = Math.abs(Number(normalized))
  const isPositive = Number(normalized) >= 0

  const scaled = Math.floor(absNumber * 100 + 0.50000000001)
  let cents = scaled % 100
  let integerPart = Math.floor(scaled / 100).toString()

  if (cents < 10) {
    cents = `0${cents}`
  }

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${isPositive ? '' : '-'}${integerPart}.${cents}`
}

const utility = {
  submitToUpper,
  addPrefix,
  MoneyFormat,
  DateFormat,
  timeForTextfield,
  keyWordReplaceFullSpace,
  replaceFullSpace,
  trimSpace,
  formatCurrency
}

export default utility
