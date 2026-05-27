import { usePopupWin } from '@/composables/usePopupWin.js'

const defaultCallback = () => {}
const defaultWindowName = 'popupWinWindowOpen'

// 基礎型別判斷：用於 legacy 參數檢查與容錯。
/**
 * isObject 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isObject(value) {
  return value !== null && typeof value === 'object' && Array.isArray(value) === false
}

/**
 * isString 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isString(value) {
  return typeof value === 'string'
}

/**
 * isFunction 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isFunction(value) {
  return typeof value === 'function'
}

// popup 至少要有 src 才能執行，避免開空白視窗。
/**
 * hasValidSrc 功能說明。
 * @param {any} config 參數 config。
 * @returns {boolean} 執行結果。
 */
function hasValidSrc(config) {
  return config != null && isString(config.src) && config.src !== ''
}

// 同時支援舊簽章 popup(src, width, ...) 與新式 config object。
/**
 * normalizePopupConfig 功能說明。
 * @param {any} inConfig 參數 inConfig。
 * @param {any} inWidth 參數 inWidth。
 * @param {any} inHeight 參數 inHeight。
 * @param {any} inLeft 參數 inLeft。
 * @param {any} inTop 參數 inTop。
 * @param {any} inScrolling 參數 inScrolling。
 * @param {any} inParameters 參數 inParameters。
 * @returns {any} 執行結果。
 */
function normalizePopupConfig(inConfig, inWidth, inHeight, inLeft, inTop, inScrolling, inParameters) {
  if (isString(inConfig)) {
    return {
      src: inConfig,
      width: inWidth,
      height: inHeight,
      left: inLeft,
      top: inTop,
      scrolling: inScrolling,
      parameters: inParameters
    }
  }

  if (isObject(inConfig)) {
    return { ...inConfig }
  }

  return null
}

// 組裝 window.open 的屬性字串，並在 fullScreen 時覆蓋尺寸與位置。
/**
 * buildWindowOpenAttributes 功能說明。
 * @param {any} attributes 參數 attributes。
 * @param {any} fullScreen 參數 fullScreen。
 * @returns {any} 執行結果。
 */
function buildWindowOpenAttributes(attributes, fullScreen) {
  const result = {
    status: 'no',
    toolbar: 'no',
    menubar: 'no',
    resizable: fullScreen ? 'no' : 'yes',
    scrollbars: 'yes'
  }

  if (isObject(attributes)) {
    Object.assign(result, attributes)
  }

  if (fullScreen === true) {
    result.width = window.screen.availWidth
    result.height = window.screen.availHeight
    result.top = 0
    result.left = 0
  }

  return Object.entries(result)
    .map(([key, value]) => `${key}=${value}`)
    .join(',')
}

  // 建立（或重用）隱藏 form 以維持舊版 windowOpen 的 POST 行為。
/**
 * createWindowOpenForm 功能說明。
 * @param {any} url 參數 url。
 * @param {any} target 參數 target。
 * @param {any} params 參數 params。
 * @returns {any} 執行結果。
 */
function createWindowOpenForm(url, target, params) {
  const formId = '_popupWin_windowOpen_form'
  let formElement = document.getElementById(formId)

  if (formElement == null) {
    formElement = document.createElement('form')
    formElement.id = formId
    formElement.method = 'post'
    formElement.style.display = 'none'
    document.body.appendChild(formElement)
  }

  formElement.action = url
  formElement.target = target
  formElement.innerHTML = ''

  Object.entries(params || {}).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value === null || value === void 0 ? '' : String(value)
    formElement.appendChild(input)
  })

  // TODO: 既有流程依賴 top 上的資訊，後續改為明確注入。
  try {
    const systemInfo = window.top?.eBAF_loginSystemInfo
    const userFlag = window.top?.eBAF_UserObject_Flag

    if (systemInfo) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'eBAF_loginSystemInfo'
      input.value = systemInfo
      formElement.appendChild(input)
    }

    if (userFlag) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'eBAF_UserObject_Flag'
      input.value = userFlag
      formElement.appendChild(input)
    }
  } catch (error) {
    // Cross-origin 時忽略 top 取值失敗。
  }

  return formElement
}

// 舊系統允許 callbackHandler/callbackProxy 以「指派」方式覆寫，這裡維持相容。
/**
 * resolveLegacyAssignedCallback 功能說明。
 * @param {any} callbackCandidate 參數 callbackCandidate。
 * @returns {any} 執行結果。
 */
function resolveLegacyAssignedCallback(callbackCandidate) {
  return isFunction(callbackCandidate) && callbackCandidate !== defaultCallback
    ? callbackCandidate
    : null
}

  // 產生 legacy 風格的 link/button 開窗元素。
/**
 * createTriggerElement 功能說明。
 * @param {any} tagName 參數 tagName。
 * @param {any} text 參數 text。
 * @param {any} onClick 參數 onClick。
 * @returns {any} 執行結果。
 */
function createTriggerElement(tagName, text, onClick) {
  const element = document.createElement(tagName)

  if (tagName === 'button') {
    element.type = 'button'
    element.className = 'button'
  } else {
    element.href = '#'
  }

  // 使用 textContent 避免把外部文字當成 HTML 插入。
  element.textContent = text == null ? '' : String(text)
  element.onclick = event => {
    event?.preventDefault?.()
    onClick()
  }

  return element
}

// 建立 facade：對外暴露與 popupWin.js 相同方法名稱。
/**
 * createPopupWinFacade 功能說明。
 * @returns {any} 執行結果。
 */
function createPopupWinFacade() {
  const popup = usePopupWin()
  let assignedCallbackHandler = defaultCallback
  let assignedCallbackProxy = defaultCallback

  const facade = {
    // 與舊版同名保留；目前先由每次 popup config 控制。
    setConfig() {
      // TODO: 舊版 setConfig 主要調整靜態預設值；現階段由 config 直接控制。
    },

    // 核心開窗入口：處理 config 正規化與 callback 優先序。
      /**
       * 開啟一般 popup 視窗。
       * @param {any} inConfig 視窗設定或 src。
       * @param {any} inWidth 視窗寬度。
       * @param {any} inHeight 視窗高度。
       * @param {any} inLeft 視窗 left 位置。
       * @param {any} inTop 視窗 top 位置。
       * @param {any} inScrolling 是否允許捲動。
       * @param {any} inParameters 傳遞參數。
       * @returns {void} 無回傳值。
       */
    popup(inConfig, inWidth, inHeight, inLeft, inTop, inScrolling, inParameters) {
      const config = normalizePopupConfig(
        inConfig,
        inWidth,
        inHeight,
        inLeft,
        inTop,
        inScrolling,
        inParameters
      )

      if (hasValidSrc(config) === false) {
        return
      }

      const callbackFromFacade =
        resolveLegacyAssignedCallback(assignedCallbackHandler)
        ?? resolveLegacyAssignedCallback(assignedCallbackProxy)
        ?? null

      // callback 來源順序：外部指派 callback > config.cb > config.onBack。
      const callbackFromConfig =
        isFunction(config.cb)
          ? config.cb
          : isFunction(config.onBack)
            ? config.onBack
            : null

      popup.open({
        ...config,
        cb: callbackFromFacade || callbackFromConfig
      })
    },

    // 全頁 popup：沿用 legacy 規則，強制全螢幕並清除 closeConfirm。
    /**
     * 開啟全螢幕 popup。
     * @param {any} inConfig 視窗設定或 src。
     * @param {any} inParameters 傳遞參數。
     * @returns {void} 無回傳值。
     */
    fullPopup(inConfig, inParameters) {
      const config = normalizePopupConfig(inConfig, null, null, null, null, null, inParameters)

      if (hasValidSrc(config) === false) {
        return
      }

      facade.popup({
        ...config,
        isFullPopup: true,
        closeConfirm: null
      })
    },

    // 關閉目前 popup。
    /**
     * 關閉目前 popup。
     * @returns {void} 無回傳值。
     */
    close() {
      popup.close()
    },

    // 回傳資料後關閉 popup。
    /**
     * 送出回傳資料並關閉 popup。
     * @param {...any} args 回傳參數。
     * @returns {void} 無回傳值。
     */
    back(...args) {
      popup.back(...args)
    },

    // 提供明確方法給 Vue 端主動觸發目前 popup 的 callback 鏈。
    /**
     * 主動觸發目前 popup callback。
     * @param {...any} args callback 參數。
     * @returns {void} 無回傳值。
     */
    triggerActiveCallback(...args) {
      popup.callbackHandler(...args)
    },

    // 與舊版一致：建立可直接插入 DOM 的連結觸發器。
    /**
     * 建立一般 popup 連結觸發器。
     * @param {any} text 顯示文字。
     * @param {any} inConfig 視窗設定或 src。
     * @param {any} inWidth 視窗寬度。
     * @param {any} inHeight 視窗高度。
     * @param {any} inLeft 視窗 left 位置。
     * @param {any} inTop 視窗 top 位置。
     * @param {any} inScrolling 是否允許捲動。
     * @param {any} inParameters 傳遞參數。
     * @returns {HTMLElement|null} 觸發元素或 null。
     */
    createPopupLink(text, inConfig, inWidth, inHeight, inLeft, inTop, inScrolling, inParameters) {
      const config = normalizePopupConfig(
        inConfig,
        inWidth,
        inHeight,
        inLeft,
        inTop,
        inScrolling,
        inParameters
      )

      if (hasValidSrc(config) === false) {
        return null
      }

      return createTriggerElement('a', text, () => {
        facade.popup(config)
      })
    },

    // 與舊版一致：建立可直接插入 DOM 的按鈕觸發器。
    /**
     * 建立一般 popup 按鈕觸發器。
     * @param {any} text 顯示文字。
     * @param {any} inConfig 視窗設定或 src。
     * @param {any} inWidth 視窗寬度。
     * @param {any} inHeight 視窗高度。
     * @param {any} inLeft 視窗 left 位置。
     * @param {any} inTop 視窗 top 位置。
     * @param {any} inScrolling 是否允許捲動。
     * @param {any} inParameters 傳遞參數。
     * @returns {HTMLElement|null} 觸發元素或 null。
     */
    createPopupButton(text, inConfig, inWidth, inHeight, inLeft, inTop, inScrolling, inParameters) {
      const config = normalizePopupConfig(
        inConfig,
        inWidth,
        inHeight,
        inLeft,
        inTop,
        inScrolling,
        inParameters
      )

      if (hasValidSrc(config) === false) {
        return null
      }

      return createTriggerElement('button', text, () => {
        facade.popup(config)
      })
    },

    // 建立 fullPopup 連結觸發器。
    /**
     * 建立全螢幕 popup 連結觸發器。
     * @param {any} text 顯示文字。
     * @param {any} inConfig 視窗設定或 src。
     * @param {any} inScrolling 是否允許捲動。
     * @param {any} inParameters 傳遞參數。
     * @returns {HTMLElement|null} 觸發元素或 null。
     */
    createFullPopupLink(text, inConfig, inScrolling, inParameters) {
      const config = normalizePopupConfig(inConfig, null, null, null, null, inScrolling, inParameters)

      if (hasValidSrc(config) === false) {
        return null
      }

      return createTriggerElement('a', text, () => {
        facade.fullPopup(config)
      })
    },

    // 建立 fullPopup 按鈕觸發器。
    /**
     * 建立全螢幕 popup 按鈕觸發器。
     * @param {any} text 顯示文字。
     * @param {any} inConfig 視窗設定或 src。
     * @param {any} inScrolling 是否允許捲動。
     * @param {any} inParameters 傳遞參數。
     * @returns {HTMLElement|null} 觸發元素或 null。
     */
    createFullPopupButton(text, inConfig, inScrolling, inParameters) {
      const config = normalizePopupConfig(inConfig, null, null, null, null, inScrolling, inParameters)

      if (hasValidSrc(config) === false) {
        return null
      }

      return createTriggerElement('button', text, () => {
        facade.fullPopup(config)
      })
    },

    // Legacy 空方法：先保留 API 形狀，避免既有程式呼叫失敗。
    /**
     * 相容 legacy API：保留調整上層捲軸高度介面。
     * @returns {void} 無回傳值。
     */
    changeTopScrollHeight() {
      // TODO: 舊功能待盤點是否仍有需求。
    },

    // Legacy 空方法：先保留 API 形狀，避免既有程式呼叫失敗。
    /**
     * 相容 legacy API：還原上層捲軸高度介面。
     * @returns {void} 無回傳值。
     */
    rollBackTopScrollHeight() {
      // TODO: 舊功能待盤點是否仍有需求。
    },

    // 舊版 window open 模式：新開視窗並透過 form POST 傳遞參數。
    /**
     * 使用 window.open 模式開啟新視窗。
     * @param {string} url 目標網址。
     * @param {object} [opts={}] 視窗與參數選項。
     * @returns {void} 無回傳值。
     */
    windowOpen(url, opts = {}) {
      if (isString(url) === false || url === '') {
        return
      }

      const windowName = isString(opts.windowName) && opts.windowName !== ''
        ? opts.windowName
        : defaultWindowName

      const fullScreen = opts.fullScreen === true
      const attrs = buildWindowOpenAttributes(opts.attributes, fullScreen)
      const formElement = createWindowOpenForm(url, windowName, opts.parameters)

      window.open('', windowName, attrs, true)
      formElement.submit()
    }
  }

  // 保留舊行為：允許外部以指派方式覆寫 callbackHandler/callbackProxy。
  Object.defineProperty(facade, 'callbackHandler', {
    /**
     * 讀取外部指派的 callbackHandler。
     * @returns {Function} callback 函式。
     */
    get() {
      return assignedCallbackHandler
    },
    /**
     * 指派 callbackHandler；若非函式則回退預設空函式。
     * @param {any} value callback 值。
     * @returns {void} 無回傳值。
     */
    set(value) {
      assignedCallbackHandler = isFunction(value) ? value : defaultCallback
    },
    enumerable: true,
    configurable: true
  })

  Object.defineProperty(facade, 'callbackProxy', {
    /**
     * 讀取外部指派的 callbackProxy。
     * @returns {Function} callback 函式。
     */
    get() {
      return assignedCallbackProxy
    },
    /**
     * 指派 callbackProxy；若非函式則回退預設空函式。
     * @param {any} value callback 值。
     * @returns {void} 無回傳值。
     */
    set(value) {
      assignedCallbackProxy = isFunction(value) ? value : defaultCallback
    },
    enumerable: true,
    configurable: true
  })

  return facade
}

let singletonFacade = null

// 回傳 facade 單例，確保全站共用同一組 callback 與狀態橋接。
/**
 * getPopupWinFacade 功能說明。
 * @returns {any} 執行結果。
 */
export function getPopupWinFacade() {
  if (singletonFacade == null) {
    singletonFacade = createPopupWinFacade()
  }

  return singletonFacade
}

// 初始化全域入口，讓舊程式可繼續使用 window.popupWin。
/**
 * initPopupWinFacade 功能說明。
 * @returns {any} 執行結果。
 */
export function initPopupWinFacade() {
  const facade = getPopupWinFacade()

  if (typeof window !== 'undefined') {
    window.popupWin = facade
  }

  return facade
}
