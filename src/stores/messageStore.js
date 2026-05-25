/**
 * messageStore.js
 * 承接 CM/msgDisplayer.jsp 的訊息顯示邏輯
 *
 * 原始 msgDisplayer.jsp 業務規格：
 *
 * [ReturnMessage 欄位]
 *   returnCode / message / msgId / sysId / exception
 *   returnCode='0'  → 正常完成
 *   returnCode='99' → 通知訊息（僅顯示於底部列，不彈窗）
 *   其他            → 錯誤（彈窗顯示「訊息說明 + 錯誤編號」或「異常原因 + 程式ID」）
 *
 * [alertMessages()]
 *   遍歷 msgs[]，exception 有值 → alert 異常原因+程式ID
 *   否則 returnCode ≠ 0 且 ≠ 99 → alert 訊息說明+錯誤編號
 *   原始使用 alert() 或 WIUtil.displayMessage()
 *
 * [displayMessage()]
 *   將 msgs[0] 推送至 bottomFrame 的 showNotifyMsg()（舊版 iframe 架構）
 *   若 bottomFrame 有 txHasRollbackPage=true 則 return 不顯示
 *
 * [clearBottomMsg()]
 *   任何 type="submit" 或 type="button" 的點擊自動清除底部訊息列
 *   新架構：各按鈕 @click 呼叫 clearAll()，或由 router.beforeEach 統一清除
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMessageStore = defineStore('message', () => {
  const messages = ref([])

  const hasErrors = computed(() =>
    messages.value.some((m) => m.returnCode !== '0' && m.returnCode !== '99'),
  )

  const notifyMessage = computed(() => messages.value[0] ?? null)

  function clearAll() {
    messages.value = []
  }

  return { messages, hasErrors, notifyMessage, clearAll }
})
