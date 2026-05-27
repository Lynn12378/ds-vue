// Legacy RPTUtil pure-logic migration layer for Vue/Quasar projects.
// NOTE: 此檔案只保留資料運算與參數組裝，不處理 DOM、Ajax、window.open。

export const DEFAULT_BIG5_SYS_NOS = ['EG']
export const DEFAULT_WEB_NAME = 'ZRWeb'
export const DEFAULT_BIG5_WEB_NAME = 'ZRBWeb'

/**
 * isArray 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isArray(value) {
  return Array.isArray(value)
}

/**
 * isPlainObject 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && Array.isArray(value) === false
}

/**
 * escapeRegExp 功能說明。
 * @param {any} input 參數 input。
 * @returns {any} 執行結果。
 */
function escapeRegExp(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 依 legacy 規則判斷是否屬於 Big5 系統，並回傳對應 webName。
 * @param {string} locationHref 目前頁面網址。
 * @param {string[]} [useBig5EncodeServerSysNos=DEFAULT_BIG5_SYS_NOS] 需使用 Big5 的系統代碼。
 * @param {string} [defaultWebName=DEFAULT_WEB_NAME] 預設 Web 名稱。
 * @param {string} [big5WebName=DEFAULT_BIG5_WEB_NAME] Big5 Web 名稱。
 * @returns {{useBig5EncodeServer:boolean, webName:string}} 判斷結果與 webName。
 */
export function resolveWebName(
  locationHref,
  useBig5EncodeServerSysNos = DEFAULT_BIG5_SYS_NOS,
  defaultWebName = DEFAULT_WEB_NAME,
  big5WebName = DEFAULT_BIG5_WEB_NAME
) {
  const href = String(locationHref || '')

  let useBig5EncodeServer = false
  for (let i = 0; i < useBig5EncodeServerSysNos.length; i += 1) {
    const sysNo = useBig5EncodeServerSysNos[i]
    const pattern = new RegExp(`/${escapeRegExp(sysNo)}Web`)
    if (pattern.test(href)) {
      useBig5EncodeServer = true
      break
    }
  }

  return {
    useBig5EncodeServer,
    webName: useBig5EncodeServer ? big5WebName : defaultWebName
  }
}

/**
 * 對齊 legacy judgeHasCSRUtilOrSys：
 * 1) 先用 CSRUtil checker
 * 2) 再用 Sys checker
 * 3) 都沒有才退回 ErrMsg.returnCode == 0
 * @returns {any} 執行結果。
 */
export function resolveResponseSuccess(resp, checkerOptions = {}) {
  const { csrUtilChecker, sysChecker } = checkerOptions

  if (typeof csrUtilChecker === 'function') {
    return {
      isSuccess: !!csrUtilChecker(resp),
      hasExternalChecker: true,
      checker: 'CSRUtil'
    }
  }

  if (typeof sysChecker === 'function') {
    let callbackStatus = false
    const checkerResult = sysChecker(resp, status => {
      callbackStatus = !!status
    })

    const normalizedStatus =
      typeof checkerResult === 'boolean' ? checkerResult : callbackStatus

    return {
      isSuccess: normalizedStatus,
      hasExternalChecker: true,
      checker: 'Sys'
    }
  }

  return {
    isSuccess: !!(resp && resp.ErrMsg && resp.ErrMsg.returnCode === 0),
    hasExternalChecker: false,
    checker: null
  }
}

/**
 * 將 legacy ErrMsg.displayMsgDescs 統一整理成可顯示的多行錯誤字串。
 * @returns {any} 執行結果。
 */
export function extractLegacyErrorMessage(resp) {
  const errMsg = resp && resp.ErrMsg
  if (!errMsg || !errMsg.displayMsgDescs) {
    return ''
  }

  const normalized = String(errMsg.displayMsgDescs)
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n')

  return normalized
    .split('\n')
    .filter(line => line !== '')
    .join('\n')
    .trim()
}

/**
 * pushEntry 功能說明。
 * @param {any} entries 參數 entries。
 * @param {any} name 參數 name。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function pushEntry(entries, name, value) {
  entries.push({ name, value })
}

/**
 * 組裝 legacy actionHandler 會送出的 hidden input 清單。
 * 這是 RPTUtil 最核心的業務規則，供 UI/service 層直接消費。
 * @returns {any} 執行結果。
 */
export function buildPrintParameterEntries(options = {}) {
  const entries = []

  const submitParam = options.submitParam
  if (isPlainObject(submitParam)) {
    Object.keys(submitParam).forEach(key => {
      pushEntry(entries, key, submitParam[key])
    })
  }

  const encryptTempFileFullPath = options.encryptTempFileFullPath
  const downloadFileName = options.downloadFileName
  const beforeActions = isArray(options.beforeActions) ? options.beforeActions : false

  if (typeof encryptTempFileFullPath === 'string' && encryptTempFileFullPath !== '') {
    pushEntry(entries, 'encryptTempFileFullPath', encryptTempFileFullPath)

    if (options.encryptMarkedFileFullPath) {
      pushEntry(entries, 'encryptMarkedFileFullPath', options.encryptMarkedFileFullPath)
    }

    if (options.encryptMarkedFileName) {
      pushEntry(entries, 'encryptMarkedFileName', options.encryptMarkedFileName)
    }
  } else {
    const pageIds = options.pageIds
    const rptParams = options.rptParams
    const rptDetails = options.rptDetails

    const urlName = 'RPT_URL'
    const paramName = 'RPT_PARAM'
    const detailName = 'RPT_DETAIL'

    if (isArray(rptParams)) {
      let pageIdsIsArray = false
      let lengthIsSame = false

      if (isArray(pageIds)) {
        pageIdsIsArray = true
        if (pageIds.length === rptParams.length) {
          lengthIsSame = true
          for (let i = 0; i < pageIds.length; i += 1) {
            pushEntry(entries, urlName, pageIds[i])
          }
        }
      }

      for (let i = 0; i < rptParams.length; i += 1) {
        if (!pageIdsIsArray) {
          pushEntry(entries, urlName, pageIds)
        } else if (!lengthIsSame) {
          pushEntry(entries, urlName, pageIds[0])
        }

        pushEntry(entries, paramName, rptParams[i])
      }
    } else {
      pushEntry(entries, urlName, pageIds)
      pushEntry(entries, paramName, rptParams)
    }

    if (isArray(rptDetails)) {
      for (let i = 0; i < rptDetails.length; i += 1) {
        pushEntry(entries, detailName, rptDetails[i])
      }
    } else {
      pushEntry(entries, detailName, rptDetails)
    }
  }

  if (options.IS_TIFF) {
    pushEntry(entries, 'IS_TIFF', options.IS_TIFF)
  }

  if (beforeActions) {
    for (let i = 0; i < beforeActions.length; i += 1) {
      const beforeAction = beforeActions[i] || {}
      pushEntry(entries, 'url', beforeAction.url)
      pushEntry(entries, 'parameters', beforeAction.parameters || '{}')
    }
  }

  if (typeof downloadFileName === 'string' && downloadFileName !== '') {
    pushEntry(entries, 'downloadFileName', downloadFileName)
  }

  return entries
}

/**
 * 安全列印選項封裝：對齊 executeSecurityPrintHandler 參數映射。
 * @returns {any} 執行結果。
 */
export function buildSecurityPrintOptions(resp = {}, uiOptions = {}) {
  const output = {
    servletName: 'AppletServlet',
    encryptTempFileFullPath: resp.encryptTempFileFullPath,
    encryptMarkedFileFullPath: resp.encryptMarkedFileFullPath,
    encryptMarkedFileName: resp.encryptMarkedFileName,
    downloadFileName: resp.downloadFileName,
    isOpenNewBrowse: uiOptions.isOpenNewBrowse,
    isIndependent: uiOptions.isIndependent,
    submitParam: resp.submitParam
  }

  if (isArray(uiOptions.beforeActions)) {
    output.beforeActions = uiOptions.beforeActions
  }

  return output
}

/**
 * 一般檔案下載選項封裝：對齊 downloadFile -> download 的資料結構。
 * @returns {any} 執行結果。
 */
export function buildDownloadOptions(resp = {}, uiOptions = {}) {
  return {
    downloadFileName: resp.downloadFileName,
    downloadFileFullPath: resp.downloadFileFullPath,
    isOpenNewBrowse: uiOptions.isOpenNewBrowse
  }
}

/**
 * 將 fileWatchDog 需求轉為可逐筆開窗的請求資料。
 * @returns {any} 執行結果。
 */
export function buildWatchDogRequests(resp = {}, params = {}, webName = DEFAULT_WEB_NAME) {
  const actionUrl = `/${webName}/FileWatchDog`
  const enableWaterMark = params && Object.prototype.hasOwnProperty.call(params, 'enableWaterMark')
    ? params.enableWaterMark
    : 'false'

  const requests = []
  const encryptTempFileFullPaths = resp.encryptTempFileFullPaths

  if (isArray(encryptTempFileFullPaths) && encryptTempFileFullPaths.length > 0) {
    for (let i = 0; i < encryptTempFileFullPaths.length; i += 1) {
      requests.push({
        url: actionUrl,
        parameters: {
          encryptTempFileFullPath: encryptTempFileFullPaths[i],
          enableWaterMark
        },
        useSameWindow: false
      })
    }
    return requests
  }

  if (!resp.encryptTempFileFullPath) {
    return requests
  }

  requests.push({
    url: actionUrl,
    parameters: {
      encryptTempFileFullPath: resp.encryptTempFileFullPath,
      enableWaterMark,
      webName
    },
    useSameWindow: false
  })

  return requests
}

/**
 * 產生條碼 URL。
 * - value 為必要欄位
 * - 其餘參數提供 legacy 預設值
 * @returns {any} 執行結果。
 */
export function buildBarcodeUrl(options = {}, webName = DEFAULT_WEB_NAME) {
  const value = options.value
  if (value === null || value === void 0 || value === '') {
    return ''
  }

  const query = new URLSearchParams()
  query.set('inputStr', String(value))
  query.set('width', String(options.width ?? 1))
  query.set('height', String(options.height ?? 22))
  query.set('rotate', String(options.rotate === true))

  return `/${webName}/BarcodeGenerator?${query.toString()}`
}

const rptUtilPure = {
  DEFAULT_BIG5_SYS_NOS,
  DEFAULT_WEB_NAME,
  DEFAULT_BIG5_WEB_NAME,
  resolveWebName,
  resolveResponseSuccess,
  extractLegacyErrorMessage,
  buildPrintParameterEntries,
  buildSecurityPrintOptions,
  buildDownloadOptions,
  buildWatchDogRequests,
  buildBarcodeUrl
}

export default rptUtilPure