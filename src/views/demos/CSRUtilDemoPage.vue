<script setup>
import { computed, ref } from 'vue'
import CSRUtil from '@/assets/utils/legacy/CSRUtil.js'

const numberInput = ref('1234567.8912')
const patternInput = ref('#,###.##')
const adDateInput = ref('2026-05-28')
const idInput = ref('A123456789')

const formatResult = computed(() => CSRUtil.$fmt(numberInput.value, patternInput.value, false))
const rocInputResult = computed(() => CSRUtil.toInputROC(adDateInput.value, '/'))
const maskResult = computed(() => CSRUtil.maskHandler.getMaskID(idInput.value, 3))
</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">CSRUtil.js 功能示範</div>
        <div class="text-caption text-grey-7 q-mt-xs">來源：jsp_CM/CSRUtil.js</div>
        <div class="text-body2 q-mt-sm">驗收重點：$fmt、toInputROC、maskHandler。</div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered>
          <q-card-section class="q-gutter-sm">
            <q-input v-model="numberInput" label="數值輸入" />
            <q-input v-model="patternInput" label="格式樣板" />
            <q-input v-model="adDateInput" label="AD 日期（yyyy-MM-dd）" />
            <q-input v-model="idInput" label="身分證字號" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card flat bordered>
          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>$fmt</q-item-label>
                <q-item-label caption>{{ numberInput }} -> {{ formatResult }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>toInputROC</q-item-label>
                <q-item-label caption>{{ adDateInput }} -> {{ rocInputResult }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>maskHandler.getMaskID</q-item-label>
                <q-item-label caption>{{ idInput }} -> {{ maskResult }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </div>
</template>