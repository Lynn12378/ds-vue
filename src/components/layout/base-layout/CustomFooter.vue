<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import customAxios from '@/assets/plugins/customAxios.js'

// TODO: 遷移至 Pinia store
const msgs = ref([])

// ── 訊息顯示邏輯（對應 alertMessages）───────────────────────────────────────
const alertMessages = () => {
  let alertMsg = ''

  msgs.value.forEach((msg) => {
    if (msg.displayException === '') {
      // returnCode = 0：不顯示
      // returnCode = 99：靜默模式，不彈窗
      if (msg.returnCode !== '0' && msg.returnCode !== '99') {
        alertMsg += `訊息說明：\n${msg.displayMsgDescs}\n`
        if (msg.msgid) {
          alertMsg += `\n錯誤編號：\n${msg.msgid}`
        }
      }
    } else {
      if (msg.displayException !== '' || msg.sysid !== '') {
        alertMsg += `異常原因：${msg.displayException}\n`
        alertMsg += `\n程式 ID：${msg.sysid}\n\n`
      }
    }
  })

  if (alertMsg !== '') {
    // TODO: 改用 $q.dialog 或 Quasar Notify 取代 alert
    alert(alertMsg)
  }
}

// ── 底部訊息欄（對應 showNotifyMsg）────────────────────────────────────────
// notifyMessage 供 BaseLayout 綁定底部訊息欄 UI
const notifyMessage = computed(() => {
  if (!msgs.value.length) return null
  const first = msgs.value[0]
  if (first.returnCode === '0' || first.returnCode === '99') return null
  return {
    returnCode: first.returnCode,
    returnMessage: first.displayMsgDescs,
  }
})

// ── 公開 API（對應 showMessages / clearMessages）────────────────────────────
const showMessages = (incomingMsgs) => {
  msgs.value = incomingMsgs ?? []
  alertMessages()
}

const clearMessages = () => {
  msgs.value = []
}

// ── customAxios 攔截器整合（請求前自動清除）─────────────────────────────────
// TODO: 在 customAxios 攔截器的 request interceptor 呼叫 clearMessages()
// TODO: 在 customAxios 攔截器的 response interceptor 解析 ReturnMessage 後呼叫 showMessages()

defineExpose({
  showMessages,
  clearMessages,
  notifyMessage,
})
</script>

<template>
  <!-- 底部訊息欄 -->
  <!-- TODO: 確認底部訊息欄 UI 樣式與位置，由 BaseLayout 決定渲染位置 -->
  <div v-if="notifyMessage" class="custom-footer-notify">
    <span>{{ notifyMessage.returnMessage }}</span>
  </div>
</template>

<style scoped>
.custom-footer-notify {
  /* TODO: 對應原始底部訊息欄樣式 */
  padding: 4px 12px;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  font-size: 0.85rem;
}
</style>
