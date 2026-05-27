const FLOATING_STATE_KEY = '__dialogFloatingState__'

/**
 * 取得（或初始化）元素浮動狀態。
 * @param {HTMLElement} el 目標元素。
 * @returns {{x:number,y:number,width:number|null,height:number|null}} 浮動狀態。
 */
function getFloatingState(el) {
  if (el[FLOATING_STATE_KEY] == null) {
    el[FLOATING_STATE_KEY] = {
      x: 0,
      y: 0,
      width: null,
      height: null
    }
  }

  return el[FLOATING_STATE_KEY]
}

/**
 * 整理拖曳設定。
 * @param {any} value 指令綁定值。
 * @returns {{enabled:boolean,handle:string,lockToViewport:boolean,resetWhenDisabled:boolean}} 拖曳設定。
 */
function normalizeDragOptions(value) {
  const fallback = {
    enabled: true,
    handle: '',
    lockToViewport: true,
    resetWhenDisabled: false
  }

  if (value === false) {
    return {
      ...fallback,
      enabled: false
    }
  }

  if (value == null || value === true || typeof value !== 'object') {
    return fallback
  }

  return {
    enabled: value.enabled !== false,
    handle: typeof value.handle === 'string' ? value.handle : fallback.handle,
    lockToViewport: value.lockToViewport !== false,
    resetWhenDisabled: value.resetWhenDisabled === true
  }
}

/**
 * 整理縮放設定。
 * @param {any} value 指令綁定值。
 * @returns {{enabled:boolean,minWidth:number,minHeight:number,lockToViewport:boolean,resetWhenDisabled:boolean}} 縮放設定。
 */
function normalizeResizeOptions(value) {
  const fallback = {
    enabled: true,
    minWidth: 320,
    minHeight: 220,
    lockToViewport: true,
    resetWhenDisabled: false
  }

  if (value === false) {
    return {
      ...fallback,
      enabled: false
    }
  }

  if (value == null || value === true || typeof value !== 'object') {
    return fallback
  }

  const minWidth = Number(value.minWidth)
  const minHeight = Number(value.minHeight)

  return {
    enabled: value.enabled !== false,
    minWidth: Number.isFinite(minWidth) && minWidth > 0 ? minWidth : fallback.minWidth,
    minHeight: Number.isFinite(minHeight) && minHeight > 0 ? minHeight : fallback.minHeight,
    lockToViewport: value.lockToViewport !== false,
    resetWhenDisabled: value.resetWhenDisabled === true
  }
}

/**
 * 限制數值區間。
 * @param {number} value 原始值。
 * @param {number} min 最小值。
 * @param {number} max 最大值。
 * @returns {number} 限制後數值。
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * 將拖曳位移套用到元素。
 * @param {HTMLElement} el 目標元素。
 * @returns {void} 執行結果。
 */
function applyTranslate(el) {
  const state = getFloatingState(el)

  if (state.x === 0 && state.y === 0) {
    el.style.transform = ''
    return
  }

  el.style.transform = `translate(${state.x}px, ${state.y}px)`
}

/**
 * 將尺寸套用到元素。
 * @param {HTMLElement} el 目標元素。
 * @returns {void} 執行結果。
 */
function applySize(el) {
  const state = getFloatingState(el)

  el.style.width = state.width == null ? '' : `${state.width}px`
  el.style.height = state.height == null ? '' : `${state.height}px`
}

/**
 * 重置浮動位置。
 * @param {HTMLElement} el 目標元素。
 * @returns {void} 執行結果。
 */
function resetTranslate(el) {
  const state = getFloatingState(el)
  state.x = 0
  state.y = 0
  applyTranslate(el)
}

/**
 * 重置浮動尺寸。
 * @param {HTMLElement} el 目標元素。
 * @returns {void} 執行結果。
 */
function resetSize(el) {
  const state = getFloatingState(el)
  state.width = null
  state.height = null
  applySize(el)
}

/**
 * 綁定拖曳事件。
 * @param {HTMLElement} el 目標元素。
 * @param {{value:any}} binding 指令綁定資訊。
 * @returns {void} 執行結果。
 */
function bindDrag(el, binding) {
  if (typeof el.__dialogDragCleanup === 'function') {
    el.__dialogDragCleanup()
    el.__dialogDragCleanup = null
  }

  const options = normalizeDragOptions(binding?.value)
  const handle =
    options.handle !== ''
      ? el.querySelector(options.handle)
      : el

  if (handle == null) {
    return
  }

  handle.style.touchAction = 'none'
  handle.style.cursor = options.enabled === true ? 'move' : ''

  let removeMoveListener = null
  let removeUpListener = null

  const cleanupWindowListeners = () => {
    if (typeof removeMoveListener === 'function') {
      removeMoveListener()
      removeMoveListener = null
    }

    if (typeof removeUpListener === 'function') {
      removeUpListener()
      removeUpListener = null
    }
  }

  const onMouseDown = downEvent => {
    const latestOptions = normalizeDragOptions(binding?.value)

    if (latestOptions.enabled !== true) {
      return
    }

    if (downEvent.button !== 0) {
      return
    }

    if (downEvent.target?.closest('[data-dialog-resize-handle="1"]')) {
      return
    }

    downEvent.preventDefault()

    const state = getFloatingState(el)
    const originX = state.x
    const originY = state.y
    const startX = downEvent.clientX
    const startY = downEvent.clientY
    const startRect = el.getBoundingClientRect()
    const viewportMargin = 8

    const onMouseMove = moveEvent => {
      const nextRawX = originX + (moveEvent.clientX - startX)
      const nextRawY = originY + (moveEvent.clientY - startY)

      if (latestOptions.lockToViewport !== true) {
        state.x = nextRawX
        state.y = nextRawY
        applyTranslate(el)
        return
      }

      const minX = -startRect.left + viewportMargin
      const maxX = window.innerWidth - startRect.right - viewportMargin
      const minY = -startRect.top + viewportMargin
      const maxY = window.innerHeight - startRect.bottom - viewportMargin

      state.x = clamp(nextRawX, minX, maxX)
      state.y = clamp(nextRawY, minY, maxY)
      applyTranslate(el)
    }

    const onMouseUp = () => {
      cleanupWindowListeners()
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    removeMoveListener = () => {
      window.removeEventListener('mousemove', onMouseMove)
    }

    removeUpListener = () => {
      window.removeEventListener('mouseup', onMouseUp)
    }
  }

  handle.addEventListener('mousedown', onMouseDown)

  if (options.enabled !== true && options.resetWhenDisabled === true) {
    resetTranslate(el)
  }

  el.__dialogDragCleanup = () => {
    cleanupWindowListeners()
    handle.removeEventListener('mousedown', onMouseDown)
  }
}

/**
 * 綁定縮放事件。
 * @param {HTMLElement} el 目標元素。
 * @param {{value:any}} binding 指令綁定資訊。
 * @returns {void} 執行結果。
 */
function bindResize(el, binding) {
  if (typeof el.__dialogResizeCleanup === 'function') {
    el.__dialogResizeCleanup()
    el.__dialogResizeCleanup = null
  }

  const options = normalizeResizeOptions(binding?.value)

  if (window.getComputedStyle(el).position === 'static') {
    el.style.position = 'relative'
  }

  const handle = document.createElement('div')
  handle.className = 'dialog-floating__resize-handle'
  handle.setAttribute('data-dialog-resize-handle', '1')
  handle.style.position = 'absolute'
  handle.style.right = '6px'
  handle.style.bottom = '6px'
  handle.style.width = '14px'
  handle.style.height = '14px'
  handle.style.cursor = 'nwse-resize'
  handle.style.borderRight = '2px solid rgba(255, 255, 255, 0.7)'
  handle.style.borderBottom = '2px solid rgba(255, 255, 255, 0.7)'
  handle.style.opacity = options.enabled === true ? '0.9' : '0'
  handle.style.pointerEvents = options.enabled === true ? 'auto' : 'none'
  handle.style.zIndex = '3'

  el.appendChild(handle)

  let removeMoveListener = null
  let removeUpListener = null

  const cleanupWindowListeners = () => {
    if (typeof removeMoveListener === 'function') {
      removeMoveListener()
      removeMoveListener = null
    }

    if (typeof removeUpListener === 'function') {
      removeUpListener()
      removeUpListener = null
    }
  }

  const onMouseDown = downEvent => {
    const latestOptions = normalizeResizeOptions(binding?.value)

    if (latestOptions.enabled !== true) {
      return
    }

    if (downEvent.button !== 0) {
      return
    }

    downEvent.preventDefault()
    downEvent.stopPropagation()

    const state = getFloatingState(el)
    const startX = downEvent.clientX
    const startY = downEvent.clientY
    const startRect = el.getBoundingClientRect()
    const originWidth = state.width ?? startRect.width
    const originHeight = state.height ?? startRect.height

    const onMouseMove = moveEvent => {
      const nextRawWidth = originWidth + (moveEvent.clientX - startX)
      const nextRawHeight = originHeight + (moveEvent.clientY - startY)

      if (latestOptions.lockToViewport !== true) {
        state.width = Math.max(latestOptions.minWidth, nextRawWidth)
        state.height = Math.max(latestOptions.minHeight, nextRawHeight)
        applySize(el)
        return
      }

      const viewportMargin = 8
      const maxWidth = Math.max(
        latestOptions.minWidth,
        window.innerWidth - startRect.left - viewportMargin
      )
      const maxHeight = Math.max(
        latestOptions.minHeight,
        window.innerHeight - startRect.top - viewportMargin
      )

      state.width = clamp(nextRawWidth, latestOptions.minWidth, maxWidth)
      state.height = clamp(nextRawHeight, latestOptions.minHeight, maxHeight)
      applySize(el)
    }

    const onMouseUp = () => {
      cleanupWindowListeners()
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    removeMoveListener = () => {
      window.removeEventListener('mousemove', onMouseMove)
    }

    removeUpListener = () => {
      window.removeEventListener('mouseup', onMouseUp)
    }
  }

  handle.addEventListener('mousedown', onMouseDown)

  if (options.enabled !== true && options.resetWhenDisabled === true) {
    resetSize(el)
  }

  el.__dialogResizeCleanup = () => {
    cleanupWindowListeners()
    handle.removeEventListener('mousedown', onMouseDown)
    handle.remove()
  }
}

export const dialogDraggableDirective = {
  /**
   * dialog 元件掛載時綁定拖曳能力。
   * @param {HTMLElement} el 目標元素。
   * @param {import('vue').DirectiveBinding} binding 指令綁定資訊。
   * @returns {void} 無回傳值。
   */
  mounted(el, binding) {
    bindDrag(el, binding)
  },
  /**
   * dialog 指令更新時同步拖曳設定。
   * @param {HTMLElement} el 目標元素。
   * @param {import('vue').DirectiveBinding} binding 指令綁定資訊。
   * @returns {void} 無回傳值。
   */
  updated(el, binding) {
    bindDrag(el, binding)
  },
  /**
   * 指令解除掛載時清理拖曳事件。
   * @param {HTMLElement} el 目標元素。
   * @returns {void} 無回傳值。
   */
  unmounted(el) {
    if (typeof el.__dialogDragCleanup === 'function') {
      el.__dialogDragCleanup()
      el.__dialogDragCleanup = null
    }
  }
}

export const dialogResizableDirective = {
  /**
   * dialog 元件掛載時綁定縮放能力。
   * @param {HTMLElement} el 目標元素。
   * @param {import('vue').DirectiveBinding} binding 指令綁定資訊。
   * @returns {void} 無回傳值。
   */
  mounted(el, binding) {
    bindResize(el, binding)
  },
  /**
   * dialog 指令更新時同步縮放設定。
   * @param {HTMLElement} el 目標元素。
   * @param {import('vue').DirectiveBinding} binding 指令綁定資訊。
   * @returns {void} 無回傳值。
   */
  updated(el, binding) {
    bindResize(el, binding)
  },
  /**
   * 指令解除掛載時清理縮放事件。
   * @param {HTMLElement} el 目標元素。
   * @returns {void} 無回傳值。
   */
  unmounted(el) {
    if (typeof el.__dialogResizeCleanup === 'function') {
      el.__dialogResizeCleanup()
      el.__dialogResizeCleanup = null
    }
  }
}
