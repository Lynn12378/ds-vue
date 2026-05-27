<script setup>
import { computed, ref } from 'vue'
import utility from '@/assets/utils/legacy/utility.js'

const moneyInput = ref('1234567.8')
const dateInput = ref('1150528')
const timeInput = ref('09:15:32')
const spaceInput = ref('A　B　C')
const prefixInput = ref('123')

const moneyOutput = computed(() => utility.MoneyFormat(moneyInput.value))
const dateOutput = computed(() => utility.DateFormat(dateInput.value))
const timeOutput = computed(() => utility.timeForTextfield(timeInput.value))
const replaceSpaceOutput = computed(() => utility.replaceFullSpace(spaceInput.value))
const prefixOutput = computed(() => utility.addPrefix(prefixInput.value, 8, '0'))
</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">utility.js 功能示範</div>
        <div class="text-caption text-grey-7 q-mt-xs">來源：jsp_CM/utility.js</div>
        <div class="text-body2 q-mt-sm">驗收重點：MoneyFormat、DateFormat、timeForTextfield、replaceFullSpace、addPrefix。</div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered>
          <q-card-section class="q-gutter-sm">
            <q-input v-model="moneyInput" label="金額輸入" />
            <q-input v-model="dateInput" label="日期輸入（ROC yyyMMdd）" />
            <q-input v-model="timeInput" label="時間輸入（hh:mm:ss）" />
            <q-input v-model="spaceInput" label="全形空白字串" />
            <q-input v-model="prefixInput" label="補碼輸入" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card flat bordered>
          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>MoneyFormat</q-item-label>
                <q-item-label caption>{{ moneyInput }} -> {{ moneyOutput }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>DateFormat</q-item-label>
                <q-item-label caption>{{ dateInput }} -> {{ dateOutput }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>timeForTextfield</q-item-label>
                <q-item-label caption>{{ timeInput }} -> {{ timeOutput }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>replaceFullSpace</q-item-label>
                <q-item-label caption>{{ spaceInput }} -> {{ replaceSpaceOutput }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>addPrefix</q-item-label>
                <q-item-label caption>{{ prefixInput }} -> {{ prefixOutput }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </div>
</template>