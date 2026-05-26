import { reactive } from 'vue'

function normalizePopupConfig(inConfig, inWidth, inHeight, inLeft, inTop, inScrolling, inParameters) {
  if (typeof inConfig === 'string') {
    return {
      src: inConfig,
      width: inWidth,
      height: inHeight,
      left: inLeft,
      top: inTop,
      scrolling: inScrolling,
      parameters: inParameters,
    }
  }
  if (inConfig && typeof inConfig === 'object') {
    return { ...inConfig }
  }
  return null
}

function appendFormAndSubmit({ action, target, params = {} }) {
  const form = document.createElement('form')
  form.method = 'post'
  form.action = action
  form.target = target
  form.style.display = 'none'

  Object.entries(params || {}).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value == null ? '' : String(value)
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

export function usePopupWinAdapter() {
  const state = reactive({
    visible: false,
    src: '',
    title: '',
    width: 0.9,
    height: 0.8,
    top: 0.4,
    left: 0.5,
    scrolling: true,
    parameters: {},
    fullPopup: false,
    closeBtn: true,
    closeConfirm: null,
  })

  let callbackHandler = null
  let onCloseHandler = null

  function popup(inConfig, inWidth, inHeight, inLeft, inTop, inScrolling, inParameters) {
    const config = normalizePopupConfig(
      inConfig,
      inWidth,
      inHeight,
      inLeft,
      inTop,
      inScrolling,
      inParameters,
    )

    if (!config || !config.src) {
      return
    }

    callbackHandler = config.cb || config.onBack || null
    onCloseHandler = config.onClose || config.onclose || null

    state.src = config.src
    state.title = config.title || ''
    state.width = config.width ?? 0.9
    state.height = config.height ?? 0.8
    state.top = config.top ?? 0.4
    state.left = config.left ?? 0.5
    state.scrolling = config.scrolling ?? true
    state.parameters = config.parameters || {}
    state.fullPopup = config.isFullPopup === true
    state.closeBtn = config.closeBtn !== false
    state.closeConfirm = config.closeConfirm || null
    state.visible = true
  }

  function fullPopup(inConfig, inParameters) {
    const config = normalizePopupConfig(inConfig, undefined, undefined, undefined, undefined, undefined, inParameters)
    if (!config || !config.src) {
      return
    }
    popup({ ...config, isFullPopup: true, closeConfirm: null })
  }

  function close() {
    state.visible = false
    if (typeof onCloseHandler === 'function') {
      onCloseHandler()
    }
    onCloseHandler = null
  }

  function back(...args) {
    if (typeof callbackHandler === 'function') {
      callbackHandler(...args)
    }
    close()
  }

  function windowOpen(url, opts = {}) {
    if (!url) return

    const params = opts.parameters || {}
    const fullScreen = opts.fullScreen === true

    const attrs = {
      status: 'no',
      toolbar: 'no',
      menubar: 'no',
      resizable: fullScreen ? 'no' : 'yes',
      scrollbars: 'yes',
      ...(opts.attributes || {}),
    }

    if (fullScreen) {
      attrs.width = String(window.screen.availWidth)
      attrs.height = String(window.screen.availHeight)
      attrs.top = '0'
      attrs.left = '0'
    }

    const attrString = Object.entries(attrs)
      .map(([k, v]) => `${k}=${v}`)
      .join(',')

    const windowName = opts.windowName || 'popupWinWindowOpen'
    window.open('', windowName, attrString, true)
    appendFormAndSubmit({ action: url, target: windowName, params })
  }

  function createPopupLink(text, inConfig, ...legacyArgs) {
    return {
      text,
      onClick: () => popup(inConfig, ...legacyArgs),
    }
  }

  function createPopupButton(text, inConfig, ...legacyArgs) {
    return {
      text,
      onClick: () => popup(inConfig, ...legacyArgs),
    }
  }

  function createFullPopupLink(text, inConfig, inScrolling, inParameters) {
    return {
      text,
      onClick: () => fullPopup(inConfig, inParameters),
      scrolling: inScrolling,
    }
  }

  function createFullPopupButton(text, inConfig, inScrolling, inParameters) {
    return {
      text,
      onClick: () => fullPopup(inConfig, inParameters),
      scrolling: inScrolling,
    }
  }

  function setCallbackHandler(handler) {
    callbackHandler = handler
  }

  function onDialogBack(...args) {
    back(...args)
  }

  return {
    state,
    popup,
    fullPopup,
    close,
    back,
    windowOpen,
    createPopupLink,
    createPopupButton,
    createFullPopupLink,
    createFullPopupButton,
    setCallbackHandler,
    onDialogBack,
  }
}
