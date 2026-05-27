import { reactive, readonly } from 'vue'

// 依舊版 popupWin 習慣，未指定標題時顯示不換行空白。
const DEFAULT_TITLE = '\u00a0'
const REQUEST_METHOD_GET = 'get'
const REQUEST_METHOD_POST = 'post'

// popup 的單一共享狀態；保持全域單例以對齊 legacy 行為。
const defaultState = {
  visible: false,
  title: '',
  src: '',
  isFullPopup: false,
  resizable: true,
  movable: true,
  closeBtn: true,
  scrolling: true,
  closeConfirm: null,
  requestMethod: 'post',
  iframeName: '',
  formAction: '',
  formParams: {}
}

const state = reactive({ ...defaultState })

// 保存目前開窗流程的 callback 與關窗回調。
let callbackFunction = null
let onCloseFunction = null
let sequence = 0

// 判斷純物件（非陣列），用於 config/closeConfirm 之類參數檢查。
/**
 * isObject 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isObject(value) {
  return value !== null && typeof value === 'object' && Array.isArray(value) === false
}

// 判斷函式型別。
/**
 * isFunction 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isFunction(value) {
  return typeof value === 'function'
}

// legacy parameters flatten 僅支援基礎型別。
/**
 * isBasicType 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isBasicType(value) {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean'
}

// 將布林選項正規化：未傳值時回退到預設值。
/**
 * resolveBooleanOption 功能說明。
 * @param {any} value 參數 value。
 * @param {any} fallbackValue 參數 fallbackValue。
 * @returns {any} 執行結果。
 */
function resolveBooleanOption(value, fallbackValue) {
  if (typeof value === 'boolean') {
    return value
  }

  return fallbackValue
}

// 統一 request method，避免呼叫端傳入非預期字串。
/**
 * resolveRequestMethod 功能說明。
 * @param {any} config 參數 config。
 * @returns {any} 執行結果。
 */
function resolveRequestMethod(config) {
  const method = String(config.requestMethod || config.method || REQUEST_METHOD_POST).toLowerCase()
  return method === REQUEST_METHOD_GET ? REQUEST_METHOD_GET : REQUEST_METHOD_POST
}

// 舊版 popupWin 允許 parameters 傳入基本型別/陣列/物件；
// 這裡保留相同 flatten 規則以降低遷移風險。
/**
 * flattenParameters 功能說明。
 * @param {any} parent 參數 parent。
 * @param {any} inputParam 參數 inputParam。
 * @param {any} defaultName 參數 defaultName。
 * @returns {any} 執行結果。
 */
function flattenParameters(parent, inputParam, defaultName) {
  if (inputParam === null || inputParam === void 0) {
    return parent
  }

  if (isBasicType(inputParam)) {
    parent[defaultName] = inputParam
    return parent
  }

  if (Array.isArray(inputParam) === true) {
    inputParam.forEach((entry, index) => {
      flattenParameters(parent, entry, `${defaultName}_${index}`)
    })
    return parent
  }

  if (isObject(inputParam)) {
    Object.keys(inputParam).forEach(key => {
      flattenParameters(parent, inputParam[key], key)
    })
  }

  return parent
}

// 解析 src 上的 query string，並與 parameters 進行合併。
/**
 * parseQueryString 功能說明。
 * @param {any} src 參數 src。
 * @returns {any} 執行結果。
 */
function parseQueryString(src) {
  if (typeof src !== 'string' || src.includes('?') === false) {
    return {
      action: src,
      queryParams: {}
    }
  }

  const position = src.indexOf('?')
  const action = src.slice(0, position)
  const queryString = src.slice(position + 1)
  const queryParams = {}

  queryString.split('&').forEach(pair => {
    if (pair === '') {
      return
    }

    const mark = pair.indexOf('=')
    if (mark <= 0) {
      return
    }

    const key = decodeURIComponent(pair.slice(0, mark))
    const value = decodeURIComponent(pair.slice(mark + 1))
    queryParams[key] = value
  })

  return {
    action,
    queryParams
  }
}

// 關窗後重設狀態，避免殘留上一個 popup 的設定。
/**
 * resetState 功能說明。
 * @returns {any} 執行結果。
 */
function resetState() {
  Object.assign(state, { ...defaultState })
}

// 開啟 popup 的核心流程：驗證輸入、阻擋重複開窗、建立 iframe 目標資訊與 callback。
/**
 * open 功能說明。
 * @param {any} config 參數 config。
 * @returns {any} 執行結果。
 */
function open(config) {
  if (isObject(config) === false) {
    return false
  }

  const src = config.src || ''
  if (typeof src !== 'string' || src.trim() === '') {
    return false
  }

  if (state.visible === true) {
    // 舊版同一時間只允許一個 popup，因此直接拒絕重入。
    return false
  }

  const parsed = parseQueryString(src)
  const formParams = flattenParameters({}, config.parameters, 'parameters')

  Object.assign(formParams, parsed.queryParams)

  sequence += 1

  state.visible = true
  state.title = typeof config.title === 'string' ? config.title : DEFAULT_TITLE
  state.src = parsed.action
  state.isFullPopup = resolveBooleanOption(config.isFullPopup, false)
  state.resizable = resolveBooleanOption(config.resizable, true)
  state.movable = resolveBooleanOption(config.movable, true)
  state.closeBtn = resolveBooleanOption(config.closeBtn, true)
  state.scrolling = resolveBooleanOption(config.scrolling, true)
  state.closeConfirm = isObject(config.closeConfirm) ? config.closeConfirm : null
  state.requestMethod = resolveRequestMethod(config)
  state.iframeName = `popupwin_${Date.now()}_${sequence}`
  state.formAction = parsed.action
  state.formParams = formParams

  // callback 優先沿用舊命名：cb > onBack。
  callbackFunction = isFunction(config.cb)
    ? config.cb
    : isFunction(config.onBack)
      ? config.onBack
      : null

  onCloseFunction = isFunction(config.onClose)
    ? config.onClose
    : isFunction(config.onclose)
      ? config.onclose
      : null

  return true
}

// 關閉 popup：先清理 callback，再重設狀態，最後觸發 onClose。
/**
 * close 功能說明。
 * @returns {any} 執行結果。
 */
function close() {
  if (state.visible !== true) {
    return
  }

  const currentOnClose = onCloseFunction

  callbackFunction = null
  onCloseFunction = null

  resetState()

  if (isFunction(currentOnClose)) {
    currentOnClose()
  }
}

// 為了避免跨 iframe 物件參照問題，先嘗試轉為可序列化資料。
/**
 * normalizeCallbackPayload 功能說明。
 * @param {any} payload 參數 payload。
 * @returns {any} 執行結果。
 */
function normalizeCallbackPayload(payload) {
  if (payload === null || payload === void 0 || isBasicType(payload)) {
    return payload
  }

  try {
    return JSON.parse(JSON.stringify(payload))
  } catch (error) {
    return payload
  }
}

// 執行目前 popup 的 callback 鏈。
/**
 * callbackHandler 功能說明。
 * @param {any} args 參數 args。
 * @returns {any} 執行結果。
 */
function callbackHandler(...args) {
  if (isFunction(callbackFunction) === false) {
    return
  }

  // 維持舊版做法：回呼前先做可序列化轉換，避免跨 iframe 物件參照造成意外。
  callbackFunction(...args.map(normalizeCallbackPayload))
}

// 等價於舊版 popupWinBack：先回傳資料再關窗。
/**
 * back 功能說明。
 * @param {any} args 參數 args。
 * @returns {any} 執行結果。
 */
function back(...args) {
  callbackHandler(...args)
  close()
}

// 判斷關閉時是否需要顯示確認對話框。
/**
 * hasCloseConfirm 功能說明。
 * @returns {boolean} 執行結果。
 */
function hasCloseConfirm() {
  return isObject(state.closeConfirm) && typeof state.closeConfirm.msg === 'string'
}

// 對外提供 readonly state，避免外部直接改寫內部狀態。
/**
 * usePopupWin 功能說明。
 * @returns {any} 執行結果。
 */
export function usePopupWin() {
  return {
    state: readonly(state),
    open,
    close,
    back,
    callbackHandler,
    hasCloseConfirm
  }
}
