<script setup>
import { computed, ref } from 'vue'
import {
  checkID,
  checkROCARC,
  checkROCID,
  checkROCPassport,
  isDateRangeValid,
  isEmail,
  isRocDate,
} from '@/assets/utils/validator.js'

const rocDateInput = ref('1150528')
const emailInput = ref('user@example.com')
const rocIdInput = ref('A123456789')
const arcInput = ref('A800000014')
const passportInput = ref('AB1234567')
const genericIdInput = ref('A123456789')
const startDate = ref('2026-05-01')
const endDate = ref('2026-05-28')

const emailResult = computed(() => isEmail(emailInput.value))
const rocDateResult = computed(() => isRocDate(rocDateInput.value))
const rocIdResult = computed(() => checkROCID(rocIdInput.value))
const arcResult = computed(() => checkROCARC(arcInput.value))
const passportResult = computed(() => checkROCPassport(passportInput.value))
const idResult = computed(() => checkID(genericIdInput.value))
const dateRangeResult = computed(() => isDateRangeValid(startDate.value, endDate.value, false))
</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">validation.js 功能示範</div>
        <div class="text-caption text-grey-7 q-mt-xs">來源：jsp_CM/validation.js</div>
        <div class="text-body2 q-mt-sm">
          驗收重點：isRocDate、isEmail、checkROCID/checkROCARC/checkROCPassport、checkID、isDateRangeValid。
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered>
          <q-card-section class="q-gutter-sm">
            <q-input v-model="rocDateInput" label="ROC 日期（validator.isRocDate）" />
            <q-input v-model="emailInput" label="Email（validator.isEmail）" />
            <q-input v-model="rocIdInput" label="身分證字號（validator.checkROCID）" />
            <q-input v-model="arcInput" label="居留證號（validator.checkROCARC）" />
            <q-input v-model="passportInput" label="護照號碼（validator.checkROCPassport）" />
            <q-input v-model="genericIdInput" label="通用證件（validator.checkID）" />
            <q-input v-model="startDate" label="起日（yyyy-MM-dd）" />
            <q-input v-model="endDate" label="迄日（yyyy-MM-dd）" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card flat bordered>
          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>isRocDate</q-item-label>
                <q-item-label caption>{{ rocDateInput }} -> {{ rocDateResult }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>isEmail</q-item-label>
                <q-item-label caption>{{ emailInput }} -> {{ emailResult }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>checkROCID</q-item-label>
                <q-item-label caption>{{ rocIdInput }} -> {{ rocIdResult }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>checkROCARC</q-item-label>
                <q-item-label caption>{{ arcInput }} -> {{ arcResult }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>checkROCPassport</q-item-label>
                <q-item-label caption>{{ passportInput }} -> {{ passportResult }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>checkID</q-item-label>
                <q-item-label caption>{{ genericIdInput }} -> {{ idResult }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>isDateRangeValid</q-item-label>
                <q-item-label caption>{{ startDate }} ~ {{ endDate }} -> {{ dateRangeResult }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </div>
</template>