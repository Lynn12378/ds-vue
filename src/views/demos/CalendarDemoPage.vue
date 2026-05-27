<script setup>
import { computed, ref } from 'vue'
import {
  getHolidayCodeState,
  isHoliday,
  resetHolidayCodes,
  setHolidayCodes,
} from '@/assets/utils/legacy/date.js'

const holidayCode = ref('940101')
const customCodes = ref('1150101,1150210,1150228')
const holidayState = ref(getHolidayCodeState())

const isHolidayResult = computed(() => isHoliday(holidayCode.value))

const applyCustomCodes = () => {
  const codes = customCodes.value.split(',').map(item => item.trim()).filter(Boolean)
  setHolidayCodes(codes, {
    replace: true,
    source: 'calendar-demo',
  })
  holidayState.value = getHolidayCodeState()
}

const restoreLegacyCodes = () => {
  resetHolidayCodes()
  holidayState.value = getHolidayCodeState()
}
</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">calendar.js 功能示範</div>
        <div class="text-caption text-grey-7 q-mt-xs">來源：jsp_CM/calendar.js</div>
        <div class="text-body2 q-mt-sm">驗收重點：假日代碼注入、重置、isHoliday 判斷。</div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered>
          <q-card-section class="q-gutter-sm">
            <q-input v-model="holidayCode" label="查詢代碼 (ROC yyyMMdd)" />
            <q-input v-model="customCodes" type="textarea" autogrow label="自訂假日代碼（逗號分隔）" />
            <q-btn color="primary" no-caps label="套用自訂假日代碼" @click="applyCustomCodes" />
            <q-btn outline color="primary" no-caps label="還原 legacy 預設假日碼" @click="restoreLegacyCodes" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="text-subtitle2">isHoliday 結果</q-card-section>
          <q-card-section>
            <q-badge :color="isHolidayResult ? 'positive' : 'grey-7'" class="text-body2">
              {{ holidayCode }} -> {{ isHolidayResult ? '假日' : '非假日' }}
            </q-badge>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="text-subtitle2">假日碼狀態</q-card-section>
          <q-card-section>
            <pre class="text-body2">{{ JSON.stringify(holidayState, null, 2) }}</pre>
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