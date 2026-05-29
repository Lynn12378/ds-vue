<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import customAxios from '@/assets/plugins/customAxios.js'

// TODO: 遷移至 Pinia store
const pdCtrl     = ref(false)
const isWatermark = ref(false)
const watermarkText = ref('')
const watermarkDatetime = ref('')

const route = useRoute()

// ── 功能代碼查詢 ────────────────────────────────────────────────────────────
// FIXME: Server-side 資料來源待確認（ZZ_Z0Z001.getFuncInfo）
const fetchFuncInfo = async (funcId) => {
  if (!funcId) return
  const resp = await customAxios.get(`ZZ_Z0Z001/getFuncInfo`, { params: { funcId } })
  pdCtrl.value      = resp.PD_CTRL === 'Y'
  isWatermark.value = resp.IS_WATERMARK === 'Y'
  // FIXME: 使用者姓名來源待確認（Session UserObject.CATHAY_NO / empName）
  watermarkText.value     = resp.userName ?? ''
  watermarkDatetime.value = new Date().toLocaleString('zh-TW')
}

// ── 功能代碼推導 ─────────────────────────────────────────────────────────────
// FIXME: funcId 推導規則待確認（Bean Name / 路由名稱）
const resolveFuncId = (route) => route.name ?? ''

// ── 資安管控（功能 4、5）────────────────────────────────────────────────────
// TODO: 拆至 composable useSecurityPolicy
const applySecurityPolicy = (enabled) => {
  if (enabled) {
    // TODO: 動態注入事件攔截（禁止列印、複製、剪下、全選、另存）
    // TODO: 複製行為稽核 → customAxios.post('/ZZM0_0105/ctrlMsavelog', ...)
  } else {
    // TODO: 解除事件攔截
  }
}

// ── 浮水印（功能 7）─────────────────────────────────────────────────────────
// TODO: 拆至 composable useWatermark
let watermarkInstance = null
const applyWatermark = (enabled) => {
  if (enabled) {
    // TODO: new WatermarkPlus({ content: watermarkText + '\n' + watermarkDatetime, ... }).create()
    // TODO: watermarkInstance = ...
  } else {
    watermarkInstance?.destroy()
    watermarkInstance = null
  }
}

// ── 套用 ────────────────────────────────────────────────────────────────────
const apply = async () => {
  const funcId = resolveFuncId(route)
  await fetchFuncInfo(funcId)
  applySecurityPolicy(pdCtrl.value)
  applyWatermark(isWatermark.value)
}

watch(() => route.name, apply)
onMounted(apply)
onBeforeUnmount(() => {
  applySecurityPolicy(false)
  applyWatermark(false)
})

// ── defineExpose ─────────────────────────────────────────────────────────────
defineExpose({
  /** 依功能代碼手動套用資安管控與浮水印（一般翻新不需呼叫） */
  applyByFuncId: async (funcId) => {
    await fetchFuncInfo(funcId)
    applySecurityPolicy(pdCtrl.value)
    applyWatermark(isWatermark.value)
  },
  enablePdCtrl:      () => applySecurityPolicy(true),
  disablePdCtrl:     () => applySecurityPolicy(false),
  enableWatermark:   () => applyWatermark(true),
  disableWatermark:  () => applyWatermark(false),
})
</script>

<template>
  <!-- CustomHeader 無視覺輸出，由 BaseLayout 自動載入 -->
</template>
