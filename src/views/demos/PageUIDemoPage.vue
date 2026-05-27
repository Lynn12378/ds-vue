<script setup>
import { computed, ref } from 'vue'
import {
  buildDefaultColumnProps,
  resolveButtonDisabledMap,
  resolveContentMode,
} from '@/assets/utils/common.js'

const noHeader = ref(false)
const noContent = ref(false)
const headerInTop = ref(false)
const tableColumnCount = ref(2)
const enableArray = ref('query,export')

const contentMode = computed(() =>
  resolveContentMode({
    noHeader: noHeader.value,
    noContent: noContent.value,
    headerInTop: headerInTop.value,
  })
)

const defaultColumnProps = computed(() =>
  buildDefaultColumnProps(tableColumnCount.value, contentMode.value.doubleColSpan)
)

const disabledMap = computed(() =>
  resolveButtonDisabledMap(
    ['query', 'submit', 'reset', 'export'],
    enableArray.value,
    {}
  )
)
</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">PageUI.js 功能示範</div>
        <div class="text-caption text-grey-7 q-mt-xs">來源：jsp_CM/PageUI.js</div>
        <div class="text-body2 q-mt-sm">
          驗收重點：內容模式推導、預設欄寬規則、按鈕 enable/disable 規則。
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered>
          <q-card-section class="text-subtitle2">輸入條件</q-card-section>
          <q-card-section class="q-gutter-sm">
            <q-toggle v-model="noHeader" label="noHeader" />
            <q-toggle v-model="noContent" label="noContent" />
            <q-toggle v-model="headerInTop" label="headerInTop" />
            <q-input v-model.number="tableColumnCount" type="number" label="欄數 colsInTable" min="1" />
            <q-input v-model="enableArray" label="enableArray（逗號分隔）" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="text-subtitle2">resolveContentMode</q-card-section>
          <q-card-section>
            <pre class="text-body2">{{ JSON.stringify(contentMode, null, 2) }}</pre>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="text-subtitle2">buildDefaultColumnProps</q-card-section>
          <q-card-section>
            <pre class="text-body2">{{ JSON.stringify(defaultColumnProps, null, 2) }}</pre>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="text-subtitle2">resolveButtonDisabledMap</q-card-section>
          <q-card-section>
            <pre class="text-body2">{{ JSON.stringify(disabledMap, null, 2) }}</pre>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
pre {
  margin: 0;
  white-space: pre-wrap;
}
</style>