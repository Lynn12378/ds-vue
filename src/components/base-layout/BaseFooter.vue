<template>
  <!--
    BaseFooter（底部訊息列）
    還原自 msgDisplayer.jsp：showNotifyMsg / clearNotifyMsg
    returnCode: '0'=成功(positive) | '99'=通知(info) | 其他=錯誤(negative)
  -->
  <q-footer v-if="store.notifyMessage" :class="bgClass">
    <q-toolbar dense>
      <q-icon :name="icon" />
      <q-toolbar-title>
        {{ store.notifyMessage.message }}
      </q-toolbar-title>
      <q-btn @click="store.clearAll()" />
    </q-toolbar>
  </q-footer>
</template>

<script setup>
import { computed } from 'vue'
import { useMessageStore } from '@/stores/messageStore'

const store = useMessageStore()

const bgClass = computed(() => {
  const code = store.notifyMessage?.returnCode ?? '0'
  if (code === '0') return 'bg-positive text-white'
  if (code === '99') return 'bg-info text-white'
  return 'bg-negative text-white'
})

const icon = computed(() => {
  const code = store.notifyMessage?.returnCode ?? '0'
  if (code === '0') return 'check_circle'
  if (code === '99') return 'info'
  return 'error'
})
</script>
