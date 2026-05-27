<script setup>
import { computed, ref } from 'vue'
import {
  buildBarcodeUrl,
  buildReportParameterEntries,
  extractLegacyErrorMessage,
  resolveReportWebName,
} from '@/assets/utils/common.js'

const locationHref = ref('https://host/app/EGWeb/ZZM0_0105')
const pageIds = ref('ZZM0_0105,ZZM0_0106')
const rptParams = ref('FUNC_ID=ZZM0_0105,FUNC_ID=ZZM0_0106')
const rptDetails = ref('SUMMARY,DETAIL')
const barcodeValue = ref('A123456789')
const errorMessageInput = ref('第一行錯誤\n第二行錯誤')

const reportWebName = computed(() => resolveReportWebName(locationHref.value))

const reportEntries = computed(() => {
  const pageIdList = pageIds.value.split(',').map(item => item.trim()).filter(Boolean)
  const rptParamList = rptParams.value.split(',').map(item => item.trim()).filter(Boolean)
  const rptDetailList = rptDetails.value.split(',').map(item => item.trim()).filter(Boolean)

  return buildReportParameterEntries({
    pageIds: pageIdList,
    rptParams: rptParamList,
    rptDetails: rptDetailList,
    submitParam: {
      requestTime: Date.now(),
      source: 'rpt-util-demo',
    }
  })
})

const barcodeUrl = computed(() =>
  buildBarcodeUrl(
    {
      value: barcodeValue.value,
      width: 2,
      height: 30,
      rotate: false,
    },
    reportWebName.value.webName,
  )
)

const legacyErrorMessage = computed(() =>
  extractLegacyErrorMessage({
    ErrMsg: {
      displayMsgDescs: errorMessageInput.value,
    }
  })
)
</script>

<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-h6">RPTUtil.js 功能示範</div>
        <div class="text-caption text-grey-7 q-mt-xs">來源：jsp_CM/RPTUtil.js</div>
        <div class="text-body2 q-mt-sm">
          驗收重點：webName 推導、報表 hidden 參數組裝、legacy 錯誤訊息解析、條碼 URL。
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered>
          <q-card-section class="q-gutter-sm">
            <q-input v-model="locationHref" label="目前網址（location.href）" />
            <q-input v-model="pageIds" label="pageIds（逗號分隔）" />
            <q-input v-model="rptParams" label="rptParams（逗號分隔）" />
            <q-input v-model="rptDetails" label="rptDetails（逗號分隔）" />
            <q-input v-model="barcodeValue" label="條碼值" />
            <q-input v-model="errorMessageInput" type="textarea" autogrow label="legacy 錯誤訊息（多行）" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="text-subtitle2">resolveReportWebName 結果</q-card-section>
          <q-card-section>
            <pre class="text-body2">{{ JSON.stringify(reportWebName, null, 2) }}</pre>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="text-subtitle2">buildReportParameterEntries 結果</q-card-section>
          <q-card-section>
            <pre class="text-body2">{{ JSON.stringify(reportEntries, null, 2) }}</pre>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="text-subtitle2">buildBarcodeUrl 結果</q-card-section>
          <q-card-section class="text-body2 q-gutter-sm">
            <div>{{ barcodeUrl }}</div>
            <div class="text-subtitle2">extractLegacyErrorMessage 結果</div>
            <div>{{ legacyErrorMessage }}</div>
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