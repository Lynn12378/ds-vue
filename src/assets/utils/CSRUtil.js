// ── 回應解析 ──────────────────────────────────────────────────────────────────

/**
 * 從 Ajax response 取得 ReturnMessage 物件
 * @param {Object} resp
 * @returns {Object | undefined}
 */
export const getReturnMessage = (resp) => resp?.['ErrMsg']

/**
 * 判斷 response 的 returnCode 是否為 0（成功）
 * @param {Object} resp
 * @returns {boolean}
 */
export function isSuccess(resp) {
  const msg = getReturnMessage(resp)
  return msg ? msg.returnCode === 0 : false
}

// ── 數學工具 ──────────────────────────────────────────────────────────────────

/**
 * 四捨五入至指定位數
 * @param {number} val
 * @param {number} [scale=4]
 * @returns {number}
 */
export function round(val, scale = 4) {
  const factor = Math.pow(10, scale)
  return Math.round(val * factor) / factor
}

/**
 * 安全數字轉換，空白 / undefined / null / NaN 回傳 0
 * @param {*} val
 * @returns {number}
 */
export function getNumber(val) {
  if (typeof val === 'number') return val
  if (val == null) return 0
  const str = String(val).replace(/,/g, '')
  if (str.trim() === '' || isNaN(str)) return 0
  return Number(str)
}

// ── 遮碼工具 ──────────────────────────────────────────────────────────────────

const DEFAULT_MASK = '*'

/**
 * 遮蔽字串中指定範圍的字元
 * @param {string}      str
 * @param {number}      beginIndex  遮蔽起始位置（由 0 開始）
 * @param {number|false} maskLength  遮蔽長度；false 表示遮蔽至字串結尾
 * @param {string}      [inSign='*']
 * @returns {string}
 *
 * @example
 * getMaskStr('1234567890', 2, false)   // '12********'
 * getMaskStr('1234567890', 3, 2, '#')  // '123##67890'
 */
export function getMaskStr(str, beginIndex, maskLength, inSign = DEFAULT_MASK) {
  if (!str) return str

  const s = String(str)
  const len = s.length

  if (beginIndex >= len || maskLength === 0) return s

  const endIndex = maskLength ? beginIndex + maskLength : len
  const prefix   = s.slice(0, beginIndex)
  const mask     = inSign.repeat(Math.min(maskLength || (len - beginIndex), len - beginIndex))
  const suffix   = maskLength && endIndex < len ? s.slice(endIndex) : ''

  return prefix + mask + suffix
}

/**
 * 遮蔽身分證字號（預設遮蔽中間 3 碼）
 * @param {string} str
 * @param {number} [maskLength=3]
 * @returns {string}
 *
 * @example
 * getMaskID('X123456789')     // 'X123***789'
 * getMaskID('X123456789', 5)  // 'X12*****89'
 */
export function getMaskID(str, maskLength = 3) {
  const strLen = str?.length ?? 0

  if (strLen <= maskLength) {
    return DEFAULT_MASK.repeat(maskLength)
  }

  const diffLen   = strLen - maskLength
  const hasOdd    = diffLen % 2 !== 0
  const half      = hasOdd ? (diffLen - 1) / 2 : diffLen / 2
  const firstIndex = hasOdd ? half + 1 : half

  return getMaskStr(str, firstIndex, maskLength)
}

/**
 * 遮蔽姓名（遮蔽第 2 個字）
 * @param {string} str
 * @param {string} [inSign='＊']
 * @returns {string}
 *
 * @example
 * getMaskName('程設科')  // '程＊科'
 */
export const getMaskName = (str, inSign = '＊') => getMaskStr(str, 1, 1, inSign)

/**
 * 遮蔽地址（遮蔽第 3 碼之後的字）
 * @param {string} str
 * @param {string} [inSign='＊']
 * @returns {string}
 *
 * @example
 * getMaskAddress('台北市內湖區陽光街２８８號')  // '台北市＊＊＊＊＊＊＊＊＊＊'
 */
export const getMaskAddress = (str, inSign = '＊') => getMaskStr(str, 3, false, inSign)

/**
 * 遮蔽地址（依長度決定保留前 10 或 20 碼）
 * @param {string} str
 * @param {string} [inSign='＊']
 * @returns {string}
 *
 * @example
 * getMaskAddress2('台北市內湖區陽光街２８８號８樓')  // '台北市內湖區陽光街２＊＊＊＊＊'
 */
export function getMaskAddress2(str, inSign = '＊') {
  if (!str) return str
  const len = str.length
  if (len > 20) return getMaskStr(str, 20, false, inSign)
  if (len > 10) return getMaskStr(str, 10, false, inSign)
  return str
}
