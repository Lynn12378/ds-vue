<script setup>
import { computed, ref } from 'vue'
import { SimpleDateFormat, addDate, diffDay, toROC, toY2K } from '@/assets/utils/legacy/date.js'

const adDate = ref('2026-05-28')
const rocDate = ref('115-05-28')
const addDays = ref(7)
const startDate = ref('2026-05-01')
const endDate = ref('2026-05-28')

const rocConverted = computed(() => toROC(adDate.value))
const adConverted = computed(() => toY2K(rocDate.value))
const addedDate = computed(() => addDate(adDate.value, 0, 0, Number(addDays.value || 0)))
const dayDiff = computed(() => diffDay(startDate.value, endDate.value, false))
const formattedTwDate = computed(() => {
  const formatter = new SimpleDateFormat('yyy/MM/dd EEEE', 'tw')
  return formatter.format(`${adDate.value} 00:00:00`)
})
</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">date.js 功能示範</div>
        <div class="text-caption text-grey-7 q-mt-xs">來源：jsp_CM/date.js</div>
        <div class="text-body2 q-mt-sm">驗收重點：ROC/AD 轉換、日期加減、日期差、SimpleDateFormat。</div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-5">
        <q-card flat bordered>
          <q-card-section class="q-gutter-sm">
            <q-input v-model="adDate" label="AD 日期（yyyy-MM-dd）" />
            <q-input v-model="rocDate" label="ROC 日期（yyy-MM-dd）" />
            <q-input v-model.number="addDays" type="number" label="加減天數" />
            <q-input v-model="startDate" label="起日（yyyy-MM-dd）" />
            <q-input v-model="endDate" label="迄日（yyyy-MM-dd）" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-7">
        <q-card flat bordered>
          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>toROC</q-item-label>
                <q-item-label caption>{{ adDate }} -> {{ rocConverted }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>toY2K</q-item-label>
                <q-item-label caption>{{ rocDate }} -> {{ adConverted }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>addDate</q-item-label>
                <q-item-label caption>{{ adDate }} + {{ addDays }} 天 -> {{ addedDate }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>diffDay</q-item-label>
                <q-item-label caption>{{ startDate }} 到 {{ endDate }} = {{ dayDiff }} 天</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>SimpleDateFormat</q-item-label>
                <q-item-label caption>{{ formattedTwDate }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </div>
</template>