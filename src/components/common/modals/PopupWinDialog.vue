<script setup>
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  src: { type: String, default: '' },
  title: { type: String, default: '' },
  fullPopup: { type: Boolean, default: false },
  width: { type: [Number, String], default: 0.9 },
  height: { type: [Number, String], default: 0.8 },
  parameters: { type: Object, default: () => ({}) },
  scrolling: { type: [Boolean, String], default: true },
  closeBtn: { type: Boolean, default: true },
  closeConfirm: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'back', 'close'])

const iframeRef = ref(null)
const iframeName = `popupwin_${Date.now()}`

const normalizedScrolling = computed(() => {
  if (typeof props.scrolling === 'string') {
    return !/^no|false$/i.test(props.scrolling)
  }
  return !!props.scrolling
})

const cardStyle = computed(() => {
  if (props.fullPopup) {
    return { width: '100vw', height: '100vh', maxWidth: '100vw', maxHeight: '100vh' }
  }

  const toCssSize = (value, fallback) => {
    if (typeof value === 'number') {
      if (value > 0 && value <= 1) {
        return `${Math.round(value * 100)}vw`
      }
      return `${Math.round(value)}px`
    }
    if (typeof value === 'string') {
      if (/^\d+(\.\d+)?%$/.test(value) || /^\d+(\.\d+)?(px|vw|vh)$/.test(value)) {
        return value
      }
      if (/^\d+(\.\d+)?$/.test(value)) {
        return `${value}px`
      }
    }
    return fallback
  }

  return {
    width: toCssSize(props.width, '90vw'),
    height: toCssSize(props.height, '80vh'),
    maxWidth: '95vw',
    maxHeight: '95vh',
  }
})

function tryBindIframeApi() {
  const iframe = iframeRef.value
  if (!iframe) return

  try {
    const w = iframe.contentWindow
    if (!w) return

    w.isPopupWin = true
    w.popupWinclose = () => handleClose()
    w.close = () => handleClose()
    w.popupWinBack = (...args) => {
      emit('back', ...args)
      handleClose()
    }
  } catch (_err) {
    // Cross-origin iframe cannot be injected; keep silent for compatibility.
  }
}

function submitToIframe() {
  const iframe = iframeRef.value
  if (!iframe || !props.src) return

  const form = document.createElement('form')
  form.method = 'post'
  form.action = props.src
  form.target = iframeName
  form.style.display = 'none'

  Object.entries(props.parameters || {}).forEach(([key, value]) => {
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

async function openIframe() {
  await nextTick()
  submitToIframe()
}

function handleClose() {
  if (props.closeConfirm && typeof props.closeConfirm.msg === 'string') {
    const assignConfirmType = props.closeConfirm.assignConfirmType !== false
    const ok = window.confirm(props.closeConfirm.msg)
    if (ok !== assignConfirmType) {
      return
    }
  }
  emit('update:modelValue', false)
  emit('close')
}

function onDialogHide() {
  emit('close')
}

watch(
  () => props.modelValue,
  (opened) => {
    if (opened) {
      openIframe()
    }
  },
)
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    :maximized="fullPopup"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @hide="onDialogHide"
  >
    <q-card class="popupwin-card" :style="cardStyle">
      <q-card-section class="row items-center q-pb-sm popupwin-header">
        <div class="text-subtitle1 ellipsis">{{ title || ' ' }}</div>
        <q-space />
        <q-btn
          v-if="closeBtn"
          dense
          flat
          round
          icon="close"
          @click="handleClose"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="popupwin-body q-pa-none">
        <iframe
          ref="iframeRef"
          :name="iframeName"
          :title="title || 'popup-window'"
          class="popupwin-iframe"
          :scrolling="normalizedScrolling ? 'auto' : 'no'"
          @load="tryBindIframeApi"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.popupwin-card {
  display: flex;
  flex-direction: column;
}

.popupwin-header {
  min-height: 44px;
}

.popupwin-body {
  flex: 1;
  min-height: 180px;
}

.popupwin-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
