<template>
  <q-dialog
    v-model="dialogVisible"
    :maximized="popup.state.isFullPopup"
    :persistent="popup.hasCloseConfirm()"
  >
    <q-card
      class="popup-win__card"
      :class="{
        'popup-win__card--full': popup.state.isFullPopup
      }"
      v-dialog-draggable="dialogDragOptions"
      v-dialog-resizable="dialogResizeOptions"
    >
      <q-bar class="bg-primary text-white popup-win__toolbar">
        <div class="text-subtitle2 ellipsis">
          {{ popup.state.title }}
        </div>
        <q-space />
        <q-btn
          v-if="popup.state.closeBtn"
          dense
          flat
          round
          icon="close"
          @click="handleClose"
        />
      </q-bar>

      <q-card-section class="popup-win__body q-pa-none">
        <iframe
          v-if="popup.state.visible && popup.state.src"
          ref="iframeRef"
          :name="popup.state.iframeName"
          :title="popup.state.title || 'popup-window'"
          class="popup-win__iframe"
          :style="iframeStyle"
          @load="handleFrameLoad"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePopupWin } from '@/composables/usePopupWin.js'
import {
  dialogDraggableDirective,
  dialogResizableDirective
} from '@/directives/dialogFloating.js'

const $q = useQuasar()
const popup = usePopupWin()
const iframeRef = ref(null)
const vDialogDraggable = dialogDraggableDirective
const vDialogResizable = dialogResizableDirective

const dialogDragOptions = computed(() => ({
  enabled: popup.state.movable === true && popup.state.isFullPopup !== true,
  handle: '.popup-win__toolbar',
  resetWhenDisabled: popup.state.isFullPopup === true
}))

const dialogResizeOptions = computed(() => ({
  enabled: popup.state.resizable === true && popup.state.isFullPopup !== true,
  minWidth: 420,
  minHeight: 280,
  resetWhenDisabled: popup.state.isFullPopup === true
}))

// 由 composable 統一控制開關；Dialog 主動關閉時回寫到 popup 狀態。
const dialogVisible = computed({
  get: () => popup.state.visible,
  set: value => {
    if (value === false) {
      popup.close()
    }
  }
})

// legacy scrolling 設定對應到 iframe overflow。
const iframeStyle = computed(() => ({
  overflow: popup.state.scrolling === true ? 'auto' : 'hidden'
}))

// form submit 輔助：統一 hidden input 寫入規則。
/**
 * addFormField 功能說明。
 * @param {any} formElement 參數 formElement。
 * @param {any} key 參數 key。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function addFormField(formElement, key, value) {
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = key
  input.value = value === null || value === void 0 ? '' : String(value)
  formElement.appendChild(input)
}

// 補上 legacy 系統可能依賴的全域欄位。
/**
 * appendLegacyContext 功能說明。
 * @param {any} formElement 參數 formElement。
 * @returns {any} 執行結果。
 */
function appendLegacyContext(formElement) {
  // TODO: 舊系統可能依賴 top.eBAF_loginSystemInfo / top.eBAF_UserObject_Flag，
  // 待確認是否需要改由 auth provider 顯式注入。
  try {
    const systemInfo = window.top?.eBAF_loginSystemInfo
    const userFlag = window.top?.eBAF_UserObject_Flag

    if (systemInfo) {
      addFormField(formElement, 'eBAF_loginSystemInfo', systemInfo)
    }

    if (userFlag) {
      addFormField(formElement, 'eBAF_UserObject_Flag', userFlag)
    }
  } catch (error) {
    // Cross-origin 情境下無法讀取 top，保持靜默並照常送出。
  }
}

// GET 模式：將參數改寫到 query string 後直接載入 iframe。
/**
 * submitByGet 功能說明。
 * @param {any} action 參數 action。
 * @returns {any} 執行結果。
 */
function submitByGet(action) {
  const url = new URL(action, window.location.origin)

  Object.entries(popup.state.formParams).forEach(([key, value]) => {
    url.searchParams.set(key, value === null || value === void 0 ? '' : String(value))
  })

  if (iframeRef.value != null) {
    iframeRef.value.src = url.toString()
  }
}

// POST 模式：沿用舊版 form + target iframe 的送出流程。
/**
 * submitByPost 功能說明。
 * @param {any} action 參數 action。
 * @param {any} target 參數 target。
 * @returns {any} 執行結果。
 */
function submitByPost(action, target) {
  const formElement = document.createElement('form')
  formElement.style.display = 'none'
  formElement.method = 'post'
  formElement.action = action
  formElement.target = target

  Object.entries(popup.state.formParams).forEach(([key, value]) => {
    addFormField(formElement, key, value)
  })

  appendLegacyContext(formElement)

  document.body.appendChild(formElement)

  // TODO: 舊系統存在 submitOnce(form)；若未來需要防重複送出可在此擴充。
  formElement.submit()
  formElement.remove()
}

// 依 requestMethod 分派實際送出方式。
/**
 * submitToFrame 功能說明。
 * @returns {any} 執行結果。
 */
function submitToFrame() {
  const action = popup.state.formAction
  const target = popup.state.iframeName
  const requestMethod = popup.state.requestMethod

  if (typeof action !== 'string' || action === '' || typeof target !== 'string' || target === '') {
    return
  }

  if (requestMethod === 'get') {
    submitByGet(action)
    return
  }

  submitByPost(action, target)
}

// 將父頁可用的 popup API bridge 到 iframe 內頁。
/**
 * attachFrameBridge 功能說明。
 * @returns {any} 執行結果。
 */
function attachFrameBridge() {
  const frameWindow = iframeRef.value?.contentWindow
  if (frameWindow == null) {
    return
  }

  try {
    frameWindow.isPopupWin = true
    frameWindow.popupWinclose = () => popup.close()
    frameWindow.popupWinBack = (...args) => popup.back(...args)
    frameWindow.callbackHandler = (...args) => popup.callbackHandler(...args)
    frameWindow.callbackProxy = (...args) => popup.callbackHandler(...args)
    frameWindow.close = () => popup.close()
  } catch (error) {
    // Cross-origin iframe 無法橋接函式，維持 iframe 原生行為。
  }
}

// 關窗時移除 iframe src，降低殘留頁面與資源占用風險。
/**
 * detachFrameSource 功能說明。
 * @returns {any} 執行結果。
 */
function detachFrameSource() {
  if (iframeRef.value != null) {
    iframeRef.value.removeAttribute('src')
  }
}

// iframe 載入完成後再掛 bridge，確保 contentWindow 可用。
/**
 * handleFrameLoad 功能說明。
 * @returns {any} 執行結果。
 */
function handleFrameLoad() {
  attachFrameBridge()
}

// closeConfirm 的 UI 實作：統一由 Quasar Dialog 進行確認。
/**
 * showCloseConfirm 功能說明。
 * @param {any} message 參數 message。
 * @returns {Promise<any>} 執行結果。
 */
async function showCloseConfirm(message) {
  return new Promise(resolve => {
    $q.dialog({
      title: '\u78ba\u8a8d',
      message,
      cancel: true,
      persistent: true
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false))
  })
}

// 關閉入口：若有 closeConfirm 先確認，再執行實際 close。
/**
 * handleClose 功能說明。
 * @returns {Promise<any>} 執行結果。
 */
async function handleClose() {
  const closeConfirm = popup.state.closeConfirm

  if (closeConfirm && typeof closeConfirm.msg === 'string') {
    const assignConfirmType = closeConfirm.assignConfirmType === false ? false : true
    const confirmed = await showCloseConfirm(closeConfirm.msg)

    if (confirmed !== assignConfirmType) {
      return
    }
  }

  popup.close()
}

// 每次開窗後以 nextTick 提交 form，避免 target iframe 尚未掛載。
watch(
  () => popup.state.visible,
  visible => {
    if (visible === true) {
      nextTick(() => {
        submitToFrame()
      })
    } else {
      detachFrameSource()
    }
  }
)

onBeforeUnmount(() => {
  detachFrameSource()
})
</script>

<style scoped>
.popup-win__card {
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  max-height: 900px;
  display: flex;
  flex-direction: column;
}

.popup-win__card--full {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
}

.popup-win__body {
  flex: 1;
  min-height: 0;
}

.popup-win__iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.popup-win__toolbar {
  user-select: none;
}
</style>
