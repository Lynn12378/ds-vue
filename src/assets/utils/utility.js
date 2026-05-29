/**
 * 字串補位
 * @param {string|number} str    原始字串
 * @param {number}        len    目標長度
 * @param {string}        prestr 補位字元
 * @returns {string}
 */
export function addPrefix(str, len, prestr) {
  return String(str).padStart(parseInt(len, 10), prestr)
}

/**
 * 數字轉千分位格式（`123,456,789`）
 * @param {string|number} inputString
 * @returns {string}
 */
export function MoneyFormat(inputString) {
  const type = typeof inputString
  const isValid =
    type === 'number' ||
    (type === 'string' && /^-?(0|[1-9]\d*|(?=\.))(\.\d+)?$/.test(inputString))

  if (!isValid) return inputString
  if (!inputString && inputString !== 0) return ''
  if (inputString === 0) return '0'

  const str    = String(inputString)
  const isNeg  = str.startsWith('-')
  const dotIdx = str.indexOf('.')

  const digits = s => s.replace(/\D/g, '')

  let intPart, floatPart, hasFloat
  if (dotIdx > 0) {
    intPart  = digits(str.slice(0, dotIdx))
    floatPart = digits(str.slice(dotIdx + 1))
    hasFloat  = true
  } else {
    intPart  = digits(str)
    hasFloat  = false
  }

  intPart = intPart.padStart(Math.ceil(intPart.length / 3) * 3, '0')
  const groups = intPart.match(/\d{3}/g) || []

  let output = groups
    .map((g, i) => (i === 0 ? String(parseInt(g, 10)) : g))
    .filter((g, i) => !(i === 0 && g === '0'))
    .join(',')

  if (isNeg)   output = `-${output}`
  if (hasFloat) output = `${output}.${floatPart}`
  return output
}

/**
 * 民國日期格式化（`yymmdd` → `yy.mm.dd`）
 * @param {string} strDate 民國年月日（6 碼）
 * @returns {string}
 */
export function DateFormat(strDate) {
  const s = String(strDate)
  if (s.length < 6) return s
  return `${s.slice(0, s.length - 4)}.${s.slice(-4, -2)}.${s.slice(-2)}`
}

/**
 * DB 時間格式轉換（`hh:mm:ss` → `hhmmss`）
 * @param {string} timevalue
 * @returns {string}
 */
export function timeForTextfield(timevalue) {
  if (!timevalue) return ''

  const sep = timevalue.includes(':') ? ':' : timevalue.includes('.') ? '.' : null
  if (!sep) return timevalue

  const parts = timevalue.split(sep).map(v => String(parseInt(v, 10)).padStart(2, '0'))
  const joined = parts.join('').slice(0, 6).padEnd(6, '0')
  return joined
}

/**
 * 數字轉含小數點的千分位貨幣格式
 * @param {string|number} num
 * @returns {string}
 */
export function formatCurrency(num) {
  let n = String(num).replace(/\$|,/g, '')
  if (isNaN(n)) n = '0'

  const isPos   = Number(n) >= 0
  const abs     = Math.abs(Number(n))
  const floored = Math.floor(abs * 100 + 0.500000001)
  let cents     = floored % 100
  let intStr    = String(Math.floor(floored / 100))

  if (cents < 10) cents = `0${cents}`

  let i = 0
  while (i < Math.floor((intStr.length - (1 + i)) / 3)) {
    const pos = intStr.length - (4 * i + 3)
    intStr = `${intStr.slice(0, pos)},${intStr.slice(pos)}`
    i++
  }

  return `${isPos ? '' : '-'}${intStr}.${cents}`
}

/**
 * 判斷按鍵是否為合法數字鍵
 * @param {number}  keyCode
 * @param {boolean} [isDot=false]      是否允許小數點（keyCode 46）
 * @param {boolean} [isNegative=false] 是否允許負號（keyCode 45）
 * @returns {boolean}
 */
export function keypressNumberOnly(keyCode, isDot = false, isNegative = false) {
  return (
    (keyCode >= 48 && keyCode <= 57) ||
    (isNegative && keyCode === 45) ||
    (isDot && keyCode === 46)
  )
}

/**
 * 判斷按鍵是否為合法數值輸入，並回傳處理後的值
 * @param {number}  keyCode
 * @param {string}  currentValue       當前 input 的值
 * @param {boolean} [isDot=false]      是否允許小數點
 * @param {boolean} [isNegative=false] 是否允許負號
 * @returns {{ allow: boolean, value: string }}
 *   - allow: 是否允許此次輸入（false 時應 preventDefault）
 *   - value: 處理後的新值（負號前置、補零等）
 */
export function keypressNumberValue(keyCode, currentValue, isDot = false, isNegative = false) {
  const isDigit    = keyCode >= 48 && keyCode <= 57
  const isNegKey   = isNegative && keyCode === 45
  const isDotKey   = isDot && keyCode === 46

  if (!isDigit && !isNegKey && !isDotKey) {
    return { allow: false, value: currentValue }
  }

  // 負號前置處理
  if (isNegKey) {
    if (!currentValue.includes('-')) {
      return { allow: false, value: `-${currentValue}` }
    }
    return { allow: false, value: currentValue }
  }

  // 小數點：禁止重複，首位補零
  if (isDotKey) {
    if (currentValue.includes('.')) {
      return { allow: false, value: currentValue }
    }
    if (currentValue.length === 0) {
      return { allow: false, value: '0.' }
    }
    return { allow: true, value: currentValue }
  }

  // 禁止前導零
  if (keyCode === 48 && currentValue === '0') {
    return { allow: false, value: currentValue }
  }

  return { allow: true, value: currentValue }
}
