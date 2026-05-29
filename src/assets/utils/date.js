// ── 內部解析工具 ─────────────────────────────────────────────────────────────

/**
 * 解析民國日期字串，回傳 Date 物件與解析後的月、日
 * @param {string} srcData
 * @param {boolean} [isROCBefore=false]
 * @returns {{ date: Date, month: number, day: number } | null}
 */
function _parseROCDate(srcData, isROCBefore = false) {
  let str = srcData
  let sign = 1

  if (isROCBefore && str.startsWith('-')) {
    str = str.slice(1)
    sign = -1
  }

  const patterns = [
    /^(\d{1,3})(\d{2})(\d{2})$/,
    /^(\d{1,3})\/(\d{2})\/(\d{2})$/,
    /^(\d{1,3})-(\d{2})-(\d{2})$/,
  ]

  for (const pattern of patterns) {
    const match = str.match(pattern)
    if (!match) continue
    const year  = sign * parseInt(match[1], 10) + 1911
    const month = parseInt(match[2], 10)
    const day   = parseInt(match[3], 10)
    return { date: new Date(year, month - 1, day), month, day }
  }
  return null
}

/**
 * 解析西元日期字串，回傳 Date 物件與解析後的月、日
 * @param {string} srcData
 * @returns {{ date: Date, month: number, day: number } | null}
 */
function _parseY2KDate(srcData) {
  const patterns = [
    /^(\d{4})(\d{2})(\d{2})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
    /^(\d{4})-(\d{2})-(\d{2})$/,
  ]

  for (const pattern of patterns) {
    const match = srcData.match(pattern)
    if (!match) continue
    const year  = parseInt(match[1], 10)
    const month = parseInt(match[2], 10)
    const day   = parseInt(match[3], 10)
    return { date: new Date(year, month - 1, day), month, day }
  }
  return null
}

// ── 日期格式驗證 ──────────────────────────────────────────────────────────────

/**
 * 驗證民國日期格式（支援 yyyMMdd / yyy/MM/dd / yyy-MM-dd）
 * @param {string}  srcData
 * @param {boolean} [yearLimit=true]    是否限制民國 20 年以後
 * @param {boolean} [isROCBefore=false] 是否允許民國前日期（以 - 開頭）
 * @returns {boolean}
 */
export function isROCdate(srcData, yearLimit = true, isROCBefore = false) {
  const parsed = _parseROCDate(srcData, isROCBefore)
  if (!parsed) return false

  const { date, month, day } = parsed
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return false

  if (yearLimit !== false) {
    const isOrigin = date.getFullYear() === 1911 && date.getMonth() === 0 && date.getDate() === 1
    if (!isOrigin && date.getFullYear() < 1931) return false
  }

  return true
}

/**
 * 驗證西元日期格式（支援 yyyyMMdd / yyyy/MM/dd / yyyy-MM-dd）
 * @param {string}  srcData
 * @param {boolean} [yearLimit=true] 是否限制 1931 年以後
 * @returns {boolean}
 */
export function isADdate(srcData, yearLimit = true) {
  const parsed = _parseY2KDate(srcData)
  if (!parsed) return false

  const { date, month, day } = parsed
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return false

  if (yearLimit !== false) {
    const isOrigin = date.getFullYear() === 1911 && date.getMonth() === 0 && date.getDate() === 1
    if (!isOrigin && date.getFullYear() < 1931) return false
  }

  return true
}

/** @alias isADdate */
export { isADdate as isDate }

/**
 * 驗證民國 13 工作月日期格式
 * @param {string}  srcData
 * @param {boolean} [yearLimit=true]
 * @returns {boolean}
 */
export function isROC13Mdate(srcData, yearLimit = true) {
  const patterns = [
    /^(\d{2,4})(\d{2})(\d{2})$/,
    /^(\d{2,4})\/(\d{2})\/(\d{2})$/,
  ]

  let match = null
  for (const pattern of patterns) {
    match = srcData.match(pattern)
    if (match) break
  }
  if (!match) return false

  let month = parseInt(match[2], 10)
  if (month === 13) month = 12

  const date = new Date(parseInt(match[1], 10) + 1911, month - 1, parseInt(match[3], 10))
  if (date.getMonth() !== month - 1 || date.getDate() !== parseInt(match[3], 10)) return false

  if (yearLimit !== false) {
    const isOrigin = date.getFullYear() === 1911 && date.getMonth() === 0 && date.getDate() === 1
    if (!isOrigin && date.getFullYear() < 1931) return false
  }

  return true
}

/**
 * 驗證年月是否為民國年，且 01 <= 月份 <= 13
 * @param {string} srcData
 * @returns {boolean}
 */
export function isROC13Month(srcData) {
  const match = srcData.match(/^(\d{2,3})(\d{2})$/)
  if (!match) return false

  let month = parseInt(match[2], 10)
  if (month === 13) month = 12

  const date = new Date(parseInt(match[1], 10) + 1911, month - 1, 1)
  return date.getMonth() === month - 1
}

/**
 * 驗證民國年月，且月份 01–13，日必須為 01
 * @param {string}  srcData
 * @param {boolean} [yearLimit=true]
 * @returns {boolean}
 */
export function isROC13MonthFirstDay(srcData, yearLimit = true) {
  const match = srcData.match(/^(\d{2,3})(\d{2})(\d{2})$/)
  if (!match) return false

  if (parseInt(match[3], 10) !== 1) return false

  let month = parseInt(match[2], 10)
  if (month === 13) month = 12

  const date = new Date(parseInt(match[1], 10) + 1911, month - 1, 1)
  if (date.getMonth() !== month - 1) return false

  if (yearLimit !== false) {
    const isOrigin = date.getFullYear() === 1911 && date.getMonth() === 0 && date.getDate() === 1
    if (!isOrigin && date.getFullYear() < 1931) return false
  }

  return true
}

/**
 * 判斷是否為西元閏年
 * @param {string|number} datInput 西元年份或 yyyy-MM-dd 字串
 * @returns {boolean}
 */
export function isLeap(datInput) {
  const year = typeof datInput === 'string'
    ? parseInt(datInput.length > 4 ? datInput.slice(0, 4) : datInput, 10)
    : datInput

  if (year % 4 !== 0) return false
  if (year % 100 !== 0) return true
  return year % 400 === 0
}

// ── 日期互轉 ──────────────────────────────────────────────────────────────────

/**
 * 民國日期字串轉 Date 物件
 * @param {string}  srcData
 * @param {boolean} [isROCBefore=false]
 * @returns {Date | undefined}
 */
export function stringToDate_ROC(srcData, isROCBefore = false) {
  return _parseROCDate(srcData, isROCBefore)?.date
}

/**
 * 西元日期字串轉 Date 物件
 * @param {string} srcData
 * @returns {Date | undefined}
 */
export function stringToDate_Y2K(srcData) {
  return _parseY2KDate(srcData)?.date
}

/**
 * 西元日期轉民國日期（`yyyy-MM-dd` → `yyyMMdd`）
 * @param {string} Y2Kdate
 * @returns {string}
 */
export function toROC(Y2Kdate) {
  if (Y2Kdate.length !== 10) return ''
  const year = parseInt(Y2Kdate.slice(0, 4), 10) - 1911
  return `${year}${Y2Kdate.slice(5, 7)}${Y2Kdate.slice(8, 10)}`
}

/**
 * 民國日期轉西元日期（`yyyMMdd` → `yyyy-MM-dd`）
 * @param {string} ROCdate
 * @returns {string}
 */
export function toY2K(ROCdate) {
  const parsed = _parseROCDate(ROCdate, true)
  if (!parsed) return ROCdate

  const { date, month, day } = parsed
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return ROCdate

  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

/**
 * 任意格式日期轉 DB 格式（`yyyy-MM-dd`）
 * @param {string} inputDate
 * @returns {string}
 */
export function toDBDate(inputDate) {
  if (inputDate.length === 8) {
    return `${inputDate.slice(0, 4)}-${inputDate.slice(4, 6)}-${inputDate.slice(6)}`
  }
  if (inputDate.length === 10 && !inputDate.includes('-')) {
    return `${inputDate.slice(0, 4)}-${inputDate.slice(5, 7)}-${inputDate.slice(8)}`
  }
  return inputDate
}

// ── 日期計算 ──────────────────────────────────────────────────────────────────

/**
 * 計算兩日期相差天數（日期2 - 日期1）
 * @param {string}  str1
 * @param {string}  str2
 * @param {boolean} [isROC] 未指定時依第一個參數格式判斷
 * @returns {number}
 */
export function diffDay(str1, str2, isROC) {
  let d1, d2

  if (isROC === undefined) {
    const parsed = _parseY2KDate(str1)
    isROC = !parsed
    d1 = isROC ? _parseROCDate(str1, true)?.date : parsed?.date
  } else {
    d1 = isROC ? _parseROCDate(str1, true)?.date : _parseY2KDate(str1)?.date
  }

  d2 = isROC ? _parseROCDate(str2, true)?.date : _parseY2KDate(str2)?.date
  return (d2 - d1) / 86400000
}

/**
 * 計算兩民國日期相差天數
 * @param {string} strRoc1
 * @param {string} strRoc2
 * @returns {number}
 */
export const diffDayROC = (strRoc1, strRoc2) => diffDay(strRoc1, strRoc2, true)

/**
 * 計算兩西元日期相差天數
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
export const diffDayY2K = (str1, str2) => diffDay(str1, str2, false)

/**
 * 日期加減（格式 `yyyy-MM-dd`）
 * @param {string} strDate
 * @param {number} intYY 加減年數
 * @param {number} intMM 加減月數
 * @param {number} intDD 加減天數
 * @returns {string}
 */
export function addDate(strDate, intYY, intMM, intDD) {
  if (!strDate || strDate.length !== 10) return ''

  const year  = parseInt(strDate.slice(0, 4), 10)
  const month = parseInt(strDate.slice(5, 7), 10) - 1
  const day   = parseInt(strDate.slice(8, 10), 10)
  const d = new Date(year, month, day)

  if (intYY !== 0) {
    d.setFullYear(d.getFullYear() + intYY)
    if (d.getDate() !== day) {
      d.setMonth(month)
      d.setDate(day - 1)
    }
  }

  if (intMM !== 0) {
    const tempDay = d.getDate()
    d.setDate(1)
    d.setMonth(d.getMonth() + intMM)
    const tempMonth = d.getMonth()
    d.setDate(tempDay)
    if (tempMonth !== d.getMonth()) d.setDate(0)
  }

  if (intDD !== 0) d.setDate(d.getDate() + intDD)

  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// ── 取得當日日期 / 時間 ───────────────────────────────────────────────────────

/**
 * 取得當日西元日期（`yyyy-MM-dd`）
 * @returns {string}
 */
export function getY2KToday() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/**
 * 取得當日民國日期（`yyyMMdd`）
 * @returns {string}
 */
export function getToday() {
  const d = new Date()
  const yy = d.getFullYear() - 1911
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}${mm}${dd}`
}

/**
 * 取得當前時間（`HHmmss`）
 * @returns {string}
 */
export function getTime() {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(v => String(v).padStart(2, '0'))
    .join('')
}

/**
 * 取得含毫秒的 timestamp（`yyyy-MM-dd HH:mm:ss.SSS`）
 * @returns {string}
 */
export function getCurrentTimeStamp() {
  const d = new Date()
  const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
  const ms   = String(d.getMilliseconds()).padStart(3, '0')
  return `${date} ${time}.${ms}`
}

/**
 * 驗證是否為年月格式
 * @param {string}  srcDate
 * @param {boolean} [isROC=false]
 * @returns {boolean}
 */
export function isDateYM(srcDate, isROC = false) {
  const pattern = isROC
    ? /^(\d{2,3})(0[1-9]|1[0-2])$/
    : /^(\d{4})(0[1-9]|1[0-2])$/
  return pattern.test(srcDate)
}

// ── 日期格式化 ────────────────────────────────────────────────────────────────

SimpleDateFormat.TW = 'tw'
SimpleDateFormat.US = 'en'

/**
 * 日期格式化（對應原始 SimpleDateFormat，保留原始邏輯）
 * @param {string} pattern 格式字串（yyyy, yyy, MM, dd, EEEE, HH, mm, ss 等）
 * @param {string} locale  SimpleDateFormat.TW | SimpleDateFormat.US
 */
export function SimpleDateFormat(pattern = 'yyyy-MM-dd', locale) {
  const isROC = locale !== SimpleDateFormat.US

  const MONTHS_TW = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
  const MONTHS_US = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const WEEKS_TW  = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
  const WEEKS_US  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  const months = isROC ? MONTHS_TW : MONTHS_US
  const weeks  = isROC ? WEEKS_TW  : WEEKS_US

  const TOKENS = [
    { key: 'yyyy', method: 'getFullYear' },
    { key: 'yyy',  method: 'getFullYear', sub: 3, roc: isROC },
    { key: 'yy',   method: 'getFullYear', sub: 2, roc: isROC },
    { key: 'MMMM', method: 'getMonth',    pad: 1, full: true },
    { key: 'MMM',  method: 'getMonth',    pad: 1 },
    { key: 'MM',   method: 'getMonth',    pad: 1 },
    { key: 'M',    method: 'getMonth',    pad: 0 },
    { key: 'dd',   method: 'getDate',     pad: 1 },
    { key: 'd',    method: 'getDate',     pad: 0 },
    { key: 'EEEE', method: 'getDay',      full: true },
    { key: 'EEE',  method: 'getDay' },
    { key: 'EE',   method: 'getDay' },
    { key: 'E',    method: 'getDay' },
    { key: 'HH',   method: 'getHours',    pad: 1 },
    { key: 'H',    method: 'getHours',    pad: 0 },
    { key: 'hh',   method: 'getHours',    pad: 1, h12: true },
    { key: 'h',    method: 'getHours',    pad: 0, h12: true },
    { key: 'mm',   method: 'getMinutes',  pad: 1 },
    { key: 'm',    method: 'getMinutes',  pad: 0 },
    { key: 'ss',   method: 'getSeconds',  pad: 1 },
    { key: 's',    method: 'getSeconds',  pad: 0 },
  ]

  const groups = { year:['yyyy','yyy','yy'], month:['MMMM','MMM','MM','M'], day:['dd','d'], week:['EEEE','EEE','EE','E'], hour:['HH','H','hh','h'], minute:['mm','m'], second:['ss','s'] }
  const groupOf = Object.fromEntries(Object.entries(groups).flatMap(([g, ks]) => ks.map(k => [k, g])))

  const used = new Set()
  const active = TOKENS
    .filter(t => {
      const g = groupOf[t.key]
      if (!g || used.has(g)) return false
      const idx = pattern.indexOf(t.key)
      if (idx < 0) return false
      used.add(g)
      return true
    })
    .map(t => ({ ...t, index: pattern.indexOf(t.key) }))
    .sort((a, b) => a.index - b.index)

  this.format = (inDate) => {
    if (typeof inDate !== 'string' || inDate === '') return ''

    let d
    const dtMatch = inDate.match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}):(\d{2}))?/)
    if (!dtMatch) return inDate
    d = dtMatch[4]
      ? new Date(+dtMatch[1], +dtMatch[2]-1, +dtMatch[3], +dtMatch[4], +dtMatch[5], +dtMatch[6])
      : new Date(+dtMatch[1], +dtMatch[2]-1, +dtMatch[3])

    let out = ''
    for (let i = 0; i < active.length; i++) {
      const tok = active[i]
      const prev = active[i - 1]
      const from = prev ? prev.index + prev.key.length : 0
      out += pattern.slice(from, tok.index)

      let val = d[tok.method]()

      if (tok.key === 'MMMM' || tok.key === 'MMM') {
        let label = months[val]
        if (tok.key === 'MMM') label = isROC ? label.slice(0, -1) : label.slice(0, 3)
        out += label
        continue
      }
      if (['EEEE','EEE','EE','E'].includes(tok.key)) {
        let label = weeks[val]
        if (!tok.full) label = isROC ? label.slice(-1) : label.slice(0, 3)
        out += label
        continue
      }
      if (['MM','M'].includes(tok.key)) val += 1
      if (tok.h12 && val > 12) val -= 12
      if (tok.roc) val -= 1911
      let str = String(val)
      if (tok.sub) str = str.slice(-tok.sub)
      if (tok.pad && val < 10) str = '0' + str
      out += str
    }

    const last = active[active.length - 1]
    if (last) out += pattern.slice(last.index + last.key.length)
    return out
  }
}

// ── TODO 項目 ─────────────────────────────────────────────────────────────────

/**
 * 判斷是否為假日
 * @todo 假日清單硬編碼 92–94 年（民國），資料已過期，需更新或改接外部資料來源
 * @param {string} day 民國日期（`yyyMMdd`）
 * @returns {boolean}
 */
export function isHoliday(day) {
  const HOLIDAYS = new Set([
    '921129','921130','921206','921207','921213','921214','921220','921221','921227','921228',
    '930101','930103','930104','930110','930111','930117','930118','930121','930122','930123',
    '930124','930125','930126','930131','930201','930207','930208','930214','930215','930221',
    '930222','930228','930229','930306','930307','930313','930314','930320','930321','930327',
    '930328','930403','930404','930410','930411','930417','930418','930424','930425','930501',
    '930502','930508','930509','930515','930516','930522','930523','930529','930530','930605',
    '930606','930612','930613','930619','930620','930622','930626','930627','930703','930704',
    '930710','930711','930717','930718','930724','930725','930731','930801','930807','930808',
    '930814','930815','930821','930822','930828','930829','930904','930905','930911','930912',
    '930918','930919','930925','930926','930928','931002','931003','931009','931010','931016',
    '931017','931023','931024','931030','931031','931106','931107','931113','931114','931120',
    '931121','931127','931128','931204','931205','931211','931212','931218','931219','931225',
    '931226','940101','940102','940108','940109','940115','940116','940122','940123','940129',
    '940130','940206','940207','940208','940209','940210','940211','940212','940213','940219',
    '940220','940226','940227','940228','940305','940306','940312','940313','940319','940320',
    '940326','940327','940402','940403','940405','940409','940410','940416','940417','940423',
    '940424','940430','940501','940502','940507','940508','940514','940515','940521','940522',
    '940528','940529','940604','940605','940611','940612','940618','940619','940625','940626',
    '940702','940703','940709','940710','940716','940717','940723','940724','940730','940731',
    '940806','940807','940813','940814','940820','940821','940827','940828','940903','940904',
    '940910','940911','940917','940918','940924','940925','941001','941002','941008','941009',
    '941010','941015','941016','941022','941023','941029','941030','941105','941106','941112',
    '941113','941119','941120','941126','941127',
  ])
  return HOLIDAYS.has(day)
}

/**
 * 推算應繳日
 * @todo 業務邏輯待確認，是否仍適用於新專案
 * @param {string} strDate  基準日期（`yyyy-MM-dd`）
 * @param {string} dudt     指定日（`dd`）
 * @param {number} intMonth 加減月數
 * @returns {string}
 */
export function getDutyDay(strDate, dudt, intMonth) {
  const base    = `${strDate.slice(0, 8)}01`
  const shifted = addDate(base, 0, intMonth, 0)
  const mm      = parseInt(shifted.slice(5, 7), 10)
  const dd      = parseInt(dudt, 10)
  const prefix  = `${shifted.slice(0, 8)}`

  if (dd <= 28) return `${prefix}${dudt}`
  if (mm === 2) {
    if (isLeap(shifted)) return `${prefix}${dd > 29 ? '29' : dudt}`
    return `${prefix}${dd > 28 ? '28' : dudt}`
  }
  if ([4, 6, 9, 11].includes(mm) && dd > 30) return `${prefix}30`
  if ([1, 3, 5, 7, 8, 10, 12].includes(mm) && dd > 31) return `${prefix}31`
  return `${prefix}${dudt}`
}