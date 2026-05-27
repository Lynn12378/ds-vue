<script setup>
import { ref, watch, provide } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import MsgDisplayer from '@/components/layout/MsgDisplayer.vue'

// ─── Refs ────────────────────────────────────────────────────────────────────

const headerRef = ref(null)
const msgRef    = ref(null)

// ─── Route 監聽：路由切換時觸發 Header 功能代碼套用 ────────────────────────

const route = useRoute()

watch(
  () => route.path,
  () => {
    // funcId 由後端約定從 route.meta 或 route.params 取得
    // meta.funcId 需在 router 定義時設定
    const funcId = route.meta?.funcId ?? ''
    headerRef.value?.applyByFuncId(funcId)
  }
)

// ─── provide：讓子頁面可注入控制權 ──────────────────────────────────────────

/**
 * 子頁面取用：
 *   const headerRef  = inject('headerRef')
 *   const msgRef     = inject('msgRef')
 *
 * 一般翻新頁面不需要注入，customAxios 攔截器直接呼叫 msgRef 即可。
 */
provide('headerRef', headerRef)
provide('msgRef',    msgRef)
</script>

<template>
  <!-- 功能性元件：無視覺輸出 -->
  <Header ref="headerRef" />
  <MsgDisplayer ref="msgRef" />

  <!-- 頁面主體 -->
  <router-view />

  <!-- 底部訊息欄 -->
  <div
    v-if="msgRef?.notifyMessage"
    class="base-layout__msg-bar"
  >
    <span
      :class="msgRef.notifyMessage.returnCode !== '0'
        ? 'text-negative'
        : 'text-positive'"
    >
      {{ msgRef.notifyMessage.displayMsgDescs }}
    </span>
  </div>
</template>

<style scoped>
.base-layout__msg-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 16px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  font-size: 13px;
  z-index: 100;
}
</style>
