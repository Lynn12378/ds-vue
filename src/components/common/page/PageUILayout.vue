<script setup>
import { computed } from 'vue'

const props = defineProps({
  pageNo: { type: String, default: '' },
  title: { type: String, default: '' },
  subTitle: { type: String, default: '' },
  noPageFrame: { type: Boolean, default: false },
  blocks: { type: Array, default: () => [] },
  fixedNum: { type: Number, default: 0 },
})

const fixedBlocks = computed(() => (props.blocks || []).slice(0, Math.max(0, Number(props.fixedNum || 0))))
const scrollBlocks = computed(() => (props.blocks || []).slice(Math.max(0, Number(props.fixedNum || 0))))

const pageStyle = computed(() => ({ minHeight: '100%', width: '100%' }))
</script>

<template>
  <div class="pageui-wrap" :style="pageStyle">
    <q-card flat bordered class="pageui-card">
      <q-card-section v-if="!noPageFrame" class="pageui-title row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
        <div class="text-caption">{{ pageNo ? `畫面編號：${pageNo}` : '' }}</div>
      </q-card-section>
      <slot />

      <!-- <q-separator v-if="!noPageFrame" />

      <q-card-section class="pageui-content">
        <div class="text-subtitle2 pageui-subtitle">{{ subTitle }}</div>

        <slot />

        <template v-if="blocks.length">
          <div class="pageui-fixed-list">
            <div v-for="block in fixedBlocks" :key="block.id || block.elem" class="pageui-block">
              <div v-if="block.title" class="text-body2 text-weight-medium q-mb-xs">{{ block.title }}</div>
              <component :is="block.component" v-if="block.component" v-bind="block.props || {}" />
            </div>
          </div>

          <div v-if="scrollBlocks.length" class="pageui-scroll-list">
            <div v-for="block in scrollBlocks" :key="block.id || block.elem" class="pageui-block">
              <div v-if="block.title" class="text-body2 text-weight-medium q-mb-xs">{{ block.title }}</div>
              <component :is="block.component" v-if="block.component" v-bind="block.props || {}" />
            </div>
          </div>
        </template>
      </q-card-section> -->
    </q-card>
  </div>
</template>

<style scoped>
.pageui-wrap {
  background: #f3f9d9;
  padding: 8px;
}

.pageui-card {
  background: #ffffff;
}

.pageui-title {
  background: #f0fbc6;
  color: #1f6c3a;
}

.pageui-content {
  padding: 10px;
}

.pageui-subtitle {
  color: #2e6f90;
  margin-bottom: 8px;
}

.pageui-fixed-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.pageui-scroll-list {
  margin-top: 8px;
  max-height: 52vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.pageui-block {
  border: 1px solid #b7d2b7;
  background: #f7ffe8;
  padding: 8px;
}
</style>
