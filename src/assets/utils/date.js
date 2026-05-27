/**
 * date.js 工具函式遷移
 * 來源：CM/js/date.js
 */

// ─── 內部輔助 ────────────────────────────────────────────────────────────────

/**
 * 民國日期字串 → JS Date 物件
 * 支援格式：yMMdd、yyMMdd、yyyMMdd、y/MM/dd、yy/MM/dd、yyy/MM/dd、y-MM-dd、yy-MM-dd、yyy-MM-dd
 * @param {string} srcData
 * @param {boolean} [isROCBefore=false] 是否允許民國前（負數年份，前綴 '-'）
 * @returns {Date|undefined}
 */
function _stringToDate_ROC(srcData, isROCBefore) {
  let rocDateIsBefore = 1

  if (isROCBefore === true && srcData.substring(0, 1) === '-') {
    srcData = srcData.substring(1)
    rocDateIsBefore = -1
  }

  const patterns = [
    /^(\d{1})(\d{2})(\d{2})$/,
    /^(\d{2})(\d{2})(\d{2})$/,
    /^(\d{3})(\d{2})(\d{2})$/,
    /^(\d{1})\/(\d{2})\/(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{2})$/,
    /^(\d{3})\/(\d{2})\/(\d{2})$/,
    /^(\d{1})-(\d{2})-(\d{2})$/,
    /^(\d{2})-(\d{2})-(\d{2})$/,
    /^(\d{3})-(\d{2})-(\d{2})$/,
  ]

  for (const p of patterns) {
    const m = srcData.match(p)
    if (m) {
      return new Date(
        rocDateIsBefore * parseInt(m[1], 10) + 1911,
        parseInt(m[2], 10) - 1,
        parseInt(m[3], 10)
      )
    }
  }
  return undefined
}

/**
 * 西元日期字串 → JS Date 物件
 * 支援格式：yyyyMMdd、yyyy/MM/dd、yyyy-MM-dd
 * @param {string} srcData
 * @returns {Date|undefined}
 */
function _stringToDate_Y2K(srcData) {
  const patterns = [
    /^(\d{4})(\d{2})(\d{2})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
    /^(\d{4})-(\d{2})-(\d{2})$/,
  ]

  for (const p of patterns) {
    const m = srcData.match(p)
    if (m) {
      return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10))
    }
  }
  return undefined
}

function _pad2(n) {
  return n < 10 ? '0' + n : String(n)
}

// ─── Public Functions ────────────────────────────────────────────────────────

/**
 * 驗證民國日期字串
 * 支援格式：yyyMMdd、yyy/MM/dd、yyy-MM-dd（及 yy / y 開頭變體）
 * @param {string} srcData
 * @param {boolean} [yearLimit=true] 是否限制民國 20 年以後（含 000101）
 * @param {boolean} [isROCBefore=false] 是否允許民國前（負數年份）
 * @returns {boolean}
 */
export function isROCdate(srcData, yearLimit, isROCBefore) {
  const patterns = [
    /^(\d{1})(\d{2})(\d{2})$/,
    /^(\d{2})(\d{2})(\d{2})$/,
    /^(\d{3})(\d{2})(\d{2})$/,
    /^(\d{1})\/(\d{2})\/(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{2})$/,
    /^(\d{3})\/(\d{2})\/(\d{2})$/,
    /^(\d{1})-(\d{2})-(\d{2})$/,
    /^(\d{2})-(\d{2})-(\d{2})$/,
    /^(\d{3})-(\d{2})-(\d{2})$/,
  ]

  let matched = null
  let checkSrc = srcData
  let rocDateIsBefore = 1

  if (isROCBefore === true && typeof srcData === 'string' && srcData[0] === '-') {
    checkSrc = srcData.substring(1)
    rocDateIsBefore = -1
  }

  for (const p of patterns) {
    const m = checkSrc.match(p)
    if (m) { matched = m; break }
  }

  if (!matched) return false

  const year = rocDateIsBefore * parseInt(matched[1], 10) + 1911
  const month = parseInt(matched[2], 10)
  const day = parseInt(matched[3], 10)
  const d = new Date(year, month - 1, day)

  if (!d || d.getMonth() !== month - 1 || d.getDate() !== day) return false

  if (yearLimit !== false) {
    if (!(d.getFullYear() === 1911 && d.getMonth() === 0 && d.getDate() === 1) && d.getFullYear() < 1931) {
      return false
    }
  }

  return true
}

/**
 * 計算兩日期相差天數（date2 - date1）
 * @param {string} str1 日期1
 * @param {string} str2 日期2
 * @param {boolean} [isROC] 是否為民國格式，預設依 str1 格式自動判斷
 * @returns {number}
 */
export function diffDay(str1, str2, isROC) {
  let dateInt1, dateInt2

  if (typeof isROC === 'undefined') {
    dateInt1 = _stringToDate_Y2K(str1)
    isROC = dateInt1 ? false : true
  } else if (!isROC) {
    dateInt1 = _stringToDate_Y2K(str1)
  }

  if (isROC) {
    dateInt1 = _stringToDate_ROC(str1, true)
    dateInt2 = _stringToDate_ROC(str2, true)
  } else {
    dateInt2 = _stringToDate_Y2K(str2)
  }

  return (dateInt2 - dateInt1) / 86400000
}

/**
 * 計算兩民國日期相差天數（date2 - date1）
 * @param {string} strRoc1
 * @param {string} strRoc2
 * @returns {number}
 */
export function diffDayROC(strRoc1, strRoc2) {
  return diffDay(strRoc1, strRoc2, true)
}

/**
 * 計算兩西元日期相差天數（date2 - date1）
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
export function diffDayY2K(str1, str2) {
  return diffDay(str1, str2, false)
}

/**
 * 西元日期（yyyy-MM-dd）→ 民國日期字串（yyyMMdd）
 * @param {string} Y2Kdate 格式必須為 yyyy-MM-dd（長度 10）
 * @returns {string}
 */
export function toROC(Y2Kdate) {
  if (!Y2Kdate || Y2Kdate.length !== 10) return ''
  const roc = parseInt(Y2Kdate.substring(0, 4), 10) - 1911
  return String(roc) + Y2Kdate.substring(5, 7) + Y2Kdate.substring(8, 10)
}

/**
 * 民國日期字串 → 西元日期（yyyy-MM-dd）
 * @param {string} ROCdate
 * @returns {string} 無法解析時回傳原始值
 */
export function toY2K(ROCdate) {
  const patterns = [
    /^(\d{1})(\d{2})(\d{2})$/,
    /^(\d{2})(\d{2})(\d{2})$/,
    /^(\d{3})(\d{2})(\d{2})$/,
    /^(\d{1})\/(\d{2})\/(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{2})$/,
    /^(\d{3})\/(\d{2})\/(\d{2})$/,
    /^(\d{1})-(\d{2})-(\d{2})$/,
    /^(\d{2})-(\d{2})-(\d{2})$/,
    /^(\d{3})-(\d{2})-(\d{2})$/,
  ]

  for (const p of patterns) {
    const m = ROCdate.match(p)
    if (m) {
      const year = parseInt(m[1], 10) + 1911
      const d = new Date(year, parseInt(m[2], 10) - 1, parseInt(m[3], 10))
      if (d.getMonth() !== parseInt(m[2], 10) - 1 || d.getDate() !== parseInt(m[3], 10)) {
        return ROCdate
      }
      return `${d.getFullYear()}-${m[2]}-${m[3]}`
    }
  }
  return ROCdate
}

/**
 * 判斷西元年份是否為閏年
 * @param {string|number} datInput 西元年份或 yyyy-MM-dd 字串
 * @returns {boolean}
 */
export function isLeap(datInput) {
  let intYY
  if (typeof datInput === 'string') {
    intYY = datInput.length > 4
      ? parseInt(datInput.substring(0, 4), 10)
      : parseInt(datInput, 10)
  } else {
    intYY = datInput
  }

  if (intYY % 4 !== 0) return false
  if (intYY % 100 !== 0) return true
  return intYY % 400 === 0
}

/**
 * 日期加減，輸入輸出均為 yyyy-MM-dd
 * @param {string} strDate yyyy-MM-dd
 * @param {number} intYY 加減年數
 * @param {number} intMM 加減月數
 * @param {number} intDD 加減天數
 * @returns {string} yyyy-MM-dd，無法解析時回傳空字串
 */
export function addDate(strDate, intYY, intMM, intDD) {
  if (!strDate || strDate.length !== 10) return ''

  const formatYear = parseInt(strDate.substr(0, 4), 10)
  const formatMonth = parseInt(strDate.substr(5, 2), 10) - 1
  const formatDate = parseInt(strDate.substr(8, 2), 10)

  const d = new Date(formatYear, formatMonth, formatDate)

  if (intYY !== 0) {
    d.setFullYear(d.getFullYear() + intYY)
    if (d.getDate() !== formatDate) {
      d.setMonth(formatMonth)
      d.setDate(formatDate - 1)
    }
  }

  if (intMM !== 0) {
    const tempDate = d.getDate()
    d.setDate(1)
    d.setMonth(d.getMonth() + intMM)
    const tempMonth = d.getMonth()
    d.setDate(tempDate)
    if (tempMonth !== d.getMonth()) {
      d.setDate(0)
    }
  }

  if (intDD !== 0) {
    d.setDate(d.getDate() + intDD)
  }

  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${d.getFullYear()}-${_pad2(m)}-${_pad2(day)}`
}

/**
 * 取得今日西元日期
 * @returns {string} yyyy-MM-dd
 */
export function getY2KToday() {
  const d = new Date()
  return `${d.getFullYear()}-${_pad2(d.getMonth() + 1)}-${_pad2(d.getDate())}`
}

/**
 * 取得今日民國日期
 * @returns {string} yyyMMdd
 */
export function getToday() {
  const d = new Date()
  const roc = d.getFullYear() - 1911
  return `${roc}${_pad2(d.getMonth() + 1)}${_pad2(d.getDate())}`
}

/**
 * 取得現在時刻
 * @returns {string} HHmmss
 */
export function getTime() {
  const d = new Date()
  return `${_pad2(d.getHours())}${_pad2(d.getMinutes())}${_pad2(d.getSeconds())}`
}

/**
 * 驗證西元日期字串
 * 支援格式：yyyyMMdd、yyyy/MM/dd、yyyy-MM-dd
 * @param {string} srcData
 * @param {boolean} [yearLimit=true] 是否限制 1931 年以後（含 1911-01-01）
 * @returns {boolean}
 */
export function isADdate(srcData, yearLimit) {
  const d = _stringToDate_Y2K(srcData)
  const patterns = [
    /^(\d{4})(\d{2})(\d{2})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
    /^(\d{4})-(\d{2})-(\d{2})$/,
  ]

  let month, day
  for (const p of patterns) {
    const m = srcData.match(p)
    if (m) { month = parseInt(m[2], 10); day = parseInt(m[3], 10); break }
  }

  if (!d || d.getMonth() !== month - 1 || d.getDate() !== day) return false

  if (yearLimit !== false) {
    if (!(d.getFullYear() === 1911 && d.getMonth() === 0 && d.getDate() === 1) && d.getFullYear() < 1931) {
      return false
    }
  }

  return true
}

/**
 * 驗證民國日期，月份允許 01-13（第 13 月視為 12 月）
 * @param {string} srcData
 * @param {boolean} [yearLimit=true]
 * @returns {boolean}
 */
export function isROC13Mdate(srcData, yearLimit) {
  const patterns = [
    /^(\d{2})(\d{2})(\d{2})$/,
    /^(\d{3})(\d{2})(\d{2})$/,
    /^(\d{4})(\d{2})(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{2})$/,
    /^(\d{3})\/(\d{2})\/(\d{2})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
  ]

  let month, day, d
  for (const p of patterns) {
    const m = srcData.match(p)
    if (m) {
      month = parseInt(m[2], 10)
      day = parseInt(m[3], 10)
      if (month === 13) month = 12
      d = new Date(parseInt(m[1], 10) + 1911, month - 1, day)
      break
    }
  }

  if (!d || d.getMonth() !== month - 1 || d.getDate() !== day) return false

  if (yearLimit !== false) {
    if (!(d.getFullYear() === 1911 && d.getMonth() === 0 && d.getDate() === 1) && d.getFullYear() < 1931) {
      return false
    }
  }

  return true
}

/**
 * 驗證民國年月格式，月份允許 01-13
 * 支援格式：yyMM、yyyMM
 * @param {string} srcData
 * @returns {boolean}
 */
export function isROC13Month(srcData) {
  const patterns = [/^(\d{2})(\d{2})$/, /^(\d{3})(\d{2})$/]

  let month, d
  for (const p of patterns) {
    const m = srcData.match(p)
    if (m) {
      month = parseInt(m[2], 10)
      if (month === 13) month = 12
      d = new Date(parseInt(m[1], 10) + 1911, month - 1, 1)
      break
    }
  }

  if (!d || d.getMonth() !== month - 1) return false
  return true
}

/**
 * 驗證民國年月日，月份允許 01-13，日期必須為 01
 * 支援格式：yyMMdd、yyyMMdd
 * @param {string} srcData
 * @param {boolean} [yearLimit=true]
 * @returns {boolean}
 */
export function isROC13MonthFirstDay(srcData, yearLimit) {
  const patterns = [/^(\d{2})(\d{2})(\d{2})$/, /^(\d{3})(\d{2})(\d{2})$/]

  let month, day, d
  for (const p of patterns) {
    const m = srcData.match(p)
    if (m) {
      month = parseInt(m[2], 10)
      day = parseInt(m[3], 10)
      if (day !== 1) return false
      if (month === 13) month = 12
      d = new Date(parseInt(m[1], 10) + 1911, month - 1, 1)
      break
    }
  }

  if (!d || d.getMonth() !== month - 1) return false

  if (yearLimit !== false) {
    if (!(d.getFullYear() === 1911 && d.getMonth() === 0 && d.getDate() === 1) && d.getFullYear() < 1931) {
      return false
    }
  }

  return true
}

/**
 * 民國日期字串 → JS Date 物件（公開版）
 * @param {string} srcData
 * @param {boolean} [isROCBefore=false]
 * @returns {Date|undefined}
 */
export function stringToDate_ROC(srcData, isROCBefore) {
  return _stringToDate_ROC(srcData, isROCBefore)
}

/**
 * 西元日期字串 → JS Date 物件（公開版）
 * @param {string} srcData
 * @returns {Date|undefined}
 */
export function stringToDate_Y2K(srcData) {
  return _stringToDate_Y2K(srcData)
}

/**
 * 依 pattern 格式化日期字串
 *
 * locale:
 *   'tw'（預設）：民國年、中文月份星期
 *   'en'：西元年、英文月份星期
 *
 * pattern 符號：
 *   yyyy / yyy / yy / y  → 年（yyy/yy/y 依 locale 處理民國 / 末 2 碼）
 *   MMMM / MMM / MM / M  → 月
 *   dd / d               → 日
 *   EEEE / EEE / EE / E  → 星期
 *   HH / H               → 時（24h）
 *   hh / h               → 時（12h）
 *   mm / m               → 分
 *   ss / s               → 秒
 *
 * @param {string} pattern
 * @param {'tw'|'en'} [locale='tw']
 */
export function SimpleDateFormat(pattern, locale) {
  const isTW = locale !== 'en'

  const monthArray = isTW
    ? ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
    : ['January','February','March','April','May','June','July','August','September','October','November','December']

  const weekArray = isTW
    ? ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
    : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  const patternDefs = [
    { key: 'yyyy', method: 'getFullYear' },
    { key: 'yyy',  method: 'getFullYear', subLength: 3, isROC: isTW },
    { key: 'yy',   method: 'getFullYear', subLength: 2, isROC: isTW },
    { key: 'y',    method: 'getFullYear', subLength: 2, isROC: isTW },
    { key: 'MMMM', method: 'getMonth', pad: true, isFull: true },
    { key: 'MMM',  method: 'getMonth', pad: true },
    { key: 'MM',   method: 'getMonth', pad: true },
    { key: 'M',    method: 'getMonth', pad: false },
    { key: 'dd',   method: 'getDate',  pad: true },
    { key: 'd',    method: 'getDate',  pad: false },
    { key: 'EEEE', method: 'getDay', isFull: true },
    { key: 'EEE',  method: 'getDay' },
    { key: 'EE',   method: 'getDay' },
    { key: 'E',    method: 'getDay' },
    { key: 'HH',   method: 'getHours',   pad: true },
    { key: 'H',    method: 'getHours',   pad: false },
    { key: 'hh',   method: 'getHours',   pad: true,  is12h: true },
    { key: 'h',    method: 'getHours',   pad: false, is12h: true },
    { key: 'mm',   method: 'getMinutes', pad: true },
    { key: 'm',    method: 'getMinutes', pad: false },
    { key: 'ss',   method: 'getSeconds', pad: true },
    { key: 's',    method: 'getSeconds', pad: false },
  ]

  const pat = pattern || 'yyyy-MM-dd'

  const groupUsed = {}
  const groupOf = {
    yyyy:'year',yyy:'year',yy:'year',y:'year',
    MMMM:'month',MMM:'month',MM:'month',M:'month',
    dd:'day',d:'day',
    EEEE:'week',EEE:'week',EE:'week',E:'week',
    HH:'hour',H:'hour',hh:'hour',h:'hour',
    mm:'minute',m:'minute',
    ss:'second',s:'second',
  }

  const tokens = []
  for (const def of patternDefs) {
    const idx = pat.indexOf(def.key)
    if (idx < 0 || !groupOf[def.key] || groupUsed[groupOf[def.key]]) continue
    groupUsed[groupOf[def.key]] = true
    tokens.push({ ...def, index: idx })
  }
  tokens.sort((a, b) => a.index - b.index)

  this.format = function (inDate) {
    if (typeof inDate !== 'string' || inDate === '') return ''

    let d
    const datePatterns = [
      /^(\d{4})(\d{2})(\d{2})$/,
      /^(\d{4})\/(\d{2})\/(\d{2})$/,
      /^(\d{4})-(\d{2})-(\d{2})$/,
    ]
    const tsPatterns = [
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})[.\d]+$/,
    ]

    for (const p of datePatterns) {
      const m = inDate.match(p)
      if (m) { d = new Date(+m[1], +m[2]-1, +m[3]); break }
    }
    if (!d) {
      for (const p of tsPatterns) {
        const m = inDate.match(p)
        if (m) { d = new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5], +m[6]); break }
      }
    }
    if (!d) return inDate

    let out = ''
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i]
      const prevEnd = i === 0 ? 0 : tokens[i-1].index + tokens[i-1].key.length

      if (t.index > prevEnd) out += pat.substring(prevEnd, t.index)

      let val = d[t.method]()

      if (t.key === 'MMMM' || t.key === 'MMM') {
        const mv = monthArray[val]
        out += t.isFull ? mv : isTW ? mv.substring(0, mv.length - 1) : mv.substring(0, 3)
        continue
      }
      if (['EEEE','EEE','EE','E'].includes(t.key)) {
        const wv = weekArray[val]
        out += t.isFull ? wv : isTW ? wv[wv.length-1] : wv.substring(0,3)
        continue
      }
      if (t.key === 'MM' || t.key === 'M') val += 1
      if (t.is12h && val > 12) val -= 12
      if (t.isROC) val -= 1911
      let str = String(val)
      if (t.subLength > 0 && str.length > t.subLength) str = str.slice(-t.subLength)
      if (t.pad && val < 10) str = '0' + str
      out += str
    }

    const lastToken = tokens[tokens.length - 1]
    if (lastToken) {
      const lastEnd = lastToken.index + lastToken.key.length
      if (lastEnd < pat.length) out += pat.substring(lastEnd)
    }

    return out
  }
}

SimpleDateFormat.TW = 'tw'
SimpleDateFormat.US = 'en'

/**
 * 取得當前 timestamp 字串
 * @returns {string} yyyy-MM-dd HH:mm:ss.SSS
 */
export function getCurrentTimeStamp() {
  const d = new Date()
  const ms = d.getMilliseconds()
  const msPad = ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : String(ms)
  return `${d.getFullYear()}-${_pad2(d.getMonth()+1)}-${_pad2(d.getDate())} ` +
         `${_pad2(d.getHours())}:${_pad2(d.getMinutes())}:${_pad2(d.getSeconds())}.${msPad}`
}

/**
 * 驗證字串是否為年月格式
 * @param {string} srcDate
 * @param {boolean} isROC true：民國年月（yyyMM）；false：西元年月（yyyyMM）
 * @returns {boolean}
 */
export function isDateYM(srcDate, isROC) {
  const vp = isROC
    ? /^(\d{2,3})(0[1-9]|1[0-2])$/
    : /^(\d{4})(0[1-9]|1[0-2])$/
  return vp.test(srcDate)
}
