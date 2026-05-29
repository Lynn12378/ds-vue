<script setup>
import { ref } from 'vue'
import CustomHeader from '@/components/layout/base-layout/CustomHeader.vue'
import CustomFooter from '@/components/layout/base-layout/CustomFooter.vue'

const customHeaderRef = ref(null)
const customFooterRef = ref(null)
</script>

<template>
  <div class="base-layout">

    <!-- 資安管控、浮水印（無視覺輸出） -->
    <CustomHeader ref="customHeaderRef" />

    <!-- 頁面內容 -->
    <main class="base-layout__main">
      <slot></slot>
    </main>

    <!-- 底部訊息欄 -->
    <footer class="base-layout__footer">
      <CustomFooter ref="customFooterRef" />
    </footer>

  </div>
</template>

<style scoped>
.base-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.base-layout__main {
  flex: 1;
}

.base-layout__footer {
  /* TODO: 對應原始底部版面樣式 */
}
</style>