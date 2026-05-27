/**
 * CSRUtil.js 工具函式遷移
 * 來源：CM/js/ajax/CSRUtil.js
 */

// ─── BigNumber（內部使用，供 $fmt 高精度計算） ───────────────────────────────

/**
 * 高精度數值運算類別
 * 原始來源：Jonas Raoni Soares Silva http://jsfromhell.com/classes/bignumber [rev. #4]
 * @private
 */
const BigNumber = (function () {
  function BigNumber(n, p, r) {
    const o = this
    let i
    if (n instanceof BigNumber) {
      for (i in { precision: 0, roundType: 0, _s: 0, _f: 0 }) o[i] = n[i]
      o._d = n._d.slice()
      return
    }
    o.precision = isNaN((p = Math.abs(p))) ? BigNumber.defaultPrecision : p
    o.roundType = isNaN((r = Math.abs(r))) ? BigNumber.defaultRoundType : r
    o._s = ((n += '').charAt(0) === '-')
    o._f = ((n = n.replace(/[^\d.]/g, '').split('.', 2))[0] = n[0].replace(/^0+/, '') || '0').length
    for (i = (n = o._d = (n.join('') || '0').split('')).length; i; n[--i] = +n[i]);
    o.round()
  }

  BigNumber.ROUND_UP = 0
  BigNumber.ROUND_DOWN = 1
  BigNumber.ROUND_CEIL = 2
  BigNumber.ROUND_FLOOR = 3
  BigNumber.ROUND_HALF_UP = 4
  BigNumber.ROUND_HALF_DOWN = 5
  BigNumber.ROUND_HALF_EVEN = 6
  BigNumber.defaultPrecision = 40
  BigNumber.defaultRoundType = BigNumber.ROUND_HALF_UP

  const o = BigNumber.prototype

  o._zeroes = function (n, l, t) {
    const s = ['push', 'unshift'][t || 0]
    for (++l; --l; n[s](0));
    return n
  }

  o.round = function () {
    if ('_rounding' in this) return this
    const $ = BigNumber, r = this.roundType, b = this._d
    let d, p, n, x
    for (this._rounding = true; this._f > 1 && !b[0]; --this._f, b.shift());
    d = this._f
    p = this.precision + d
    n = b[p]
    for (; b.length > d && !b[b.length - 1]; b.pop());
    x = (this._s ? '-' : '') + (p - d ? '0.' + this._zeroes([], p - d - 1).join('') : '') + 1
    if (b.length > p) {
      n && (r === $.ROUND_DOWN ? false : r === $.ROUND_UP ? true : r === $.ROUND_CEIL ? !this._s
        : r === $.ROUND_FLOOR ? this._s : r === $.ROUND_HALF_UP ? n >= 5 : r === $.ROUND_HALF_DOWN ? n > 5
        : r === $.ROUND_HALF_EVEN ? n >= 5 && b[p - 1] & 1 : false) && this.add(x)
      b.splice(p, b.length - p)
    }
    return delete this._rounding, this
  }

  o.add = function (n) {
    if (this._s !== (n = new BigNumber(n))._s) { n._s ^= 1; return this.subtract(n) }
    const o = this._rounding ? this : new BigNumber(this)
    let a = o._d, b = n._d, la = o._f, lb = n._f, nn = Math.max(la, lb), i, r
    la !== lb && ((lb = la - lb) > 0 ? o._zeroes(b, lb, 1) : o._zeroes(a, -lb, 1))
    i = (la = a.length) === (lb = b.length) ? a.length : ((lb = la - lb) > 0 ? o._zeroes(b, lb) : o._zeroes(a, -lb)).length
    for (r = 0; i; r = (a[--i] = a[i] + b[i] + r) / 10 >>> 0, a[i] %= 10);
    return r && ++nn && a.unshift(r), o._f = nn, o.round()
  }

  o.subtract = function (n) {
    if (this._s !== (n = new BigNumber(n))._s) { n._s ^= 1; return this.add(n) }
    const o = new BigNumber(this), c = o.abs().compare(n.abs()) + 1
    let a = c ? o : n, b = c ? n : o, la = a._f, lb = b._f, d = la, i, j
    a = a._d; b = b._d
    la !== lb && ((lb = la - lb) > 0 ? o._zeroes(b, lb, 1) : o._zeroes(a, -lb, 1))
    for (i = (la = a.length) === (lb = b.length) ? a.length : ((lb = la - lb) > 0 ? o._zeroes(b, lb) : o._zeroes(a, -lb)).length; i;) {
      if (a[--i] < b[i]) { for (j = i; j && !a[--j]; a[j] = 9); --a[j]; a[i] += 10 }
      b[i] = a[i] - b[i]
    }
    return c || (o._s ^= 1), o._f = d, o._d = b, o.round()
  }

  o.multiply = function (n) {
    const o = new BigNumber(this), r2 = o._d.length >= (n = new BigNumber(n))._d.length
    let a = (r2 ? o : n)._d, b = (r2 ? n : o)._d, la = a.length, lb = b.length
    const x = new BigNumber()
    let i, j, s, r
    for (i = lb; i; r2 && s.unshift(r), x.set(x.add(new BigNumber(s.join('')))))
      for (s = (new Array(lb - --i)).join('0').split(''), r = 0, j = la; j; r += a[--j] * b[i], s.unshift(r % 10), r = (r / 10) >>> 0);
    return o._s = o._s !== n._s, o._f = ((r = la + lb - o._f - n._f) >= (j = (o._d = x._d).length) ? this._zeroes(o._d, r - j + 1, 1).length : j) - r, o.round()
  }

  o.divide = function (n) {
    if ((n = new BigNumber(n)) == '0') throw new Error('Division by 0')
    else if (this == '0') return new BigNumber()
    const o = new BigNumber(this)
    let a = o._d, b = n._d, la = a.length - o._f, lb = b.length - n._f
    const rr = new BigNumber()
    let i = 0, j, s, l, f = 1, c = 0, e = 0
    rr._s = o._s !== n._s; rr.precision = Math.max(o.precision, n.precision)
    rr._f = +rr._d.pop()
    la !== lb && o._zeroes(la > lb ? b : a, Math.abs(la - lb))
    n._f = b.length; b = n; b._s = false; b = b.round()
    const nn = new BigNumber()
    for (; a[0] == '0'; a.shift());
    outer: do {
      for (l = c = 0, nn == '0' && (nn._d = [], nn._f = 0); i < a.length && nn.compare(b) === -1; ++i) {
        (l = i + 1 === a.length, (!f && ++c > 1 || (e = l && nn == '0' && a[i] == '0')))
          && (rr._f === rr._d.length && ++rr._f, rr._d.push(0));
        (a[i] == '0' && nn == '0') || (nn._d.push(a[i]), ++nn._f)
        if (e) break outer
        if ((l && nn.compare(b) === -1 && (rr._f === rr._d.length && ++rr._f, 1)) || (l = 0))
          while (rr._d.push(0), nn._d.push(0), ++nn._f, nn.compare(b) === -1);
      }
      if (f = 0, nn.compare(b) === -1 && !(l = 0))
        while (l ? rr._d.push(0) : l = 1, nn._d.push(0), ++nn._f, nn.compare(b) === -1);
      const ss = new BigNumber()
      for (j = 0; nn.compare(ss.add(b)) + 1 && ++j; ss.set(ss.add(b)));
      nn.set(nn.subtract(ss)); !l && rr._f === rr._d.length && ++rr._f; rr._d.push(j)
    } while ((i < a.length || nn != '0') && (rr._d.length - rr._f) <= rr.precision)
    return rr.round()
  }

  o.mod = function (n) { return this.subtract(this.divide(n).intPart().multiply(n)) }
  o.pow = function (n) {
    const o = new BigNumber(this)
    if ((n = new BigNumber(n).intPart()) == 0) return o.set(1)
    for (let i = Math.abs(n); --i; o.set(o.multiply(this)));
    return n < 0 ? o.set(new BigNumber(1).divide(o)) : o
  }
  o.set = function (n) { this.constructor(n); return this }
  o.compare = function (n) {
    const a2 = this, la = this._f, b = new BigNumber(n), lb = b._f, r = [-1, 1]
    let i, l
    if (a2._s !== b._s) return a2._s ? -1 : 1
    if (la !== lb) return r[(la > lb) ^ a2._s]
    const aa = a2._d, bb = b._d
    const laa = aa.length, lbb = bb.length
    for (i = -1, l = Math.min(laa, lbb); ++i < l;)
      if (aa[i] !== bb[i]) return r[(aa[i] > bb[i]) ^ a2._s]
    return laa !== lbb ? r[(laa > lbb) ^ a2._s] : 0
  }
  o.negate = function () { const n = new BigNumber(this); n._s ^= 1; return n }
  o.abs = function () { const n = new BigNumber(this); n._s = 0; return n }
  o.intPart = function () { return new BigNumber((this._s ? '-' : '') + (this._d.slice(0, this._f).join('') || '0')) }
  o.valueOf = o.toString = function () {
    const o = this
    return (o._s ? '-' : '') + (o._d.slice(0, o._f).join('') || '0') + (o._f !== o._d.length ? '.' + o._d.slice(o._f).join('') : '')
  }

  return BigNumber
})()

// ─── Public Functions ────────────────────────────────────────────────────────

/**
 * 判斷 Ajax 回應是否成功
 * 成功條件：回應物件含 `ErrMsg.returnCode === 0`
 * @param {Object} resp - Ajax 回應物件
 * @returns {boolean} 是否成功
 */
export function isSuccess(resp) {
  const msg = getReturnMessage(resp)
  if (msg) {
    return msg.returnCode == 0
  }
  return false
}

/**
 * 從 Ajax 回應物件取出訊息物件（`ErrMsg`）
 * @param {Object} resp - Ajax 回應物件
 * @returns {Object|undefined} ErrMsg 物件，無法取得時回傳 undefined
 */
export function getReturnMessage(resp) {
  if (resp) {
    return resp['ErrMsg']
  }
}

/**
 * 判斷 XMLHttpRequest 是否仍在進行中
 * readyState 1~3 視為進行中，0 與 4 視為非進行中
 * @param {XMLHttpRequest} xmlhttp - XHR 物件
 * @returns {boolean} 是否進行中
 */
export function isOnProgress(xmlhttp) {
  switch (xmlhttp.readyState) {
    case 1:
    case 2:
    case 3:
      return true
    default:
      return false
  }
}

/**
 * 依指定 pattern 格式化數字字串
 * 支援千分位分隔（`,`）與小數位控制（`#` 為可省略，`0` 為必填）
 * 範例：`$fmt(1234567.8, '#,###.##')` → `'1,234,567.8'`
 * @param {string|number} v - 數值
 * @param {string} pattern - 格式字串，如 `'#,###.####'`
 * @param {boolean} [isInput] - 是否為輸入模式（影響小數截斷行為）
 * @returns {string} 格式化後的字串，無法解析時回傳空字串或原始值
 */
export function $fmt(v, pattern, isInput) {
  if (v === undefined || v === null) return ''

  const replacePattern = /,/g
  let str = ('' + v).toLowerCase().replace(replacePattern, '')

  if (!str || str === '') return ''
  if (isNaN(str)) return v

  const dot = pattern.indexOf('.')
  let precision = BigNumber.defaultPrecision

  if (dot !== -1) {
    precision = pattern.substr(dot + 1).length
  } else if (isInput) {
    precision = 0
  } else {
    pattern += '.' + '#'.repeat(precision)
  }

  const eePrest = str.indexOf('e')
  if (eePrest !== -1) {
    const powerN = new BigNumber(10).pow(new Number(str.substring(eePrest + 1)))
    str = new BigNumber(str.substring(0, eePrest), precision).multiply(powerN).toString()
  } else if (!isInput) {
    str = new BigNumber(str, precision).toString()
  }

  const minus = str.startsWith('-')
  if (minus) str = str.substr(1)

  const ary = str.split('.', 2)
  let intPart = ary[0]
  let floatPart = ary[1]

  let resultStr = _formatInteger(intPart, pattern, dot)

  if (precision > 0) {
    if (isInput) {
      if (str.indexOf('.') !== -1) {
        resultStr += '.' + floatPart.substr(0, precision)
      }
    } else {
      const fp = _formatFloat(floatPart, pattern, dot, precision)
      if (fp) resultStr += '.' + fp
    }
  }

  return minus ? '-' + resultStr : resultStr

  function _formatInteger(intPart, pattern, dotPos) {
    const sep = pattern.indexOf(',')
    if (sep === -1) return intPart
    const sepLen = dotPos !== -1 ? dotPos - sep - 1 : pattern.length - sep - 1
    const m = intPart.length
    if (m > sepLen) {
      const firstP = m % sepLen
      let sectionN = parseInt(m / sepLen)
      const sAry = []
      let pos = 0
      if (firstP > 0) { sAry.push(intPart.substr(0, firstP)); pos = firstP }
      while (sectionN > 0) { sAry.push(intPart.substr(pos, sepLen)); pos += sepLen; sectionN-- }
      intPart = sAry.join(',')
    }
    return intPart
  }

  function _formatFloat(floatPart, pattern, dotPos, precision) {
    const floatPattern = pattern.substr(dotPos + 1)
    if (!isNaN(floatPart)) {
      const fm = (floatPart || '').length
      if (fm > precision) {
        floatPart = floatPart.substr(0, precision)
      } else if (fm < precision) {
        floatPart = (floatPart || '') + '0'.repeat(precision - fm)
      }
    } else {
      floatPart = '0'.repeat(precision)
    }
    let x = floatPart.length - 1
    while (x >= 0) {
      if (floatPattern.charAt(x) === '#' && floatPart.charAt(x) !== '0') break
      else if (floatPattern.charAt(x) === '0') break
      else floatPart = floatPart.substr(0, x)
      x--
    }
    return floatPart
  }
}

/**
 * 四捨五入至指定小數位數
 * @param {number} val - 數值
 * @param {number} [scale=4] - 小數位數，預設 4 位
 * @returns {number} 四捨五入後的數值
 */
export function round(val, scale) {
  if (scale === undefined) scale = 4
  return Math.round(val * Math.pow(10, scale)) / Math.pow(10, scale)
}

/**
 * 將 YYYY-MM-DD 格式日期字串解析為毫秒數（Date.parse 結果）
 * @param {string} str - 日期字串（YYYY-MM-DD）
 * @returns {number|null} 毫秒數，無法解析時回傳 null
 */
export function parseDate(str) {
  if (!str) return null
  return Date.parse(str.replace(/-/g, '/'))
}

/**
 * 計算兩個 YYYY-MM-DD 日期之間的相差天數（d2 - d1）
 * @param {string} d1 - 起始日期（YYYY-MM-DD）
 * @param {string} d2 - 結束日期（YYYY-MM-DD）
 * @returns {number} 相差天數，d2 在 d1 之後為正值
 */
export function dateRange(d1, d2) {
  return (parseDate(d2) - parseDate(d1)) / 86400000
}

/**
 * 判斷 keyCode 是否為數字、負號、小數點或 Backspace（用於 keypress 事件驗證）
 * @param {number} code - event.keyCode
 * @returns {boolean} 是否為允許的按鍵
 */
export function pressNumber(code) {
  return (code > 47 && code < 58) || code === 46 || code === 45 || code === 8
}

/**
 * 判斷 keyCode 是否為數字相關按鍵（含 numpad，用於 keyup 事件驗證）
 * @param {number} code - event.keyCode
 * @returns {boolean} 是否為允許的按鍵
 */
export function upNumber(code) {
  if ((code > 95 && code < 106) || code === 110 || code === 109) return true
  return pressNumber(code)
}

/**
 * 將值轉為數字，遇 undefined / null / NaN / 空值時回傳 0
 * @param {*} val - 任意值
 * @returns {number} 數值，無法轉換時回傳 0
 */
export function getNumber(val) {
  if (typeof val === 'number') return val
  if (val === undefined || val === null) return 0
  const str = String(val).replace(/,/g, '')
  if (isNaN(str) || str === '') return 0
  return Number(str)
}

/**
 * 將西元日期字串轉為民國日期字串，分隔符號固定為 `/`
 * 支援格式：YYYY-MM-DD、YYYYMMDD、YYYY/MM/DD，可附帶時間部分
 * 範例：`toROC('2025-05-27')` → `'114/05/27'`
 * @param {string} d - 西元日期字串
 * @returns {string} 民國日期字串，無法解析時回傳空字串
 */
export function toROC(d) {
  return toInputROC(d, '/')
}

/**
 * 將西元日期字串轉為民國日期字串，可自訂分隔符號
 * 支援格式：YYYY-MM-DD、YYYYMMDD、YYYY/MM/DD，可附帶時間部分
 * 範例：`toInputROC('2025-05-27', '')` → `'1140527'`
 * @param {string} d - 西元日期字串
 * @param {string} delimiter - 分隔符號（空字串則無分隔）
 * @returns {string} 民國日期字串，無法解析時回傳空字串
 */
export function toInputROC(d, delimiter) {
  if (!d) return ''

  const patterns = [
    /^(\d{4})-(\d{2})-(\d{2})/,
    /^(\d{4})(\d{2})(\d{2})/,
    /^(\d{4})\/(\d{2})\/(\d{2})/,
  ]

  const timePart = d.split(' ')
  const time = timePart.length > 1 ? timePart[1] : null

  for (const p of patterns) {
    const m = d.match(p)
    if (m) {
      const rocYear = parseInt(m[1], 10) - 1911
      let r
      if (delimiter) {
        r = rocYear + delimiter + m[2] + delimiter + m[3]
      } else {
        r = String(rocYear) + m[2] + m[3]
      }
      if (time) r = r + ' ' + time
      return r
    }
  }
  return ''
}

// ─── maskHandler ─────────────────────────────────────────────────────────────

/** 預設遮罩符號 */
const MASK_SIGN = '*'

/**
 * 對字串指定位置進行遮罩替換
 * 範例：`getMaskStr('1234567890', 2, false, '*')` → `'12********'`
 * 範例：`getMaskStr('1234567890', 3, 2, '#')` → `'123##67890'`
 * @param {string} str - 原始字串
 * @param {number} beginIndex - 遮罩起始位置（從 0 開始計算）
 * @param {number|false} maskLength - 遮罩長度；`false` 表示遮至字串結尾
 * @param {string} [inSign='*'] - 遮罩符號
 * @returns {string} 遮罩後字串
 */
export function getMaskStr(str, beginIndex, maskLength, inSign) {
  if (!str) return str

  const strLength = str.length
  const sign = inSign || MASK_SIGN

  if (beginIndex > strLength || maskLength === 0) return str

  const endIndex = !maskLength ? 0 : beginIndex + maskLength

  if (!endIndex || (endIndex > 0 && endIndex > strLength)) {
    let tempStr = str.substr(0, beginIndex)
    while (tempStr.length < strLength) tempStr += sign
    return tempStr
  }

  let tempStr = str.substr(0, beginIndex)
  for (let i = 0; i < maskLength; i++) tempStr += sign
  tempStr += str.substr(endIndex)
  return tempStr
}

/**
 * 遮罩身分證字號中間 n 碼
 * 範例：`getMaskID('X123456789')` → `'X123***789'`
 * 範例：`getMaskID('X123456789', 5)` → `'X12*****89'`
 * @param {string} str - 身分證字號
 * @param {number} [maskLength=3] - 遮罩中間碼數，預設 3 碼
 * @returns {string} 遮罩後字串
 */
export function getMaskID(str, maskLength) {
  maskLength = isNaN(maskLength) ? 3 : maskLength
  const strLen = !str ? 0 : str.length

  if (strLen <= maskLength) {
    return MASK_SIGN.repeat(maskLength)
  }

  const diffLen2 = strLen - maskLength
  const hasAdd1 = diffLen2 % 2 !== 0
  let dl = hasAdd1 ? diffLen2 - 1 : diffLen2
  const last = dl === 0 ? 0 : dl / 2
  const firstIndex = hasAdd1 ? last + 1 : last

  return getMaskStr(str, firstIndex, maskLength)
}

/**
 * 遮罩姓名第 2 個字
 * 範例：`getMaskName('程設師')` → `'程＊師'`
 * @param {string} str - 姓名字串
 * @param {string} [inSign='＊'] - 遮罩符號，預設全型星號
 * @returns {string} 遮罩後字串
 */
export function getMaskName(str, inSign) {
  const sign = inSign || '＊'
  return getMaskStr(str, 1, 1, sign)
}

/**
 * 遮罩地址第 3 碼之後的所有字元
 * 範例：`getMaskAddress('台北市內湖區光復路一段')` → `'台北市＊＊＊＊＊＊＊＊＊＊'`
 * @param {string} str - 地址字串
 * @param {string} [inSign='＊'] - 遮罩符號，預設全型星號
 * @returns {string} 遮罩後字串
 */
export function getMaskAddress(str, inSign) {
  const sign = inSign || '＊'
  return getMaskStr(str, 3, false, sign)
}

/**
 * 遮罩地址（依長度分段遮罩）
 * - 超過 20 碼：遮第 20 碼之後的字元
 * - 超過 10 碼：遮第 10 碼之後的字元
 * - 10 碼以內：不遮罩
 * @param {string} str - 地址字串
 * @param {string} [inSign='＊'] - 遮罩符號，預設全型星號
 * @returns {string} 遮罩後字串
 */
export function getMaskAddress2(str, inSign) {
  if (!str) return str
  const sign = inSign || '＊'
  const strLength = str.length
  if (strLength > 20) return getMaskStr(str, 20, false, sign)
  if (strLength > 10) return getMaskStr(str, 10, false, sign)
  return str
}
