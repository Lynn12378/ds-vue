<script setup>
/**
 * Header.vue — header.jsp 翻新
 *
 * 職責：
 * 1. 依功能代碼呼叫後端 API 取得 PD_CTRL / IS_WATERMARK 設定
 * 2. 啟用資安管控（PD_CTRL）：禁止列印/複製/剪下/全選/另存，並記錄複製內容
 * 3. 啟用浮水印（IS_WATERMARK）：以 WatermarkPlus 顯示使用者姓名 + 時間戳
 *
 * 使用方式（BaseLayout.vue）：
 * ```vue
 * <AppHeader ref="headerRef" />
 * ```
 * 頁面切換時呼叫 headerRef.value.applyByFuncId(funcId, userId)
 *
 * defineExpose 公開 API：
 * - applyByFuncId(funcId, userId) — 依功能代碼啟用資安管控與浮水印
 * - enablePdCtrl(funcId)          — 僅啟用資安管控
 * - enableWatermark(userId)       — 僅啟用浮水印
 * - disablePdCtrl()               — 停用資安管控
 * - disableWatermark()            — 停用浮水印
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'

// ─── 常數 ────────────────────────────────────────────────────────────────────

/** 資安管控 — 攔截的 Ctrl+ 快捷鍵代碼對照表 */
const BLOCKED_CTRL_KEYS = {
  65: 'selectAll',  // A
  88: 'cut',        // X
  83: 'save',       // S
  80: 'print',      // P
}

/** 資安管控 — 各事件的提示訊息 */
const FPCSMSG = {
  print: '依據資安政策，不開放列印功能',
  beforeprint: '依據資安政策，不開放列印功能',
  copy: '依據資安政策，需留存複製軌跡，複製請改用Ctrl+Q',
  cut: '依據資安政策，不開放剪下功能',
  selectAll: '依據資安政策，不開放全選功能',
  save: '依據資安政策，不開放頁面儲存功能',
}

// ─── 狀態 ────────────────────────────────────────────────────────────────────

const isPdCtrlActive = ref(false)
const isWatermarkActive = ref(false)
const currentFuncId = ref('')

/** 記錄已綁定的 DOM 事件，用於清除 */
const pdCtrlListeners = []

/** 上次複製文字，用於去重 */
let lastCopyText = ''
let lastCopyTimer = null

/** WatermarkPlus 實例 */
let watermarkInstance = null

// ─── 資安管控（PD_CTRL） ─────────────────────────────────────────────────────

/**
 * 攔截事件並顯示提示訊息
 * @param {Event} e
 * @param {string} msgKey - FPCSMSG 的 key
 */
function blockEvent(e, msgKey) {
  e.stopPropagation()
  e.preventDefault()
  if (msgKey && FPCSMSG[msgKey]) {
    alert(FPCSMSG[msgKey])
  }
  return false
}

/**
 * `copy` 事件：允許複製但記錄複製內容至後端
 * 對應 JSP 的 `validateCopy` 函式
 * @param {ClipboardEvent} e
 */
function handleCopy(e) {
  const selected = window.getSelection()?.toString() ?? ''
  const cleaned = selected.replace(/\s+/g, ' ')

  if (!cleaned || cleaned === lastCopyText) return

  // 60 秒後重置去重紀錄
  clearTimeout(lastCopyTimer)
  lastCopyTimer = setTimeout(() => { lastCopyText = '' }, 60000)
  lastCopyText = cleaned

  // 截斷至 5000 字元
  const truncated = cleaned.length > 5000
    ? cleaned.substring(0, 4997) + '...'
    : cleaned

  const encoded = encodeURIComponent(truncated)
    .replace(/%25/g, '%25')

  // 以 img request 方式送出記錄（對應原始 fpcsImgReq 機制）
  const img = document.createElement('img')
  img.setAttribute(
    'src',
    `/ZZWeb/servlet/HttpDispatcher/ZZM0_0105/ctrlMsavelog?COPY_CONTENT=${encoded}&FUNC_ID=${currentFuncId.value}&COPY_LENGTH=${cleaned.length}&TS=${Date.now()}`
  )
}

/**
 * `keydown` 事件：攔截 Ctrl+A/X/S/P
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {
  if (!e.ctrlKey) return
  const msgKey = BLOCKED_CTRL_KEYS[e.keyCode]
  if (!msgKey) return
  blockEvent(e, msgKey)
}

/**
 * 啟用資安管控事件監聽
 * 對應 JSP PD_CTRL='Y' 時注入的事件處理邏輯
 * @param {string} funcId - 功能代碼，用於複製記錄
 */
function enablePdCtrl(funcId) {
  if (isPdCtrlActive.value) disablePdCtrl()

  currentFuncId.value = funcId
  isPdCtrlActive.value = true

  const body = document.body

  const bindings = [
    [body, 'contextmenu', (e) => blockEvent(e, null)],
    [body, 'beforeprint', (e) => blockEvent(e, 'beforeprint')],
    [body, 'copy', handleCopy],
    [body, 'cut', (e) => blockEvent(e, 'cut')],
    [window, 'keydown', handleKeydown],
  ]

  for (const [el, name, fn] of bindings) {
    el.addEventListener(name, fn, true)
    pdCtrlListeners.push([el, name, fn])
  }
}

/**
 * 停用資安管控，移除所有事件監聽
 */
function disablePdCtrl() {
  for (const [el, name, fn] of pdCtrlListeners) {
    el.removeEventListener(name, fn, true)
  }
  pdCtrlListeners.length = 0
  isPdCtrlActive.value = false
  clearTimeout(lastCopyTimer)
  lastCopyText = ''
}

// ─── 浮水印（IS_WATERMARK） ──────────────────────────────────────────────────

/**
 * 啟用浮水印
 * 對應 JSP isWaterMark=true 時建立 WatermarkPlus 實例的邏輯
 * @param {string} userId - 使用者姓名或員工編號
 */
function enableWatermark(userId) {
  if (isWatermarkActive.value) disableWatermark()

  isWatermarkActive.value = true

  const datetime = new Date().toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(/\//g, '-')

  // WatermarkPlus 為全域 JS 函式庫，透過 <script> 標籤載入
  if (typeof window.WatermarkPlus?.Watermark !== 'function') {
    console.warn('[header.vue] WatermarkPlus 未載入，無法啟用浮水印')
    return
  }

  watermarkInstance = new window.WatermarkPlus.Watermark({
    contentType: 'multi-line-text',
    content: `${userId}\n${datetime}`,
    width: 190,
    height: 85,
    lineHeight: 20,
    fontColor: '#000',
    fontWeight: 'normal',
    fontSize: '16px',
    fontFamily: 'Microsoft JhengHei',
    rotate: 17,
    globalAlpha: 0.07,
    mutationObserve: true,
    monitorProtection: true,
    layout: 'grid',
    gridLayoutOptions: { rows: 2, cols: 2, gap: [-18, -8], matrix: [[1, 0], [0, 1]] },
  })

  watermarkInstance.create()
}

/**
 * 停用浮水印，移除 WatermarkPlus 實例
 */
function disableWatermark() {
  if (watermarkInstance?.destroy) {
    watermarkInstance.destroy()
  }
  watermarkInstance = null
  isWatermarkActive.value = false
}

// ─── 公開 API ─────────────────────────────────────────────────────────────────

/**
 * 依功能代碼向後端查詢並套用資安管控 / 浮水印設定
 * 由 BaseLayout.vue 在路由切換後呼叫
 *
 * 後端 API 規格（需後端實作）：
 * GET /api/header/funcInfo?funcId=XXX
 * 回傳：{ pdCtrl: 'Y'|'N', isWaterMark: 'Y'|'N', userId: string }
 *
 * @param {string} funcId - 功能代碼（如 'DSZ01000'）
 * @param {string} [userId] - 使用者姓名/編號（若後端不回傳則由外部傳入）
 */
async function applyByFuncId(funcId, userId) {
  // 先停用舊設定
  disablePdCtrl()
  disableWatermark()

  if (!funcId) return

  try {
    // TODO: 替換為實際 axios 實例
    const resp = await fetch(`/api/header/funcInfo?funcId=${funcId}`)
    if (!resp.ok) return
    const data = await resp.json()

    if (data.pdCtrl === 'Y') {
      enablePdCtrl(funcId)
    }

    if (data.isWaterMark === 'Y') {
      enableWatermark(userId ?? data.userId ?? '')
    }
  } catch (e) {
    console.warn('[header.vue] applyByFuncId 發生錯誤', e)
  }
}

// ─── 生命週期 ────────────────────────────────────────────────────────────────

onBeforeUnmount(() => {
  disablePdCtrl()
  disableWatermark()
})

// ─── defineExpose ────────────────────────────────────────────────────────────

defineExpose({
  /**
   * 依功能代碼啟用資安管控與浮水印（主要入口）
   * @param {string} funcId
   * @param {string} [userId]
   */
  applyByFuncId,

  /**
   * 僅啟用資安管控
   * @param {string} funcId
   */
  enablePdCtrl,

  /**
   * 僅啟用浮水印
   * @param {string} userId
   */
  enableWatermark,

  /** 停用資安管控 */
  disablePdCtrl,

  /** 停用浮水印 */
  disableWatermark,
})
</script>

<template>
  <!--
    header.vue 為無視覺輸出的功能性元件
    資安管控與浮水印均以 JS 操作 document.body 實作，不需要額外的 HTML 結構

    PD_CTRL 的 @media print CSS 移至全域樣式：
    src/assets/sass/global.scss 加入：
    @media print {
      body > * { display: none !important; }
      body::after {
        content: '依據資安政策，不開放列印功能';
        display: block !important;
      }
    }

    EUDC 難字字型移至全域樣式：
    src/assets/sass/main.scss 的 @font-face
  -->
</template>
