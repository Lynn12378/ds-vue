<template>
    <q-layout view="hHh lpR fFf" class="base-layout">
        <q-header elevated class="bg-primary text-white">
            <q-toolbar>
                <q-toolbar-title class="text-weight-bold">{{ currentPageLabel }}</q-toolbar-title>
            </q-toolbar>

            <div
                v-if="contextItems.length > 0 || activeSecurityFlags.length > 0"
                class="base-layout__context row items-center q-col-gutter-sm q-px-md q-pb-sm"
            >
                <div class="col-auto" v-for="item in contextItems" :key="item.label">
                    <q-chip dense square color="white" text-color="primary">
                        {{ item.label }}：{{ item.value }}
                    </q-chip>
                </div>
                <div class="col-grow" />
                <div class="col-auto" v-for="flag in activeSecurityFlags" :key="flag">
                    <q-chip dense square color="warning" text-color="black">{{ flag }}</q-chip>
                </div>
            </div>
        </q-header>

        <q-page-container>
            <section v-if="messages.length > 0" class="q-pt-md q-px-md">
                <q-card flat bordered>
                    <q-card-section class="row items-center q-py-sm">
                        <div class="text-subtitle2">系統訊息</div>
                        <q-space />
                        <q-btn flat dense no-caps color="primary" label="清除訊息" @click="clearMessages" />
                    </q-card-section>
                    <CustomMessageBanner :messages="messages" />
                </q-card>
            </section>

            <section class="q-px-md q-pb-md base-layout__content">
                <RouterView />
            </section>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import CustomMessageBanner from '@/components/common/message-banner/CustomMessageBanner.vue'
import { useUiStateStore } from '@/stores/uiStateStore.js'

const $q = useQuasar()
const route = useRoute()
const uiStateStore = useUiStateStore()
const { authContext, messages, securityPolicy } = storeToRefs(uiStateStore)

const handledMessageKeys = new Set()

/**
 * 取得頁面標題文字。
 * @returns {string} 目前頁面名稱。
 */
const currentPageLabel = computed(() => {
    if (typeof route.meta?.title === 'string' && route.meta.title.trim() !== '') {
        return route.meta.title
    }

    if (typeof route.name === 'string' && route.name !== '') {
        return route.name
    }

    return route.path
})

/**
 * 取得可顯示的上下文欄位。
 * @returns {Array<{label:string,value:string}>} 欄位清單。
 */
const contextItems = computed(() => {
    const source = authContext.value || {}
    const items = [
        { label: '平台', value: source.platformInfo },
        { label: '系統', value: source.systemInfo },
        { label: '身份', value: source.userFlag },
        { label: '派送者', value: source.dispatcher },
    ]

    return items.filter((item) => item.value !== null && item.value !== undefined && String(item.value).trim() !== '')
})

/**
 * 取得啟用中的資安旗標。
 * @returns {Array<string>} 旗標清單。
 */
const activeSecurityFlags = computed(() => {
    const policy = securityPolicy.value || {}
    const flags = []

    if (policy.disablePrint === true) {
        flags.push('禁列印')
    }
    if (policy.disableCopy === true) {
        flags.push('禁複製')
    }
    if (policy.disableContextMenu === true) {
        flags.push('禁右鍵')
    }
    if (policy.disableSave === true) {
        flags.push('禁儲存')
    }
    if (policy.disableSelectAll === true) {
        flags.push('禁全選')
    }
    if (policy.enableWatermark === true) {
        flags.push('浮水印')
    }

    return flags
})

/**
 * 建立訊息唯一鍵，避免重複 toast/dialog。
 * @param {Record<string, any>} message 訊息物件。
 * @returns {string} 唯一鍵。
 */
function buildMessageKey(message) {
    return `${message?.createdAt || ''}-${message?.requestId || ''}-${message?.message || ''}`
}

/**
 * 依訊息等級回傳 notify 顏色。
 * @param {string} level 訊息等級。
 * @returns {string} Quasar notify 顏色。
 */
function resolveNotifyColor(level) {
    if (level === 'error') {
        return 'negative'
    }

    if (level === 'warning') {
        return 'warning'
    }

    if (level === 'success') {
        return 'positive'
    }

    return 'info'
}

/**
 * 將訊息內容送到全域 toast/dialog。
 * @param {Record<string, any>} message 訊息物件。
 * @returns {void} 執行結果。
 */
function dispatchGlobalMessage(message) {
  const key = buildMessageKey(message)
  if (handledMessageKeys.has(key)) {
    return
  }

  handledMessageKeys.add(key)

  const detailText = typeof message?.detail === 'string' && message.detail.trim() !== ''
    ? `\n\n${message.detail}`
    : ''

  if (message?.channel === 'dialog') {
    $q.dialog({
      title: message?.level === 'error' ? '系統訊息（錯誤）' : '系統訊息',
      message: `${message?.message || ''}${detailText}`,
      ok: {
        label: '確定',
        color: 'primary'
      }
    })
    return
  }

  $q.notify({
    type: resolveNotifyColor(message?.level),
    message: message?.message || '系統訊息',
    timeout: message?.level === 'error' ? 4500 : 2500,
    multiLine: true
  })
}

/**
 * 清空訊息佇列與本地去重索引。
 * @returns {void} 執行結果。
 */
function clearMessages() {
    uiStateStore.clearMessages()
    handledMessageKeys.clear()
}

watch(
    () => messages.value[messages.value.length - 1],
    (message) => {
        if (!message) {
            return
        }

        dispatchGlobalMessage(message)
    }
)
</script>

<style scoped>
.base-layout__content {
    min-height: calc(100vh - 120px);
}
</style>