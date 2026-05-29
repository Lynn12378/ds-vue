<script setup>
import { computed, nextTick, onMounted, ref, useSlots } from 'vue'
import { useQuasar } from 'quasar'
import { useForm, useField } from 'vee-validate'
import { object, string } from 'yup'
import customAxios from '@/assets/libs/customAxios/index.js'
import { isSuccess, $fmt } from '@/assets/utils/CSRUtil.js'
import { addDate, isROCdate, toROC, toY2K } from '@/assets/utils/date.js'
import CustomDate from '@/components/common/custom-date/CustomDate.js'
import CustomTable from '@/components/common/custom-table/CustomTable.js'

const $q = useQuasar()

// FIXME: Server-side 資料來源待確認
const dispatcher = ref('')
// FIXME: Server-side 資料來源待確認
const imageBase = ref('')
// FIXME: Server-side 資料來源待確認
const DIV_NO_CENTER_List = ref([])

const SRV_DEPT_List = ref([])
const rows = ref([])
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: null,
  descending: false,
})

const formSchema = object({
  DUE_DATE_STR: string(),
  DUE_DATE_END: string(),
  DIV_NO_CENTER: string(),
  SRV_DEPT: string(),
  gridJSON: string(),
})

const { errors } = useForm({
  validationSchema: formSchema,
  initialValues: {
    DUE_DATE_STR: '',
    DUE_DATE_END: '',
    DIV_NO_CENTER: '',
    SRV_DEPT: '',
    gridJSON: '',
  },
  validateOnMount: false,
})

const { value: DUE_DATE_STR } = useField('DUE_DATE_STR')
const { value: DUE_DATE_END } = useField('DUE_DATE_END')
const { value: DIV_NO_CENTER } = useField('DIV_NO_CENTER')
const { value: SRV_DEPT } = useField('SRV_DEPT')
const { value: gridJSON } = useField('gridJSON')

const divNoCenterOptions = computed(() => {
  const base = [{ CODE: '', CODE_NM: '全部' }]
  return base.concat(DIV_NO_CENTER_List.value || [])
})

const srvDeptOptions = computed(() => {
  const base = [{ CODE: '', CODE_NM: '全部' }]
  return base.concat(SRV_DEPT_List.value || [])
})

const gridColumns = [
  { name: 'LOAN_ID', label: '貸款帳號', field: 'LOAN_ID', align: 'left', sortable: true },
  { name: 'REFER_ID', label: '原貸帳號', field: 'REFER_ID', align: 'left', sortable: true },
  { name: 'BORROW_NAME', label: '借款人', field: 'BORROW_NAME', align: 'left', sortable: true },
  {
    name: 'REMAIN_AMT',
    label: '本金餘額',
    field: 'REMAIN_AMT',
    align: 'right',
    sortable: true,
    sort: (a, b) => Number(String(a ?? '').replace(/,/g, '')) - Number(String(b ?? '').replace(/,/g, '')),
    format: (val) => $fmt(val, '#,##0.##'),
  },
  {
    name: 'NEXT_PAYDT',
    label: '下次應繳日',
    field: 'NEXT_PAYDT',
    align: 'left',
    sortable: true,
    format: (val) => toROC(String(val || '')),
  },
  {
    name: 'MAX_DUE_DATE',
    label: '約定繳款日',
    field: 'MAX_DUE_DATE',
    align: 'left',
    sortable: true,
    format: (val) => toROC(String(val || '')),
  },
  {
    name: 'INPUT_DATE',
    label: '催收日期',
    field: 'INPUT_DATE',
    align: 'left',
    sortable: true,
    format: (val) => toROC(String(val || '')),
  },
  { name: 'EMP_NAME', label: '催收人員', field: 'EMP_NAME', align: 'left', sortable: true },
  { name: 'DIV_NO_CENTER_NAME', label: '區域', field: 'DIV_NO_CENTER_NAME', align: 'left', sortable: true },
  { name: 'SRV_DEPT_NAME1', label: '服務中心一', field: 'SRV_DEPT_NAME1', align: 'left', sortable: true },
  { name: 'SRV_DEPT_NAME23', label: '服務中心二三', field: 'SRV_DEPT_NAME23', align: 'left', sortable: true },
  { name: 'PAID_TIMES', label: '已繳期數', field: 'PAID_TIMES', align: 'left', sortable: true },
]

const normalizeResp = (resp) => resp?.data ?? resp

const serializeForm = () => ({
  DUE_DATE_STR: DUE_DATE_STR.value,
  DUE_DATE_END: DUE_DATE_END.value,
  DIV_NO_CENTER: DIV_NO_CENTER.value,
  SRV_DEPT: SRV_DEPT.value,
  gridJSON: gridJSON.value,
})

const ajaxPost = async (actionName, payload) => {
  const prefix = dispatcher.value || ''
  const url = `${prefix}/DSD1_0100/${actionName}`
  const resp = await customAxios.post(url, payload)
  return normalizeResp(resp)
}

const checkDateArea = (strValue, endValue, msg, type) => {
  const strObjIsInput = strValue !== ''
  const endObjIsInput = endValue !== ''

  if (strObjIsInput && endObjIsInput) {
    if (type === 1) {
      if (Number(endValue) - Number(strValue) >= 0) {
        return ''
      }
    } else {
      const minday = toROC(addDate(toY2K(endValue), 0, -3, 0))
      if (Number(strValue) - Number(minday) >= 0) {
        return ''
      }
    }
    return msg
  }
  return ''
}

const checkDateInput = (strAValue, endAValue, msg) => {
  const strAObjIsInput = strAValue !== ''
  const endAObjIsInput = endAValue !== ''
  let msg1 = ''

  if (strAObjIsInput && !isROCdate(strAValue)) {
    msg1 += '\n 約定繳款日起日格式有誤'
  }
  if (endAObjIsInput && !isROCdate(endAValue)) {
    msg1 += '\n 約定繳款日訖日格式有誤'
  }
  if (msg1 !== '') {
    return msg1
  }
  if (strAObjIsInput && endAObjIsInput) {
    return ''
  }
  return msg
}

const parseEUDCAfterRender = async () => {
  await nextTick()
  const { parseEUDC } = useParseEUDC()
  parseEUDC('ap')
}

const query = async () => {
  let msg = checkDateInput(DUE_DATE_STR.value, DUE_DATE_END.value, '\n 約定繳款日(起日)、約定繳款日(迄日)皆為必需輸入欄位')
  if (msg !== '') {
    $q.dialog({ message: msg })
    return
  }

  msg += checkDateArea(DUE_DATE_STR.value, DUE_DATE_END.value, '\n 約定繳款日(起)需小於等於約定繳款日(迄)', 1)
  if (msg !== '') {
    $q.dialog({ message: msg })
    return
  }

  msg += checkDateArea(DUE_DATE_STR.value, DUE_DATE_END.value, '\n 約定繳款日(起日)至約定繳款日(迄日)區間不可超過3個月)', 2)
  if (msg !== '') {
    $q.dialog({ message: msg })
    return
  }

  try {
    const resp = await ajaxPost('query', serializeForm())
    if (isSuccess(resp)) {
      rows.value = resp.rtnList ? resp.rtnList : []
      await parseEUDCAfterRender()
      return
    }
    rows.value = []
  } catch (error) {
    rows.value = []
  }
}

const getSrvDeptList = async () => {
  try {
    const resp = await ajaxPost('getSrvDeptList', serializeForm())
    if (isSuccess(resp)) {
      SRV_DEPT_List.value = resp.SRV_DEPT_List || []
      SRV_DEPT.value = ''
    }
  } catch (error) {
    SRV_DEPT_List.value = []
  }
}

const doExport = async () => {
  let msg = checkDateInput(DUE_DATE_STR.value, DUE_DATE_END.value, '\n 約定繳款日(起日)、約定繳款日(迄日)皆為必需輸入欄位')
  if (msg !== '') {
    $q.dialog({ message: msg })
    return
  }

  msg += checkDateArea(DUE_DATE_STR.value, DUE_DATE_END.value, '\n 約定繳款日(起)需小於等於約定繳款日(迄)', 1)
  if (msg !== '') {
    $q.dialog({ message: msg })
    return
  }

  msg += checkDateArea(DUE_DATE_STR.value, DUE_DATE_END.value, '\n 約定繳款日(起日)至約定繳款日(迄日)區間不可超過3個月)', 2)
  if (msg !== '') {
    $q.dialog({ message: msg })
    return
  }

  // FIXME: grid.getXlsSettingJSON('約定繳款明細資料') 無等價翻新，匯出欄位設定待確認
  gridJSON.value = ''

  const { executeCreateXlsFile } = useRPTUtil()
  executeCreateXlsFile(`${dispatcher.value || ''}/DSD1_0100/exportCsv`, serializeForm())
}

const onPageChange = async (val) => {
  pagination.value = val
  await parseEUDCAfterRender()
}

const doPrompt = async () => {
  const resp = await customAxios.get('DSD1_0100/prompt')
  const data = normalizeResp(resp)

  // FIXME: Server-side 資料來源待確認
  DIV_NO_CENTER_List.value = data?.DIV_NO_CENTER_List || []
  // FIXME: Server-side 資料來源待確認
  dispatcher.value = data?.dispatcher || ''
  // FIXME: Server-side 資料來源待確認
  imageBase.value = data?.imageBase || ''
}

onMounted(async () => {
  await doPrompt()
  await parseEUDCAfterRender()
})

// region Fallback

// TODO: RPTUtil.executeCreateXlsFile('<%=dispatcher%>/DSD1_0100/exportCsv', Form.serialize("form1"));
const useRPTUtil = () => {
  const executeCreateXlsFile = (...args) => args[0] ?? null
  return { executeCreateXlsFile }
}

// TODO: if ( "function" === typeof(parseEUDC) ) { parseEUDC('ap'); }
const useParseEUDC = () => {
  const slots = useSlots()
  const parseEUDC = (...args) => {
    slots.default?.()
    return args[0] ?? null
  }
  return { parseEUDC }
}

// endregion Fallback
</script>

<template>
  <div :style="{ backgroundColor: '#F0FBC6' }" class="q-pa-sm">
    <div :style="{ textAlign: 'center' }">
      <span
        id="bar1"
        :style="{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          zIndex: '9',
          visibility: 'visible',
        }"
      >
        <q-markup-table
          flat
          bordered
          dense
          :style="{ width: '100%' }"
        >
          <tbody>
            <tr>
              <td :style="{ width: '4px' }">
                <img :src="`${imageBase}/CM/border_01.gif`" width="4" height="12" alt="border">
              </td>
              <td :style="{ backgroundColor: '#F0FBC6', verticalAlign: 'top' }">
                <q-markup-table
                  flat
                  bordered
                  dense
                  :style="{ width: '100%' }"
                >
                  <tbody>
                    <tr>
                      <td :style="{ height: '4px' }">
                        <img :src="`${imageBase}/CM/border_03.gif`" width="12" height="4" alt="border">
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
                <q-markup-table
                  class="subTitle"
                  flat
                  bordered
                  dense
                  :style="{ width: '100%' }"
                >
                  <tbody>
                    <tr>
                      <td :style="{ width: '20px', height: '24px' }">
                        <div :style="{ textAlign: 'center' }"><span :style="{ fontSize: '10px' }">●</span></div>
                      </td>
                      <td><b>逾繳催收</b></td>
                      <td>
                        <div :style="{ textAlign: 'right' }">畫面編號：DSD10100</div>
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </td>
              <td :style="{ width: '4px' }">
                <img :src="`${imageBase}/CM/border_02.gif`" width="4" height="12" alt="border">
              </td>
              <td class="tbBox" :style="{ width: '5px' }"><img :src="`${imageBase}/CM/ecblank.gif`" width="5" height="1" alt="blank"></td>
            </tr>
          </tbody>
        </q-markup-table>
      </span>

      <q-markup-table
        flat
        bordered
        dense
        :style="{ width: '100%', marginTop: '30px' }"
      >
        <tbody>
          <tr>
            <td>&nbsp;</td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-markup-table
        flat
        bordered
        dense
        :style="{ width: '100%' }"
      >
        <tbody>
          <tr>
            <td :style="{ width: '4px' }">
              <img :src="`${imageBase}/CM/border_01.gif`" width="4" height="12" alt="border">
            </td>
            <td :style="{ width: '100%', backgroundColor: '#F0FBC6', verticalAlign: 'top' }">
              <q-markup-table
                flat
                bordered
                dense
                :style="{ width: '100%' }"
              >
                <tbody>
                  <tr>
                    <td :style="{ verticalAlign: 'top' }">
                      <q-markup-table
                        flat
                        bordered
                        dense
                        :style="{ width: '97%', margin: '0 auto', backgroundColor: '#003366', borderSpacing: '1px' }"
                      >
                        <tbody>
                          <tr>
                            <td class="tbBox2" colspan="5">約定繳款明細查詢</td>
                          </tr>
                          <tr :style="{ backgroundColor: '#FFFFFF' }">
                            <td>
                              <q-markup-table
                                id="table1"
                                class="tbBox2"
                                flat
                                bordered
                                dense
                                :style="{ width: '100%', borderSpacing: '1px' }"
                              >
                                <tbody>
                                  <tr>
                                    <td class="tbYellow" :style="{ width: '10%', whiteSpace: 'nowrap' }">約定繳款日</td>
                                    <td class="tbYellow2" :style="{ width: '30%', whiteSpace: 'nowrap' }">
                                      <q-field
                                        borderless
                                        dense
                                      >
                                        <q-input
                                          id="DUE_DATE_STR"
                                          v-model="DUE_DATE_STR"
                                          name="DUE_DATE_STR"
                                          class="textBox2"
                                          :maxlength="7"
                                          :error="!!errors.DUE_DATE_STR"
                                          :error-message="errors.DUE_DATE_STR"
                                          dense
                                          outlined
                                          clearable
                                        >
                                          <template #append>
                                            <q-icon name="event" class="cursor-pointer">
                                              <q-popup-proxy>
                                                <CustomDate
                                                  v-model="DUE_DATE_STR"
                                                  :datatype="'ROC'"
                                                  :today-btn="true"
                                                />
                                              </q-popup-proxy>
                                            </q-icon>
                                          </template>
                                        </q-input>
                                        <span>~</span>
                                        <q-input
                                          id="DUE_DATE_END"
                                          v-model="DUE_DATE_END"
                                          name="DUE_DATE_END"
                                          class="textBox2"
                                          :maxlength="7"
                                          :error="!!errors.DUE_DATE_END"
                                          :error-message="errors.DUE_DATE_END"
                                          dense
                                          outlined
                                          clearable
                                        >
                                          <template #append>
                                            <q-icon name="event" class="cursor-pointer">
                                              <q-popup-proxy>
                                                <CustomDate
                                                  v-model="DUE_DATE_END"
                                                  :datatype="'ROC'"
                                                  :today-btn="true"
                                                />
                                              </q-popup-proxy>
                                            </q-icon>
                                          </template>
                                        </q-input>
                                      </q-field>
                                    </td>
                                    <td class="tbYellow" :style="{ width: '10%', whiteSpace: 'nowrap' }">區域</td>
                                    <td class="tbYellow2" :style="{ width: '15%', whiteSpace: 'nowrap' }">
                                      <q-select
                                        id="DIV_NO_CENTER"
                                        v-model="DIV_NO_CENTER"
                                        name="DIV_NO_CENTER"
                                        class="textBox2"
                                        :options="divNoCenterOptions"
                                        option-value="CODE"
                                        option-label="CODE_NM"
                                        emit-value
                                        map-options
                                        dense
                                        outlined
                                        @update:model-value="getSrvDeptList"
                                      />
                                    </td>
                                    <td class="tbYellow" :style="{ width: '10%', whiteSpace: 'nowrap' }">服務中心一</td>
                                    <td class="tbYellow2" :style="{ width: '15%', whiteSpace: 'nowrap' }">
                                      <q-select
                                        id="SRV_DEPT"
                                        v-model="SRV_DEPT"
                                        name="SRV_DEPT"
                                        class="textBox2"
                                        :options="srvDeptOptions"
                                        option-value="CODE"
                                        option-label="CODE_NM"
                                        emit-value
                                        map-options
                                        dense
                                        outlined
                                      />
                                    </td>
                                    <td class="tbYellow2" rowspan="2" :style="{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }">
                                      <q-btn
                                        id="btn_QUERY"
                                        name="btn_QUERY"
                                        label="查詢"
                                        class="button"
                                        dense
                                        @click="query"
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </q-markup-table>

                              <CustomTable
                                id="grid"
                                class="tbBox2"
                                :columns="gridColumns"
                                :rows="rows"
                                row-key="LOAN_ID"
                                :pagination="pagination"
                                @update:pagination="onPageChange"
                              />

                              <q-markup-table
                                id="table2"
                                class="tbBox2"
                                flat
                                bordered
                                dense
                                :style="{ width: '100%', borderSpacing: '1px' }"
                              >
                                <tbody>
                                  <tr :style="{ backgroundColor: '#FFFFFF' }">
                                    <td colspan="6" :style="{ textAlign: 'center' }">
                                      <q-btn
                                        id="btn_EXCEL"
                                        name="btn_EXCEL"
                                        label="下載明細"
                                        class="button"
                                        dense
                                        @click="doExport"
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </q-markup-table>
                            </td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </td>
            <td :style="{ width: '4px' }">
              <img :src="`${imageBase}/CM/border_02.gif`" width="4" height="12" alt="border">
            </td>
            <td class="tbBox" :style="{ width: '5px' }"><img :src="`${imageBase}/CM/ecblank.gif`" width="5" height="1" alt="blank"></td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>
