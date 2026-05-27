const ROC_YEAR_OFFSET = 1911
const MIN_VALID_AD_YEAR = 1931

const HOLIDAY_CODES = new Set([
  '921129', '921130', '921206', '921207', '921213', '921214', '921220', '921221', '921227', '921228',
  '930101', '930103', '930104', '930110', '930111', '930117', '930118', '930121', '930122', '930123',
  '930124', '930125', '930126', '930131', '930201', '930207', '930208', '930214', '930215', '930221',
  '930222', '930228', '930229', '930306', '930307', '930313', '930314', '930320', '930321', '930327',
  '930328', '930403', '930404', '930410', '930411', '930417', '930418', '930424', '930425', '930501',
  '930502', '930508', '930509', '930515', '930516', '930522', '930523', '930529', '930530', '930605',
  '930606', '930612', '930613', '930619', '930620', '930622', '930626', '930627', '930703', '930704',
  '930710', '930711', '930717', '930718', '930724', '930725', '930731', '930801', '930807', '930808',
  '930814', '930815', '930821', '930822', '930828', '930829', '930904', '930905', '930911', '930912',
  '930918', '930919', '930925', '930926', '930928', '931002', '931003', '931009', '931010', '931016',
  '931017', '931023', '931024', '931030', '931031', '931106', '931107', '931113', '931114', '931120',
  '931121', '931127', '931128', '931204', '931205', '931211', '931212', '931218', '931219', '931225',
  '931226', '940101', '940102', '940108', '940109', '940115', '940116', '940122', '940123', '940129',
  '940130', '940206', '940207', '940208', '940209', '940210', '940211', '940212', '940213', '940219',
  '940220', '940226', '940227', '940228', '940305', '940306', '940312', '940313', '940319', '940320',
  '940326', '940327', '940402', '940403', '940405', '940409', '940410', '940416', '940417', '940423',
  '940424', '940430', '940501', '940502', '940507', '940508', '940514', '940515', '940521', '940522',
  '940528', '940529', '940604', '940605', '940611', '940612', '940618', '940619', '940625', '940626',
  '940702', '940703', '940709', '940710', '940716', '940717', '940723', '940724', '940730', '940731',
  '940806', '940807', '940813', '940814', '940820', '940821', '940827', '940828', '940903', '940904',
  '940910', '940911', '940917', '940918', '940924', '940925', '941001', '941002', '941008', '941009',
  '941010', '941015', '941016', '941022', '941023', '941029', '941030', '941105', '941106', '941112',
  '941113', '941119', '941120', '941126', '941127'
])

let runtimeHolidayCodes = new Set(HOLIDAY_CODES)
let holidayCodeSource = 'legacy-static'
let holidayCodeUpdatedAt = Date.now()

/**
 * normalizeHolidayCode 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function normalizeHolidayCode(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const text = String(value).trim()
  if (text === '') {
    return ''
  }

  const digitOnly = text.replace(/[^0-9]/g, '')
  return digitOnly === '' ? text : digitOnly
}

/**
 * setHolidayCodes 功能說明。
 * @param {any} codes 參數 codes。
 * @param {any} options 參數 options。
 * @returns {any} 執行結果。
 */
export function setHolidayCodes(codes = [], options = {}) {
  const replace = options?.replace !== false
  const source =
    typeof options?.source === 'string' && options.source !== ''
      ? options.source
      : 'runtime'

  const nextCodes = replace === true
    ? new Set()
    : new Set(runtimeHolidayCodes)

  if (Array.isArray(codes)) {
    codes.forEach(item => {
      const code = normalizeHolidayCode(item)
      if (code !== '') {
        nextCodes.add(code)
      }
    })
  }

  runtimeHolidayCodes = nextCodes
  holidayCodeSource = source
  holidayCodeUpdatedAt = Date.now()

  return {
    source: holidayCodeSource,
    size: runtimeHolidayCodes.size,
    updatedAt: holidayCodeUpdatedAt
  }
}

/**
 * resetHolidayCodes 功能說明。
 * @returns {any} 執行結果。
 */
export function resetHolidayCodes() {
  runtimeHolidayCodes = new Set(HOLIDAY_CODES)
  holidayCodeSource = 'legacy-static'
  holidayCodeUpdatedAt = Date.now()

  return {
    source: holidayCodeSource,
    size: runtimeHolidayCodes.size,
    updatedAt: holidayCodeUpdatedAt
  }
}

/**
 * getHolidayCodes 功能說明。
 * @returns {any} 執行結果。
 */
export function getHolidayCodes() {
  return Array.from(runtimeHolidayCodes)
}

/**
 * getHolidayCodeState 功能說明。
 * @returns {any} 執行結果。
 */
export function getHolidayCodeState() {
  return {
    source: holidayCodeSource,
    size: runtimeHolidayCodes.size,
    updatedAt: holidayCodeUpdatedAt
  }
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
 * pad3 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function pad3(value) {
  return String(value).padStart(3, '0')
}

/**
 * isValidDateObject 功能說明。
 * @param {any} date 參數 date。
 * @returns {boolean} 執行結果。
 */
function isValidDateObject(date) {
  return date instanceof Date && Number.isNaN(date.getTime()) === false
}

/**
 * parseWithPatterns 功能說明。
 * @param {any} value 參數 value。
 * @param {any} patterns 參數 patterns。
 * @returns {any} 執行結果。
 */
function parseWithPatterns(value, patterns) {
  if (typeof value !== 'string') {
    return null
  }

  for (const pattern of patterns) {
    const matched = value.match(pattern)
    if (matched) {
      return {
        year: parseInt(matched[1], 10),
        month: parseInt(matched[2], 10),
        day: parseInt(matched[3], 10)
      }
    }
  }

  return null
}

/**
 * parseRocDateParts 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {any} 執行結果。
 */
function parseRocDateParts(srcData) {
  return parseWithPatterns(srcData, [
    /^(\d{1})(\d{2})(\d{2})$/,
    /^(\d{2})(\d{2})(\d{2})$/,
    /^(\d{3})(\d{2})(\d{2})$/,
    /^(\d{1})\/(\d{2})\/(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{2})$/,
    /^(\d{3})\/(\d{2})\/(\d{2})$/,
    /^(\d{1})\-(\d{2})\-(\d{2})$/,
    /^(\d{2})\-(\d{2})\-(\d{2})$/,
    /^(\d{3})\-(\d{2})\-(\d{2})$/
  ])
}

/**
 * parseADDateParts 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {any} 執行結果。
 */
function parseADDateParts(srcData) {
  return parseWithPatterns(srcData, [
    /^(\d{4})(\d{2})(\d{2})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/,
    /^(\d{4})\-(\d{2})\-(\d{2})$/
  ])
}

/**
 * parseROC13MDateParts 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {any} 執行結果。
 */
function parseROC13MDateParts(srcData) {
  return parseWithPatterns(srcData, [
    /^(\d{2})(\d{2})(\d{2})$/,
    /^(\d{3})(\d{2})(\d{2})$/,
    /^(\d{4})(\d{2})(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{2})$/,
    /^(\d{3})\/(\d{2})\/(\d{2})$/,
    /^(\d{4})\/(\d{2})\/(\d{2})$/
  ])
}

/**
 * parseROC13MonthParts 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {any} 執行結果。
 */
function parseROC13MonthParts(srcData) {
  if (typeof srcData !== 'string') {
    return null
  }

  const matched = srcData.match(/^(\d{2}|\d{3})(\d{2})$/)
  if (!matched) {
    return null
  }

  return {
    year: parseInt(matched[1], 10),
    month: parseInt(matched[2], 10)
  }
}

/**
 * parseROC13MonthFirstDayParts 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {any} 執行結果。
 */
function parseROC13MonthFirstDayParts(srcData) {
  if (typeof srcData !== 'string') {
    return null
  }

  const matched = srcData.match(/^(\d{2}|\d{3})(\d{2})(\d{2})$/)
  if (!matched) {
    return null
  }

  return {
    year: parseInt(matched[1], 10),
    month: parseInt(matched[2], 10),
    day: parseInt(matched[3], 10)
  }
}

/**
 * shouldBlockByYearLimit 功能說明。
 * @param {any} date 參數 date。
 * @param {any} yearLimit 參數 yearLimit。
 * @returns {boolean} 執行結果。
 */
function shouldBlockByYearLimit(date, yearLimit) {
  if (yearLimit === false) {
    return false
  }

  const is19110101 =
    date.getFullYear() === 1911 &&
    date.getMonth() === 0 &&
    date.getDate() === 1

  return is19110101 === false && date.getFullYear() < MIN_VALID_AD_YEAR
}

/**
 * stringToDate_ROC 功能說明。
 * @param {any} srcData 參數 srcData。
 * @param {any} isROCBefore 參數 isROCBefore。
 * @returns {any} 執行結果。
 */
export function stringToDate_ROC(srcData, isROCBefore = false) {
  if (typeof srcData !== 'string') {
    return undefined
  }

  let rocDateIsBefore = 1
  let normalized = srcData

  if (isROCBefore === true && normalized.startsWith('-')) {
    normalized = normalized.substring(1)
    rocDateIsBefore = -1
  }

  const parsed = parseRocDateParts(normalized)
  if (!parsed) {
    return undefined
  }

  return new Date(
    rocDateIsBefore * parsed.year + ROC_YEAR_OFFSET,
    parsed.month - 1,
    parsed.day
  )
}

/**
 * stringToDate_Y2K 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {any} 執行結果。
 */
export function stringToDate_Y2K(srcData) {
  const parsed = parseADDateParts(srcData)
  if (!parsed) {
    return undefined
  }

  return new Date(parsed.year, parsed.month - 1, parsed.day)
}

/**
 * isROCdate 功能說明。
 * @param {any} srcData 參數 srcData。
 * @param {any} yearLimit 參數 yearLimit。
 * @param {any} isROCBefore 參數 isROCBefore。
 * @returns {boolean} 執行結果。
 */
export function isROCdate(srcData, yearLimit, isROCBefore) {
  const normalized =
    isROCBefore === true && typeof srcData === 'string' && srcData.startsWith('-')
      ? srcData.substring(1)
      : srcData

  const parsed = parseRocDateParts(normalized)
  const date = stringToDate_ROC(srcData, isROCBefore)

  if (
    !parsed ||
    isValidDateObject(date) === false ||
    date.getMonth() !== parsed.month - 1 ||
    date.getDate() !== parsed.day
  ) {
    return false
  }

  return shouldBlockByYearLimit(date, yearLimit) === false
}

/**
 * isADdate 功能說明。
 * @param {any} srcData 參數 srcData。
 * @param {any} yearLimit 參數 yearLimit。
 * @returns {boolean} 執行結果。
 */
export function isADdate(srcData, yearLimit) {
  const parsed = parseADDateParts(srcData)
  const date = stringToDate_Y2K(srcData)

  if (
    !parsed ||
    isValidDateObject(date) === false ||
    date.getMonth() !== parsed.month - 1 ||
    date.getDate() !== parsed.day
  ) {
    return false
  }

  return shouldBlockByYearLimit(date, yearLimit) === false
}

/**
 * isDate 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {boolean} 執行結果。
 */
export function isDate(srcData) {
  return isADdate(srcData)
}

/**
 * diffDay 功能說明。
 * @param {any} str1 參數 str1。
 * @param {any} str2 參數 str2。
 * @param {any} isROC 參數 isROC。
 * @returns {any} 執行結果。
 */
export function diffDay(str1, str2, isROC) {
  let dateInt1
  let dateInt2

  if (typeof isROC === 'undefined') {
    dateInt1 = stringToDate_Y2K(str1)
    isROC = isValidDateObject(dateInt1) === false
  } else if (isROC === false) {
    dateInt1 = stringToDate_Y2K(str1)
  }

  if (isROC) {
    dateInt1 = stringToDate_ROC(str1, true)
    dateInt2 = stringToDate_ROC(str2, true)
  } else {
    dateInt2 = stringToDate_Y2K(str2)
  }

  return (dateInt2 - dateInt1) / 86400000
}

/**
 * diffDayROC 功能說明。
 * @param {any} strRoc1 參數 strRoc1。
 * @param {any} strRoc2 參數 strRoc2。
 * @returns {any} 執行結果。
 */
export function diffDayROC(strRoc1, strRoc2) {
  return diffDay(strRoc1, strRoc2, true)
}

/**
 * diffDayY2K 功能說明。
 * @param {any} str1 參數 str1。
 * @param {any} str2 參數 str2。
 * @returns {any} 執行結果。
 */
export function diffDayY2K(str1, str2) {
  return diffDay(str1, str2, false)
}

/**
 * toROC 功能說明。
 * @param {any} Y2Kdate 參數 Y2Kdate。
 * @returns {any} 執行結果。
 */
export function toROC(Y2Kdate) {
  if (typeof Y2Kdate !== 'string' || Y2Kdate.length !== 10) {
    return ''
  }

  const matched = Y2Kdate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!matched) {
    return ''
  }

  const rocYear = parseInt(matched[1], 10) - ROC_YEAR_OFFSET
  return `${rocYear}${matched[2]}${matched[3]}`
}

/**
 * toY2K 功能說明。
 * @param {any} ROCdate 參數 ROCdate。
 * @returns {any} 執行結果。
 */
export function toY2K(ROCdate) {
  const date = stringToDate_ROC(ROCdate, true)

  if (isValidDateObject(date) === false) {
    return ROCdate
  }

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/**
 * toDBDate 功能說明。
 * @param {any} inputDate 參數 inputDate。
 * @returns {any} 執行結果。
 */
export function toDBDate(inputDate) {
  if (typeof inputDate !== 'string') {
    return inputDate
  }

  if (inputDate.length === 8) {
    return `${inputDate.substring(0, 4)}-${inputDate.substring(4, 6)}-${inputDate.substring(6)}`
  }

  if (inputDate.length === 10 && inputDate.indexOf('-') < 0) {
    return `${inputDate.substring(0, 4)}-${inputDate.substring(5, 7)}-${inputDate.substring(8)}`
  }

  return inputDate
}

/**
 * getDutyDay 功能說明。
 * @param {any} strDate 參數 strDate。
 * @param {any} dudt 參數 dudt。
 * @param {any} intMonth 參數 intMonth。
 * @returns {any} 執行結果。
 */
export function getDutyDay(strDate, dudt, intMonth) {
  // 先把日期調到當月 1 號再位移月份，避免 31 號跨月時直接溢位。
  const baseDate = `${strDate.substr(0, 8)}01`
  const adjustedDate = addDate(baseDate, 0, intMonth, 0)

  const year = adjustedDate.substr(0, 4)
  const monthText = adjustedDate.substr(5, 2)
  const month = parseInt(monthText, 10)
  const day = parseInt(dudt, 10)
  const dayText = pad2(day)
  const prefix = `${year}-${monthText}-`

  if (day <= 28) {
    return `${prefix}${dayText}`
  }

  if (month === 2) {
    if (isLeap(adjustedDate)) {
      return `${prefix}${day > 29 ? '29' : dayText}`
    }
    return `${prefix}${day > 28 ? '28' : dayText}`
  }

  if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
    return `${prefix}30`
  }

  if (
    (month === 1 || month === 3 || month === 5 || month === 7 || month === 8 || month === 10 || month === 12) &&
    day > 31
  ) {
    return `${prefix}31`
  }

  return `${prefix}${dayText}`
}

/**
 * isLeap 功能說明。
 * @param {any} datInput 參數 datInput。
 * @returns {boolean} 執行結果。
 */
export function isLeap(datInput) {
  let year

  if (typeof datInput === 'string') {
    year = datInput.length > 4 ? parseInt(datInput.substring(0, 4), 10) : parseInt(datInput, 10)
  } else {
    year = Number(datInput)
  }

  if (Number.isNaN(year)) {
    return false
  }

  if (year % 4 !== 0) {
    return false
  }

  if (year % 100 !== 0) {
    return true
  }

  return year % 400 === 0
}

/**
 * addDate 功能說明。
 * @param {any} strDate 參數 strDate。
 * @param {any} intYY 參數 intYY。
 * @param {any} intMM 參數 intMM。
 * @param {any} intDD 參數 intDD。
 * @returns {any} 執行結果。
 */
export function addDate(strDate, intYY, intMM, intDD) {
  if (typeof strDate !== 'string' || strDate.length !== 10) {
    return ''
  }

  const formatYear = parseInt(strDate.substr(0, 4), 10)
  const formatMonth = parseInt(strDate.substr(5, 2), 10) - 1
  const formatDate = parseInt(strDate.substr(8, 2), 10)

  if (
    Number.isNaN(formatYear) ||
    Number.isNaN(formatMonth) ||
    Number.isNaN(formatDate)
  ) {
    return ''
  }

  const calculateDate = new Date(formatYear, formatMonth, formatDate)

  if (intYY !== 0) {
    calculateDate.setFullYear(calculateDate.getFullYear() + intYY)

    // 2/29 加年時若目標年不是閏年，JS 會溢位到 3 月，這裡退回月底。
    if (calculateDate.getDate() !== formatDate) {
      calculateDate.setMonth(formatMonth)
      calculateDate.setDate(formatDate - 1)
    }
  }

  if (intMM !== 0) {
    const tempDate = calculateDate.getDate()
    calculateDate.setDate(1)
    calculateDate.setMonth(calculateDate.getMonth() + intMM)

    const tempMonth = calculateDate.getMonth()
    calculateDate.setDate(tempDate)

    // 像 1/31 + 1 月會落到 3/3，若月份跳過頭則回該月最後一天。
    if (tempMonth !== calculateDate.getMonth()) {
      calculateDate.setDate(0)
    }
  }

  if (intDD !== 0) {
    calculateDate.setDate(calculateDate.getDate() + intDD)
  }

  const outMonth = `-${pad2(calculateDate.getMonth() + 1)}`
  const outDate = `-${pad2(calculateDate.getDate())}`
  return `${calculateDate.getFullYear()}${outMonth}${outDate}`
}

/**
 * getY2KToday 功能說明。
 * @returns {any} 執行結果。
 */
export function getY2KToday() {
  const dateObject = new Date()
  return `${dateObject.getFullYear()}-${pad2(dateObject.getMonth() + 1)}-${pad2(dateObject.getDate())}`
}

/**
 * getToday 功能說明。
 * @returns {any} 執行結果。
 */
export function getToday() {
  const dateObject = new Date()
  const rocYear = dateObject.getFullYear() - ROC_YEAR_OFFSET
  return `${rocYear}${pad2(dateObject.getMonth() + 1)}${pad2(dateObject.getDate())}`
}

/**
 * getTime 功能說明。
 * @returns {any} 執行結果。
 */
export function getTime() {
  const dt = new Date()
  return `${pad2(dt.getHours())}${pad2(dt.getMinutes())}${pad2(dt.getSeconds())}`
}

/**
 * isHoliday 功能說明。
 * @param {any} day 參數 day。
 * @returns {boolean} 執行結果。
 */
export function isHoliday(day) {
  return runtimeHolidayCodes.has(normalizeHolidayCode(day))
}

/**
 * isROC13Mdate 功能說明。
 * @param {any} srcData 參數 srcData。
 * @param {any} yearLimit 參數 yearLimit。
 * @returns {boolean} 執行結果。
 */
export function isROC13Mdate(srcData, yearLimit) {
  const parsed = parseROC13MDateParts(srcData)
  if (!parsed) {
    return false
  }

  let month = parsed.month
  if (month === 13) {
    month = 12
  }

  const date = new Date(parsed.year + ROC_YEAR_OFFSET, month - 1, parsed.day)

  if (
    isValidDateObject(date) === false ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== parsed.day
  ) {
    return false
  }

  return shouldBlockByYearLimit(date, yearLimit) === false
}

/**
 * isROC13Month 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {boolean} 執行結果。
 */
export function isROC13Month(srcData) {
  const parsed = parseROC13MonthParts(srcData)
  if (!parsed) {
    return false
  }

  let month = parsed.month
  if (month === 13) {
    month = 12
  }

  const date = new Date(parsed.year + ROC_YEAR_OFFSET, month - 1, 1)
  return isValidDateObject(date) && date.getMonth() === month - 1
}

/**
 * isROC13MonthFirstDay 功能說明。
 * @param {any} srcData 參數 srcData。
 * @param {any} yearLimit 參數 yearLimit。
 * @returns {boolean} 執行結果。
 */
export function isROC13MonthFirstDay(srcData, yearLimit) {
  const parsed = parseROC13MonthFirstDayParts(srcData)
  if (!parsed || parsed.day !== 1) {
    return false
  }

  let month = parsed.month
  if (month === 13) {
    month = 12
  }

  const date = new Date(parsed.year + ROC_YEAR_OFFSET, month - 1, 1)

  if (isValidDateObject(date) === false || date.getMonth() !== month - 1) {
    return false
  }

  return shouldBlockByYearLimit(date, yearLimit) === false
}

/**
 * parseSimpleDateInput 功能說明。
 * @param {any} srcData 參數 srcData。
 * @returns {any} 執行結果。
 */
function parseSimpleDateInput(srcData) {
  if (typeof srcData !== 'string') {
    return undefined
  }

  const onlyDate = parseADDateParts(srcData)
  if (onlyDate) {
    return new Date(onlyDate.year, onlyDate.month - 1, onlyDate.day)
  }

  const dateTimeMatched = srcData.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?$/
  )

  if (!dateTimeMatched) {
    return undefined
  }

  return new Date(
    parseInt(dateTimeMatched[1], 10),
    parseInt(dateTimeMatched[2], 10) - 1,
    parseInt(dateTimeMatched[3], 10),
    parseInt(dateTimeMatched[4], 10),
    parseInt(dateTimeMatched[5], 10),
    parseInt(dateTimeMatched[6], 10)
  )
}

export class SimpleDateFormat {
  static TW = 'tw'

  static US = 'en'

  /**
   * 建立日期格式化器。
   * @param {string} pattern 日期樣板。
   * @param {string} locale 語系代碼。
   * @returns {void} 執行結果。
   */
  constructor(pattern, locale) {
    this.pattern = pattern || 'yyyy-MM-dd'
    this.locale = locale || SimpleDateFormat.TW

    this.months =
      this.locale === SimpleDateFormat.US
        ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        : ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

    this.weeks =
      this.locale === SimpleDateFormat.US
        ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  }

  /**
   * 將輸入日期字串依樣板格式化。
   * @param {string} inDate 原始日期字串。
   * @returns {string} 格式化後日期文字。
   */
  format(inDate) {
    if (typeof inDate !== 'string' || inDate === '') {
      return ''
    }

    const date = parseSimpleDateInput(inDate)
    if (isValidDateObject(date) === false) {
      return inDate
    }

    const isROC = this.locale !== SimpleDateFormat.US

    return this.pattern.replace(
      /yyyy|yyy|yy|y|MMMM|MMM|MM|M|dd|d|EEEE|EEE|EE|E|HH|H|hh|h|mm|m|ss|s/g,
      token => {
        switch (token) {
          case 'yyyy': {
            return String(date.getFullYear())
          }
          case 'yyy':
          case 'yy':
          case 'y': {
            let year = date.getFullYear()
            if (isROC) {
              year -= ROC_YEAR_OFFSET
            }

            let yearText = String(year)
            if (token === 'yyy' && yearText.length > 3) {
              yearText = yearText.slice(-3)
            }
            if ((token === 'yy' || token === 'y') && yearText.length > 2) {
              yearText = yearText.slice(-2)
            }
            return yearText
          }
          case 'MMMM': {
            return this.months[date.getMonth()]
          }
          case 'MMM': {
            const monthLabel = this.months[date.getMonth()]
            return this.locale === SimpleDateFormat.US ? monthLabel.slice(0, 3) : monthLabel.replace('月', '')
          }
          case 'MM': {
            return pad2(date.getMonth() + 1)
          }
          case 'M': {
            return String(date.getMonth() + 1)
          }
          case 'dd': {
            return pad2(date.getDate())
          }
          case 'd': {
            return String(date.getDate())
          }
          case 'EEEE': {
            return this.weeks[date.getDay()]
          }
          case 'EEE':
          case 'EE':
          case 'E': {
            const weekLabel = this.weeks[date.getDay()]
            return this.locale === SimpleDateFormat.US ? weekLabel.slice(0, 3) : weekLabel.slice(-1)
          }
          case 'HH': {
            return pad2(date.getHours())
          }
          case 'H': {
            return String(date.getHours())
          }
          case 'hh':
          case 'h': {
            let hours = date.getHours()
            if (hours > 12) {
              hours -= 12
            }
            return token === 'hh' ? pad2(hours) : String(hours)
          }
          case 'mm': {
            return pad2(date.getMinutes())
          }
          case 'm': {
            return String(date.getMinutes())
          }
          case 'ss': {
            return pad2(date.getSeconds())
          }
          case 's': {
            return String(date.getSeconds())
          }
          default:
            return token
        }
      }
    )
  }
}

/**
 * formatCurrentTimeStamp 功能說明。
 * @returns {any} 執行結果。
 */
function formatCurrentTimeStamp() {
  const currentDate = new Date()
  return (
    `${currentDate.getFullYear()}-${pad2(currentDate.getMonth() + 1)}-${pad2(currentDate.getDate())}` +
    ` ${pad2(currentDate.getHours())}:${pad2(currentDate.getMinutes())}:${pad2(currentDate.getSeconds())}.${pad3(currentDate.getMilliseconds())}`
  )
}

/**
 * createDateJs 功能說明。
 * @returns {any} 執行結果。
 */
export function createDateJs() {
  return {
    getCurrentTimeStamp() {
      // 延續舊版規則：午夜整點時間改抓下一個時間點，避免批次鍵值重複。
      let currentTimeStamp = formatCurrentTimeStamp()
      if (currentTimeStamp.includes('00:00:00.000')) {
        const nextTick = new Date(Date.now() + 1)
        currentTimeStamp =
          `${nextTick.getFullYear()}-${pad2(nextTick.getMonth() + 1)}-${pad2(nextTick.getDate())}` +
          ` ${pad2(nextTick.getHours())}:${pad2(nextTick.getMinutes())}:${pad2(nextTick.getSeconds())}.${pad3(nextTick.getMilliseconds())}`
      }
      return currentTimeStamp
    },

    isDateYM(srcDate, isROC) {
      const pattern = isROC
        ? /^(\d{2,3})(0[1-9]|1[0-2])$/
        : /^(\d{4})(0[1-9]|1[0-2])$/
      return pattern.test(srcDate)
    }
  }
}

export const dateJs = createDateJs()

// TODO(legacy-ui): 舊版 dateFormatField/dateFieldChange 依賴 DOM/alert，不納入純邏輯 utility。
// 如需 UI 驗證，請改用 Quasar QInput rules + onBlur/onUpdate:model-value。

const dateUtils = {
  isROCdate,
  diffDay,
  diffDayROC,
  diffDayY2K,
  toROC,
  toY2K,
  toDBDate,
  getDutyDay,
  isLeap,
  addDate,
  getY2KToday,
  getToday,
  getTime,
  setHolidayCodes,
  resetHolidayCodes,
  getHolidayCodes,
  getHolidayCodeState,
  isHoliday,
  isROC13Mdate,
  isROC13Month,
  isROC13MonthFirstDay,
  isADdate,
  isDate,
  stringToDate_ROC,
  stringToDate_Y2K,
  SimpleDateFormat,
  createDateJs,
  dateJs
}

export default dateUtils
