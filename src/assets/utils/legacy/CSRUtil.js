// Legacy CSRUtil pure-logic migration layer for Vue/Quasar projects.
// NOTE: This module intentionally excludes DOM/Ajax/Prototype dependent APIs.

export const defaultPattern = '#,###.####'
export const replacePattern = /,/g

export const Y2KDatePattern = [
  /^(\d{4})-(\d{2})-(\d{2})/,
  /^(\d{4})(\d{2})(\d{2})/,
  /^(\d{4})\/(\d{2})\/(\d{2})/
]

/**
 * isBlank 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isBlank(value) {
  return value === null || value === void 0 || String(value).trim() === ''
}

/**
 * toNumericString 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function toNumericString(value) {
  const source = String(value).trim().replace(replacePattern, '')
  if (source === '') {
    return ''
  }

  // Support scientific notation input from legacy pages.
  if (/e/i.test(source)) {
    const num = Number(source)
    if (Number.isFinite(num) === false) {
      return null
    }
    return String(num)
  }

  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(source) === false) {
    return null
  }

  return source
}

/**
 * groupIntegerPart 功能說明。
 * @param {any} intPart 參數 intPart。
 * @param {any} pattern 參數 pattern。
 * @param {any} dotPos 參數 dotPos。
 * @returns {any} 執行結果。
 */
function groupIntegerPart(intPart, pattern, dotPos) {
  const commaPos = pattern.indexOf(',')
  if (commaPos === -1) {
    return intPart
  }

  let groupLen = dotPos >= 0 ? dotPos - commaPos - 1 : pattern.length - commaPos - 1
  if (groupLen <= 0) {
    groupLen = 3
  }

  let out = ''
  let rest = intPart
  while (rest.length > groupLen) {
    out = `,${rest.slice(-groupLen)}${out}`
    rest = rest.slice(0, -groupLen)
  }
  return `${rest}${out}`
}

/**
 * trimFloatByPattern 功能說明。
 * @param {any} floatPart 參數 floatPart。
 * @param {any} floatPattern 參數 floatPattern。
 * @returns {any} 執行結果。
 */
function trimFloatByPattern(floatPart, floatPattern) {
  let result = floatPart
  let index = result.length - 1

  while (index >= 0) {
    const patternCh = floatPattern.charAt(index)
    const valueCh = result.charAt(index)
    if (patternCh === '0') {
      break
    }
    if (patternCh === '#' && valueCh !== '0') {
      break
    }
    result = result.slice(0, index)
    index -= 1
  }

  return result
}

/**
 * Legacy response payload helper: read ErrMsg block from backend response.
 * @returns {any} 執行結果。
 */
export function getReturnMessage(resp) {
  if (resp) {
    return resp.ErrMsg
  }
  return undefined
}

/**
 * Legacy success rule: returnCode == 0 is treated as success.
 * @returns {boolean} 執行結果。
 */
export function isSuccess(resp) {
  const msg = getReturnMessage(resp)
  return !!(msg && msg.returnCode === 0)
}

/**
 * readyState 1/2/3 means request is still in progress.
 * @returns {boolean} 執行結果。
 */
export function isOnProgress(xmlhttp) {
  if (!xmlhttp || typeof xmlhttp.readyState !== 'number') {
    return false
  }
  return xmlhttp.readyState === 1 || xmlhttp.readyState === 2 || xmlhttp.readyState === 3
}

/**
 * Number formatter compatible with legacy CSRUtil.$fmt behavior.
 * - pattern example: #,###.####
 * - isInput=true: keep user input style, only truncate decimal precision
 * - isInput=false: apply display formatting and optional rounding
 */
export function $fmt(v, pattern = defaultPattern, isInput = false) {
  if (v === null || v === void 0) {
    return ''
  }

  const normalized = toNumericString(v)
  if (normalized === '') {
    return ''
  }
  if (normalized === null) {
    return v
  }

  let source = normalized
  let minus = false
  if (source.startsWith('-')) {
    minus = true
    source = source.slice(1)
  } else if (source.startsWith('+')) {
    source = source.slice(1)
  }

  const hasDotInPattern = pattern.indexOf('.') >= 0
  const dotPos = pattern.indexOf('.')
  const floatPattern = hasDotInPattern ? pattern.slice(dotPos + 1) : ''

  let [intPart, floatPart = ''] = source.split('.', 2)
  if (intPart === '') {
    intPart = '0'
  }

  const precision = hasDotInPattern
    ? floatPattern.length
    : isInput
      ? 0
      : floatPart.length

  if (precision > 0) {
    if (isInput) {
      floatPart = floatPart.slice(0, precision)
    } else {
      const num = Number(`${minus ? '-' : ''}${intPart}${floatPart !== '' ? `.${floatPart}` : ''}`)
      if (Number.isFinite(num) === false) {
        return v
      }

      const rounded = Math.abs(num).toFixed(precision)
      const roundedParts = rounded.split('.', 2)
      intPart = roundedParts[0]
      floatPart = roundedParts[1] || ''
      floatPart = hasDotInPattern ? trimFloatByPattern(floatPart, floatPattern) : floatPart
    }
  } else {
    floatPart = ''
  }

  intPart = intPart.replace(/^0+(?=\d)/, '')
  const formattedInteger = groupIntegerPart(intPart, pattern, dotPos)
  const merged = floatPart ? `${formattedInteger}.${floatPart}` : formattedInteger
  return minus ? `-${merged}` : merged
}

/**
 * Convert AD date string (YYYY-MM-DD / YYYYMMDD / YYYY/MM/DD) to ROC date string.
 * @returns {any} 執行結果。
 */
export function toInputROC(d, delimiter = '/') {
  if (!d) {
    return ''
  }

  const timeParts = String(d).split(' ')
  const datePart = timeParts[0]
  const timePart = timeParts.length > 1 ? timeParts.slice(1).join(' ') : ''

  for (const pattern of Y2KDatePattern) {
    const matched = datePart.match(pattern)
    if (!matched) {
      continue
    }

    const rocYear = parseInt(matched[1], 10) - 1911
    const result = delimiter
      ? `${rocYear}${delimiter}${matched[2]}${delimiter}${matched[3]}`
      : `${rocYear}${matched[2]}${matched[3]}`

    return timePart ? `${result} ${timePart}` : result
  }

  return ''
}

/**
 * toROC 功能說明。
 * @param {any} d 參數 d。
 * @returns {any} 執行結果。
 */
export function toROC(d) {
  return toInputROC(d, '/')
}

/**
 * Parse YYYY-MM-DD to timestamp for legacy date range calculation.
 * @returns {any} 執行結果。
 */
export function parseDate(str) {
  if (!str) {
    return null
  }
  return Date.parse(String(str).replace(/-/g, '/'))
}

/**
 * Calculate day difference: d2 - d1.
 * @returns {any} 執行結果。
 */
export function dateRange(d1, d2) {
  const date1 = parseDate(d1)
  const date2 = parseDate(d2)
  if (date1 === null || date2 === null) {
    return NaN
  }
  return (date2 - date1) / 86400000
}

/**
 * round 功能說明。
 * @param {any} val 參數 val。
 * @param {any} scale 參數 scale。
 * @returns {any} 執行結果。
 */
export function round(val, scale = 4) {
  const factor = Math.pow(10, scale)
  return Math.round(Number(val) * factor) / factor
}

/**
 * emptyIf 功能說明。
 * @param {any} str 參數 str。
 * @param {any} replaceStr 參數 replaceStr。
 * @returns {any} 執行結果。
 */
export function emptyIf(str, replaceStr) {
  if (str || str === 0) {
    return str
  }
  return replaceStr
}

/**
 * pressNumber 功能說明。
 * @param {any} code 參數 code。
 * @returns {any} 執行結果。
 */
export function pressNumber(code) {
  return (code > 47 && code < 58) || code === 46 || code === 45 || code === 8
}

/**
 * upNumber 功能說明。
 * @param {any} code 參數 code。
 * @returns {any} 執行結果。
 */
export function upNumber(code) {
  return (code > 95 && code < 106) || code === 110 || code === 109 || pressNumber(code)
}

/**
 * Safe numeric conversion from formatted input.
 * Empty/invalid values are normalized to 0 for legacy compatibility.
 * @returns {any} 執行結果。
 */
export function getNumber(val) {
  if (typeof val === 'number') {
    return val
  }
  if (val === null || val === void 0) {
    return 0
  }

  const source = String(val).replace(replacePattern, '')
  if (isBlank(source)) {
    return 0
  }

  const parsed = Number(source)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * maskString 功能說明。
 * @param {any} str 參數 str。
 * @param {any} beginIndex 參數 beginIndex。
 * @param {any} maskLength 參數 maskLength。
 * @param {any} inSign 參數 inSign。
 * @returns {any} 執行結果。
 */
function maskString(str, beginIndex, maskLength, inSign = '*') {
  if (!str && str !== 0) {
    return str
  }

  const source = String(str)
  const length = source.length
  if (beginIndex > length || maskLength === 0) {
    return source
  }

  const sign = inSign || '*'
  const endIndex = maskLength ? beginIndex + maskLength : 0

  if (!endIndex || endIndex > length) {
    return `${source.slice(0, beginIndex)}${sign.repeat(Math.max(length - beginIndex, 0))}`
  }

  return `${source.slice(0, beginIndex)}${sign.repeat(maskLength)}${source.slice(endIndex)}`
}

export const maskHandler = {
  maskSign: '*',

  /**
   * 依指定起始位置與長度進行字串遮蔽。
   * @param {any} str 原始字串。
   * @param {any} beginIndex 遮蔽起始位置。
   * @param {any} maskLength 遮蔽長度。
   * @param {any} inSign 遮蔽符號。
   * @returns {any} 遮蔽後字串。
   */
  getMaskStr(str, beginIndex, maskLength, inSign) {
    return maskString(str, beginIndex, maskLength, inSign || this.maskSign)
  },

  // 身分證/居留證常見遮蔽：保留頭尾，中段隱碼。
  /**
   * 身分證與居留證遮蔽。
   * @param {any} str 原始字串。
   * @param {any} maskLength 遮蔽長度。
   * @returns {any} 遮蔽後字串。
   */
  getMaskID(str, maskLength = 3) {
    const source = str || ''
    const len = source.length

    if (len <= maskLength) {
      return this.maskSign.repeat(maskLength)
    }

    let diffLen = len - maskLength
    const hasOdd = diffLen % 2 !== 0
    if (hasOdd) {
      diffLen -= 1
    }

    const tailLen = diffLen === 0 ? 0 : diffLen / 2
    const start = hasOdd ? tailLen + 1 : tailLen
    return this.getMaskStr(source, start, maskLength, this.maskSign)
  },

  // 依 legacy 規則：姓名由右向左第 2 個字進行遮蔽。
  /**
   * 姓名遮蔽。
   * @param {any} str 原始姓名。
   * @param {any} inSign 遮蔽符號。
   * @returns {any} 遮蔽後姓名。
   */
  getMaskName(str, inSign) {
    return this.getMaskStr(str, 1, 1, inSign || '＊')
  },

  // 地址第 3 碼後全部遮蔽。
  /**
   * 地址固定起始位置遮蔽。
   * @param {any} str 原始地址。
   * @param {any} inSign 遮蔽符號。
   * @returns {any} 遮蔽後地址。
   */
  getMaskAddress(str, inSign) {
    return this.getMaskStr(str, 3, false, inSign || '＊')
  },

  // 地址長度 >20 從第 20 碼後遮蔽；>10 從第 10 碼後遮蔽。
  /**
   * 依地址長度套用分段遮蔽規則。
   * @param {any} str 原始地址。
   * @param {any} inSign 遮蔽符號。
   * @returns {any} 遮蔽後地址。
   */
  getMaskAddress2(str, inSign) {
    if (!str) {
      return str
    }

    const source = String(str)
    const sign = inSign || '＊'
    if (source.length > 20) {
      return this.getMaskStr(source, 20, false, sign)
    }
    if (source.length > 10) {
      return this.getMaskStr(source, 10, false, sign)
    }
    return source
  }
}

const CSRUtil = {
  defaultPattern,
  replacePattern,
  Y2KDatePattern,
  getReturnMessage,
  isSuccess,
  isOnProgress,
  $fmt,
  toInputROC,
  toROC,
  parseDate,
  dateRange,
  round,
  emptyIf,
  pressNumber,
  upNumber,
  getNumber,
  maskHandler
}

export default CSRUtil
