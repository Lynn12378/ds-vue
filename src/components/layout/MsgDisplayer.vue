<script setup>
/**
 * MsgDisplayer.vue — msgDisplayer.jsp 翻新
 *
 * 職責：
 * 1. 接收來自 customAxios 攔截器寫入的訊息（透過 Pinia store）
 * 2. 依 returnCode 判斷是否彈出 alert 訊息
 * 3. 在底部訊息欄（slot）顯示最新一筆訊息的 returnCode 與說明
 * 4. 請求發送前自動清除訊息
 *
 * 使用方式（BaseLayout.vue）：
 * ```vue
 * <MsgDisplayer ref="msgRef" />
 * ```
 *
 * Pinia store 訊息格式（customAxios 攔截器寫入）：
 * ```js
 * {
 *   returnCode: string,      // 對應 msgs[i][5]
 *   displayMsgDescs: string, // 對應 msgs[i][0]
 *   msgid: string,           // 對應 msgs[i][1]
 *   sysid: string,           // 對應 msgs[i][2]
 *   displayException: string // 對應 msgs[i][6]
 * }
 * ```
 *
 * defineExpose 公開 API：
 * - showMessages(msgs)   — 直接傳入訊息陣列觸發顯示（供 customAxios 攔截器呼叫）
 * - clearMessages()      — 清除目前顯示的訊息
 * - notifyMessage        — 底部訊息欄的當前訊息（ref，供 BaseLayout.vue 綁定至 template）
 */

import { ref, computed } from 'vue'

// ─── 訊息狀態 ────────────────────────────────────────────────────────────────

/** 當前訊息清單，對應 JSP 的 `msgs[]` 陣列 */
const messages = ref([])

/**
 * 底部訊息欄顯示的訊息（取第一筆）
 * 對應 JSP `displayMessage()` 中 `msgs[0]` 的行為
 */
const notifyMessage = computed(() => messages.value[0] ?? null)

// ─── 訊息格式化 ───────────────────────────────────────────────────────────────

/**
 * 依訊息陣列組合 alert 字串
 * 對應 JSP `alertMessages()` 函式邏輯
 *
 * 規則：
 * - displayException 不為空 → 顯示「異常原因 + 程式ID」
 * - returnCode ≠ '0' 且 ≠ '99' → 顯示「訊息說明 + 錯誤編號」
 * - returnCode === '99' → 靜默，不加入 alert
 *
 * @param {Array} msgs
 * @returns {string} 組合後的 alert 字串
 */
function buildAlertString(msgs) {
  let alertMsg = ''

  for (const msg of msgs) {
    const { returnCode, displayMsgDescs, msgid, sysid, displayException } = msg

    if (displayException) {
      alertMsg += `異常原因:${displayException}\n`
      if (sysid) alertMsg += `\n程式ID:${sysid}\n\n`
    } else {
      if (returnCode !== '0' && returnCode !== '99') {
        alertMsg += `訊息說明:\n${displayMsgDescs}\n`
        if (msgid) {
          alertMsg += `\n錯誤編號：\n${msgid}`
        }
      }
    }
  }

  return alertMsg
}

// ─── 公開 API ────────────────────────────────────────────────────────────────

/**
 * 接收訊息陣列並觸發顯示
 * 對應 JSP `displayMessage()` + `alertMessages()` 的組合行為
 * 由 customAxios 攔截器在收到後端回應後呼叫
 *
 * @param {Array} msgs - 訊息陣列，每筆格式見上方 JSDoc
 */
function showMessages(msgs) {
  if (!Array.isArray(msgs) || msgs.length === 0) return

  messages.value = msgs

  const alertMsg = buildAlertString(msgs)
  if (alertMsg) {
    alert(alertMsg)
  }
}

/**
 * 清除當前訊息
 * 對應 JSP `clearBottomMsg()` → `clearNotifyMsg()` 的行為
 * 由 customAxios 攔截器在發送請求前呼叫
 */
function clearMessages() {
  messages.value = []
}

// ─── defineExpose ─────────────────────────────────────────────────────────────

defineExpose({
  /** 顯示訊息，由 customAxios 攔截器呼叫 */
  showMessages,
  /** 清除訊息，由 customAxios 攔截器在請求發送前呼叫 */
  clearMessages,
  /** 底部訊息欄當前訊息（computed），供 BaseLayout.vue template 綁定 */
  notifyMessage,
})
</script>

<template>
  <!--
    msgDisplayer.vue 為無視覺輸出的功能性元件
    底部訊息欄的實際 UI 由 BaseLayout.vue 透過 notifyMessage ref 自行渲染

    BaseLayout.vue 使用範例：
    <MsgDisplayer ref="msgRef" />
    <div class="msg-board">
      <span :class="notifyMessage?.returnCode !== '0' ? 'text-negative' : 'text-primary'">
        訊息：{{ notifyMessage?.displayMsgDescs }}
      </span>
    </div>
  -->
</template>
