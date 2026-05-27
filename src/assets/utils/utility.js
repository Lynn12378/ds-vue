/**
 * utility.js 工具函式遷移
 * 來源：CM/js/utility.js
 */

/**
 * 將字串左側補填指定字元至目標長度
 * 範例：`addPrefix('5', 5, '0')` → `'00005'`
 * @param {string|number} str - 原始字串或數值
 * @param {number} len - 目標長度
 * @param {string} prestr - 補填字元
 * @returns {string} 補填後的字串
 */
export function addPrefix(str, len, prestr) {
  len = parseInt(len, 10)
  str = str + ''
  while (str.length < len) {
    str = prestr + '' + str
  }
  return str + ''
}

/**
 * 將數字轉換為千分位格式字串
 * 範例：`MoneyFormat(123456789)` → `'123,456,789'`
 * 範例：`MoneyFormat(1234.56)` → `'1,234.56'`
 * 範例：`MoneyFormat(-9876)` → `'-9,876'`
 * @param {string|number} inputString - 數值或數值字串
 * @returns {string} 千分位格式字串；非數值時回傳原始值
 */
export function MoneyFormat(inputString) {
  const objType = typeof inputString
  if (!(objType === 'number' || (objType === 'string' && /^-?(0|[1-9]\d*|(?=\.))(\.\d+)?$/.test(inputString)))) {
    return inputString
  }
  if (!inputString && inputString !== 0) return ''
  if (inputString === 0) return '0'

  inputString = inputString + ''
  const isNeg = inputString.indexOf('-') === 0
  const lenPoint = inputString.indexOf('.')

  const stringToBigNumber = (s) => {
    s = s + ''
    const integers = s.match(/\d+/g)
    if (!integers) return '0'
    return integers.join('') || '0'
  }

  let string_int, string_float, hasFloat
  if (lenPoint > 0) {
    string_int = stringToBigNumber(inputString.substring(0, lenPoint))
    string_float = stringToBigNumber(inputString.substring(lenPoint + 1))
    hasFloat = true
  } else {
    string_int = stringToBigNumber(inputString)
    hasFloat = false
  }

  while (string_int.length % 3 !== 0) {
    string_int = '0' + string_int
  }

  const integers = string_int.match(/\d{3}/g)
  let output = ''
  for (let i = 0; i < integers.length; i++) {
    let _int = integers[i]
    if (i === 0) {
      if (_int === '000') continue
      _int = String(parseInt(_int, 10))
    }
    output = output + _int + ','
  }
  output = output.substring(0, output.length - 1)

  if (isNeg) output = '-' + output
  if (hasFloat) output = output + '.' + string_float
  return output
}

/**
 * 將民國日期數字字串插入分隔點
 * 範例：`DateFormat('920101')` → `'92.01.01'`
 * 範例：`DateFormat('1100523')` → `'110.05.23'`
 * @param {string} strDate - 民國日期數字字串（yyMMdd 或 yyyMMdd）
 * @returns {string} 插入分隔點後的民國日期字串
 */
export function DateFormat(strDate) {
  const Tempstr = '_' + strDate
  let TextString = ''
  let IntCommon = 0
  for (let i = 0; i < Tempstr.length - 1; i++) {
    if (IntCommon === 2 && i < 6) {
      IntCommon = 0
      TextString = '.' + TextString
    }
    IntCommon = IntCommon + 1
    TextString = Tempstr.charAt(Tempstr.length - 1 - i) + TextString
  }
  return TextString
}

/**
 * 將 DB 時間格式字串標準化為 hhmmss 格式
 * 支援輸入格式：`hh:mm:ss`、`hh.mm.ss`（有分隔符號），或已為 hhmmss 格式則直接回傳
 * 範例：`timeForTextfield('09:05:03')` → `'090503'`
 * 範例：`timeForTextfield('9.5.3')` → `'090503'`
 * @param {string} timevalue - 時間字串
 * @returns {string} hhmmss 格式字串，無法解析時回傳空字串
 */
export function timeForTextfield(timevalue) {
  if (!timevalue) return ''

  let timeArray
  if (timevalue.indexOf(':') >= 0) {
    timeArray = timevalue.split(':')
  } else if (timevalue.indexOf('.') >= 0) {
    timeArray = timevalue.split('.')
  } else {
    return timevalue
  }

  let result = ''
  for (let i = 0; i < timeArray.length; i++) {
    let value = parseInt(timeArray[i], 10) + ''
    while (value.length < 2) value = '0' + value
    result = result + value
  }

  if (result.length > 6) {
    result = result.substr(0, 6)
  } else {
    while (result.length < 6) result = result + '0'
  }

  return result
}

/**
 * 將數字轉換為帶兩位小數的千分位貨幣格式字串
 * 範例：`formatCurrency(1234567.891)` → `'1,234,567.89'`
 * 範例：`formatCurrency(-500)` → `'-500.00'`
 * 範例：`formatCurrency('abc')` → `'0.00'`
 * @param {string|number} num - 數值或數值字串
 * @returns {string} 千分位貨幣格式字串（含兩位小數）
 */
export function formatCurrency(num) {
  num = (num + '').replace(/\$|\,/g, '')
  if (isNaN(num)) num = '0'

  const sign = (num == (num = Math.abs(+num)))
  num = Math.floor(+num * 100 + 0.50000000001)
  let cents = num % 100
  num = Math.floor(num / 100).toString()

  if (cents < 10) cents = '0' + cents

  for (let i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
    num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3))
  }

  return (sign ? '' : '-') + num + '.' + cents
}

/**
 * 判斷 keypress 事件的 keyCode 是否為允許的數字按鍵
 * 允許範圍：數字 0-9（keyCode 48-57），可選允許小數點（46）與負號（45）
 * @param {number} keyCode - event.keyCode
 * @param {boolean} [isDot=false] - 是否允許輸入小數點
 * @param {boolean} [isNegative=false] - 是否允許輸入負號
 * @returns {boolean} 是否為允許的按鍵
 */
export function keypressNumberOnly(keyCode, isDot, isNegative) {
  return (keyCode >= 48 && keyCode <= 57) || (isNegative && keyCode === 45) || (isDot && keyCode === 46)
}

/**
 * 判斷 keypress 輸入是否為合法數值，並處理負號與小數點的邊界條件
 * - 負號：僅在值尚未含負號時才允許，並自動在值前加上負號後攔截事件
 * - 小數點：值已含小數點時不允許；值為空時自動補 `0.`
 * - 數字 0：值已為 `0` 時不允許再輸入 0
 * @param {HTMLInputElement} obj - keypress 當下的 input 元素
 * @param {number} keyCode - event.keyCode
 * @param {boolean} [isDot=false] - 是否允許輸入小數點
 * @param {boolean} [isNegative=false] - 是否允許輸入負號
 * @returns {boolean} 是否應允許該按鍵輸入（false 表示應呼叫 event.preventDefault()）
 */
export function keypressNumberValue(obj, keyCode, isDot, isNegative) {
  const inputIsNegative = keyCode === 45

  if (!((keyCode >= 48 && keyCode <= 57) || (isNegative && inputIsNegative) || (isDot && keyCode === 46))) {
    return false
  }

  if (inputIsNegative) {
    if (obj.value.indexOf('-') < 0) {
      obj.value = '-' + obj.value
    }
    return false
  }

  if (keyCode === 48 && obj.value === '0') {
    return false
  }

  if (keyCode === 46) {
    if (obj.value.indexOf('.') >= 0) {
      return false
    }
    if (obj.value.length === 0) {
      obj.value = '0' + obj.value
    }
  }

  return true
}
