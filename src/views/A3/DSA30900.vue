<template>
  <div class="dsa30900-page" :style="pageStyle">
    <q-form @submit.prevent>
      <q-markup-table class="tbBox2" flat separator="cell" id="tableA">
        <tbody>
          <tr>
            <td class="tbYellow" colspan="6">
              <q-radio
                v-model="functionSwitch"
                val="r_query"
                label="擔保品行情查詢"
                @update:model-value="onFunctionSwitch"
              />
              <q-radio
                v-model="functionSwitch"
                val="r_areaCodeQuery"
                label="承作分區查詢"
                @update:model-value="onFunctionSwitch"
              />
            </td>
            <td
              id="A1_TD_BTN"
              class="tbYellow2"
              :rowspan="btnRowSpan"
              :style="buttonCellStyle"
            >
              <div class="btn-group">
                <q-btn
                  v-show="isAreaCodeQuery"
                  id="btn_areaCodeQuery"
                  class="button ele_for_areaCode_query"
                  label="承作分區查詢"
                  unelevated
                  @click="doAreaCodeQuery"
                />
                <q-btn
                  v-show="isPriceQuery"
                  id="btn_query"
                  class="button ele_for_price_query"
                  label="查詢"
                  unelevated
                  @click="doQuery"
                />
                <q-btn
                  v-show="isPriceQuery"
                  id="btn_landQuery"
                  class="button ele_for_price_query"
                  label="土建融查詢"
                  unelevated
                  @click="doLandQuery"
                />
                <q-btn
                  v-show="isPriceQuery"
                  id="btn_qroupQuery"
                  class="button ele_for_price_query"
                  label="整批分戶查詢"
                  unelevated
                  @click="doGroupQuery"
                />
                <q-btn
                  v-show="isPriceQuery"
                  id="btn_communityQuery"
                  class="button ele_for_price_query"
                  label="社區資料查詢"
                  unelevated
                  @click="doCommunityQuery"
                />
                <q-btn
                  id="btn_clear"
                  class="button"
                  label="清除"
                  unelevated
                  @click="doClear"
                />
              </div>
            </td>
          </tr>

          <tr id="A1_TR_1" v-show="showApplyId && isPriceQuery">
            <td class="tbYellow">受理編號</td>
            <td class="tbYellow2">
              <q-input
                v-model="applyId"
                maxlength="11"
                dense
                outlined
                :error="!!errors.APPLY_ID"
                :error-message="errors.APPLY_ID"
              />
            </td>
            <td class="tbYellow">買賣日期</td>
            <td class="tbYellow2" colspan="3">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-input
                  v-model="tradeDateBeg"
                  maxlength="7"
                  dense
                  outlined
                  :error="!!errors.TRADE_DATE_BEG"
                  :error-message="errors.TRADE_DATE_BEG"
                />
                <span>~</span>
                <q-input
                  v-model="tradeDateEnd"
                  maxlength="7"
                  dense
                  outlined
                  :error="!!errors.TRADE_DATE_END"
                  :error-message="errors.TRADE_DATE_END"
                />
              </div>
            </td>
          </tr>

          <tr class="tr_for_price_query" v-show="isPriceQuery">
            <td class="tbYellow">鑑價日期</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-input
                  v-model="apprDateBeg"
                  maxlength="7"
                  dense
                  outlined
                  :error="!!errors.APPR_DATE_BEG"
                  :error-message="errors.APPR_DATE_BEG"
                />
                <span>~</span>
                <q-input
                  v-model="apprDateEnd"
                  maxlength="7"
                  dense
                  outlined
                  :error="!!errors.APPR_DATE_END"
                  :error-message="errors.APPR_DATE_END"
                />
              </div>
            </td>
            <td class="tbYellow">使用分區</td>
            <td class="tbYellow2">
              <q-select
                v-model="useArea1"
                :options="useArea1Options"
                emit-value
                map-options
                dense
                outlined
              />
            </td>
            <td class="tbYellow">列管區</td>
            <td class="tbYellow2">
              <q-select
                v-model="rstKind"
                :options="rstKindOptions"
                emit-value
                map-options
                dense
                outlined
              />
            </td>
          </tr>

          <tr>
            <td class="tbYellow">縣市別</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-select
                  v-model="city"
                  :options="cityOptions"
                  emit-value
                  map-options
                  dense
                  outlined
                  :error="!!errors.CITY"
                  :error-message="errors.CITY"
                />
                <q-select
                  v-model="town"
                  :options="townOptions"
                  emit-value
                  map-options
                  dense
                  outlined
                  :error="!!errors.TOWN"
                  :error-message="errors.TOWN"
                />
              </div>
            </td>
            <td class="tbYellow">地址路名門牌</td>
            <td class="tbYellow2" colspan="3">
              <q-input
                v-model="addrNo"
                dense
                outlined
                :placeholder="isAreaCodeQuery ? '請輸入完整門牌' : ''"
                :error="!!errors.ADDR_NO"
                :error-message="errors.ADDR_NO"
              />
            </td>
          </tr>

          <tr class="tr_for_areaCode_query" v-show="isAreaCodeQuery">
            <td class="tbYellow">經度</td>
            <td class="tbYellow2">
              <q-input
                v-model="longitude"
                dense
                outlined
                placeholder="精確至小數第6位(例:121.553012)"
                :error="!!errors.LONGITUDE"
                :error-message="errors.LONGITUDE"
              />
            </td>
            <td class="tbYellow">緯度</td>
            <td class="tbYellow2" colspan="3">
              <q-input
                v-model="latitude"
                dense
                outlined
                placeholder="精確至小數第6位(例:25.033021)"
                :error="!!errors.LATITUDE"
                :error-message="errors.LATITUDE"
              />
            </td>
          </tr>

          <tr class="tr_for_price_query" v-show="isPriceQuery">
            <td class="tbYellow">總樓層</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-select
                  v-model="equSign"
                  :options="equSignOptions"
                  emit-value
                  map-options
                  dense
                  outlined
                />
                <q-input
                  v-model="floor"
                  dense
                  outlined
                  :error="!!errors.FLOOR"
                  :error-message="errors.FLOOR"
                />
              </div>
            </td>
            <td class="tbYellow">類別</td>
            <td class="tbYellow2">
              <q-select
                v-model="useFor"
                :options="useForOptions"
                emit-value
                map-options
                dense
                outlined
              />
            </td>
            <td class="tbYellow">屋齡區間</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-input
                  v-model="buildAge1"
                  dense
                  outlined
                  :error="!!errors.BUILD_AGE1"
                  :error-message="errors.BUILD_AGE1"
                />
                <span>~</span>
                <q-input
                  v-model="buildAge2"
                  dense
                  outlined
                  :error="!!errors.BUILD_AGE2"
                  :error-message="errors.BUILD_AGE2"
                />
              </div>
            </td>
          </tr>

          <tr class="tr_for_price_query" v-show="isPriceQuery">
            <td class="tbYellow">案名</td>
            <td class="tbYellow2">
              <q-input
                v-model="caseName"
                dense
                outlined
                :error="!!errors.CASE_NAME"
                :error-message="errors.CASE_NAME"
              />
            </td>
            <td class="tbYellow">地坪</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-input
                  v-model="landMeasure1"
                  dense
                  outlined
                  :error="!!errors.LAND_MEASURE1"
                  :error-message="errors.LAND_MEASURE1"
                />
                <span>~</span>
                <q-input
                  v-model="landMeasure2"
                  dense
                  outlined
                  :error="!!errors.LAND_MEASURE2"
                  :error-message="errors.LAND_MEASURE2"
                />
              </div>
            </td>
            <td class="tbYellow">建坪</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-input
                  v-model="buildMeasure1"
                  dense
                  outlined
                  :error="!!errors.BUILD_MEASURE1"
                  :error-message="errors.BUILD_MEASURE1"
                />
                <span>~</span>
                <q-input
                  v-model="buildMeasure2"
                  dense
                  outlined
                  :error="!!errors.BUILD_MEASURE2"
                  :error-message="errors.BUILD_MEASURE2"
                />
              </div>
            </td>
          </tr>

          <tr class="tr_for_price_query" v-show="isPriceQuery">
            <td class="tbYellow">建築完成日</td>
            <td class="tbYellow2" colspan="5">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-input
                  v-model="finishDateBeg"
                  maxlength="7"
                  dense
                  outlined
                  :error="!!errors.FINISH_DATE_BEG"
                  :error-message="errors.FINISH_DATE_BEG"
                />
                <span>~</span>
                <q-input
                  v-model="finishDateEnd"
                  maxlength="7"
                  dense
                  outlined
                  :error="!!errors.FINISH_DATE_END"
                  :error-message="errors.FINISH_DATE_END"
                />
              </div>
            </td>
          </tr>

          <tr class="tr_for_price_query" v-show="isPriceQuery">
            <td colspan="7" class="tbYellow2">
              ※<span :style="{ color: 'red' }">＊＊</span>表示擔保品有增建情形。
              <span :style="{ color: 'blue' }">＠＠</span>表示同一編號含兩筆以上門牌(主建號)。
              <span :style="{ color: 'green' }">＄＄</span>表示擔保品為非承作區或列管區。
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-form>

    <q-table
      v-show="isPriceQuery"
      id="grid"
      class="grid q-mt-md"
      row-key="_rowKey"
      :rows="gridRows"
      :columns="gridColumns"
      :pagination="{ rowsPerPage: 10 }"
      flat
      bordered
    >
      <template #body-cell-APPLY_ID="props">
        <q-td :props="props">
          <a href="#" @click.prevent="doWindowOpen(props.row.QUERY_TYPE, props.row.APPLY_ID)">
            {{ props.row.APPLY_ID }}
          </a>
        </q-td>
      </template>

      <template #body-cell-ADDRESS="props">
        <q-td :props="props">
          <span v-if="isContractOrRestricted(props.row)" :style="{ color: 'green' }">$$ </span>
          <span v-if="isMultiAddress(props.row)" :style="{ color: 'blue' }">@@ </span>
          <span v-if="isAddBuilding(props.row)" :style="{ color: 'red' }">** </span>
          <span>{{ props.row.ADDRESS }}</span>
        </q-td>
      </template>
    </q-table>

    <q-markup-table
      v-show="isAreaCodeQuery"
      id="tableC"
      class="tbBox2 q-mt-md"
      flat
      separator="cell"
    >
      <tbody>
        <tr>
          <th colspan="5" scope="colgroup" :style="{ textAlign: 'left' }">承作分區查詢結果</th>
        </tr>
        <tr>
          <td class="tbBlue" :style="{ width: '50%', textAlign: 'center' }">所在生活圈</td>
          <td class="tbYellow2">{{ areaCodeResult.SUBMKT_NAME }}</td>
        </tr>
        <tr>
          <td class="tbBlue" :style="{ textAlign: 'center' }">承作分區</td>
          <td class="tbYellow2">{{ areaCodeResult.AREA_CODE_930318 }}</td>
        </tr>
        <tr>
          <td class="tbBlue" :style="{ textAlign: 'center' }">備註</td>
          <td class="tbYellow2">{{ areaCodeResult.MEMO }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { object, string } from 'yup'
import customAxios from '@/assets/libs/axios/instance.js'

const route = useRoute()

const blankOption = (label) => ({ label, value: '' })
const allOption = { label: '全部', value: '0' }

const useArea1Options = ref([allOption])
const rstKindOptions = ref([allOption])
const useForOptions = ref([allOption])
const equSignOptions = ref([{ label: '=', value: '=' }])
const cityOptions = ref([blankOption('縣市別')])
const townOptions = ref([blankOption('鄉鎮區')])
const townCache = ref({})

const showApplyId = ref(true)
const viewType = ref('query')
const pageTitle = ref('擔保品行情查詢')

const digitsRule = /^\d*$/

const validationSchema = object({
  APPLY_ID: string().max(11, '輸入值超出長度限制'),
  TRADE_DATE_BEG: string().validateROCDate(),
  TRADE_DATE_END: string().validateROCDate().validateROCDateMin('TRADE_DATE_BEG', '日期起迄有誤'),
  APPR_DATE_BEG: string().validateROCDate(),
  APPR_DATE_END: string().validateROCDate().validateROCDateMin('APPR_DATE_BEG', '日期起迄有誤'),
  FINISH_DATE_BEG: string().validateROCDate(),
  FINISH_DATE_END: string().validateROCDate().validateROCDateMin('FINISH_DATE_BEG', '日期起迄有誤'),
  FLOOR: string().test('digits-floor', '請輸入有效正整數', (v) => !v || digitsRule.test(v)),
  BUILD_AGE1: string().test('digits-buildAge1', '請輸入有效正整數', (v) => !v || digitsRule.test(v)),
  BUILD_AGE2: string()
    .test('digits-buildAge2', '請輸入有效正整數', (v) => !v || digitsRule.test(v))
    // FIXME: 改寫自 validateBetween，需人工確認邏輯等價
    .test('between-build-age', '迄值不得小於起值', function betweenBuildAge(v) {
      const s = this.parent.BUILD_AGE1
      if (!s || !v || Number.isNaN(Number(s)) || Number.isNaN(Number(v))) {
        return true
      }
      return Number(v) >= Number(s)
    }),
  LAND_MEASURE1: string().test('digits-land1', '請輸入有效正整數', (v) => !v || digitsRule.test(v)),
  LAND_MEASURE2: string()
    .test('digits-land2', '請輸入有效正整數', (v) => !v || digitsRule.test(v))
    // FIXME: 改寫自 validateBetween，需人工確認邏輯等價
    .test('between-land', '迄值不得小於起值', function betweenLand(v) {
      const s = this.parent.LAND_MEASURE1
      if (!s || !v || Number.isNaN(Number(s)) || Number.isNaN(Number(v))) {
        return true
      }
      return Number(v) >= Number(s)
    }),
  BUILD_MEASURE1: string().test('digits-build1', '請輸入有效正整數', (v) => !v || digitsRule.test(v)),
  BUILD_MEASURE2: string()
    .test('digits-build2', '請輸入有效正整數', (v) => !v || digitsRule.test(v))
    // FIXME: 改寫自 validateBetween，需人工確認邏輯等價
    .test('between-build', '迄值不得小於起值', function betweenBuild(v) {
      const s = this.parent.BUILD_MEASURE1
      if (!s || !v || Number.isNaN(Number(s)) || Number.isNaN(Number(v))) {
        return true
      }
      return Number(v) >= Number(s)
    }),
  CITY: string(),
  TOWN: string(),
  ADDR_NO: string(),
  LONGITUDE: string(),
  LATITUDE: string(),
  CASE_NAME: string(),
  USE_AREA1: string(),
  RST_KIND: string(),
  USE_FOR: string(),
  EQU_SIGN: string(),
})

const initialValues = {
  functionSwitch: 'r_query',
  APPLY_ID: '',
  TRADE_DATE_BEG: '',
  TRADE_DATE_END: '',
  APPR_DATE_BEG: '',
  APPR_DATE_END: '',
  USE_AREA1: '0',
  RST_KIND: '0',
  CITY: '',
  TOWN: '',
  ADDR_NO: '',
  LONGITUDE: '',
  LATITUDE: '',
  EQU_SIGN: '=',
  FLOOR: '',
  USE_FOR: '0',
  BUILD_AGE1: '',
  BUILD_AGE2: '',
  CASE_NAME: '',
  LAND_MEASURE1: '',
  LAND_MEASURE2: '',
  BUILD_MEASURE1: '',
  BUILD_MEASURE2: '',
  FINISH_DATE_BEG: '',
  FINISH_DATE_END: '',
}

const { errors, validateField, setFieldError, resetForm, setValues } = useForm({
  validationSchema,
  initialValues,
  validateOnMount: false,
})

// 原始名稱 functionSwitch
const { value: functionSwitch } = useField('functionSwitch')
// 原始名稱 APPLY_ID
const { value: applyId } = useField('APPLY_ID')
// 原始名稱 TRADE_DATE_BEG
const { value: tradeDateBeg } = useField('TRADE_DATE_BEG')
// 原始名稱 TRADE_DATE_END
const { value: tradeDateEnd } = useField('TRADE_DATE_END')
// 原始名稱 APPR_DATE_BEG
const { value: apprDateBeg } = useField('APPR_DATE_BEG')
// 原始名稱 APPR_DATE_END
const { value: apprDateEnd } = useField('APPR_DATE_END')
// 原始名稱 USE_AREA1
const { value: useArea1 } = useField('USE_AREA1')
// 原始名稱 RST_KIND
const { value: rstKind } = useField('RST_KIND')
// 原始名稱 CITY
const { value: city } = useField('CITY')
// 原始名稱 TOWN
const { value: town } = useField('TOWN')
// 原始名稱 ADDR_NO
const { value: addrNo } = useField('ADDR_NO')
// 原始名稱 LONGITUDE
const { value: longitude } = useField('LONGITUDE')
// 原始名稱 LATITUDE
const { value: latitude } = useField('LATITUDE')
// 原始名稱 EQU_SIGN
const { value: equSign } = useField('EQU_SIGN')
// 原始名稱 FLOOR
const { value: floor } = useField('FLOOR')
// 原始名稱 USE_FOR
const { value: useFor } = useField('USE_FOR')
// 原始名稱 BUILD_AGE1
const { value: buildAge1 } = useField('BUILD_AGE1')
// 原始名稱 BUILD_AGE2
const { value: buildAge2 } = useField('BUILD_AGE2')
// 原始名稱 CASE_NAME
const { value: caseName } = useField('CASE_NAME')
// 原始名稱 LAND_MEASURE1
const { value: landMeasure1 } = useField('LAND_MEASURE1')
// 原始名稱 LAND_MEASURE2
const { value: landMeasure2 } = useField('LAND_MEASURE2')
// 原始名稱 BUILD_MEASURE1
const { value: buildMeasure1 } = useField('BUILD_MEASURE1')
// 原始名稱 BUILD_MEASURE2
const { value: buildMeasure2 } = useField('BUILD_MEASURE2')
// 原始名稱 FINISH_DATE_BEG
const { value: finishDateBeg } = useField('FINISH_DATE_BEG')
// 原始名稱 FINISH_DATE_END
const { value: finishDateEnd } = useField('FINISH_DATE_END')

const gridRows = ref([])
const areaCodeResult = reactive({
  SUBMKT_NAME: '',
  AREA_CODE_930318: '',
  MEMO: '',
})

const isPriceQuery = computed(() => viewType.value === 'query')
const isAreaCodeQuery = computed(() => viewType.value === 'areaCodeQuery')

const buttonCellStyle = computed(() => ({
  width: '10%',
  textAlign: 'center',
}))

const pageStyle = computed(() => ({
  backgroundColor: '#F0FBC6',
  minHeight: '100vh',
  padding: '12px',
}))

const btnRowSpan = computed(() => {
  if (isAreaCodeQuery.value) {
    return 3
  }
  return showApplyId.value ? 7 : 6
})

const baseGridColumns = [
  { name: 'APPLY_ID', label: '編號', field: 'APPLY_ID', align: 'left', sortable: true },
  { name: 'ADDRESS', label: '地址', field: 'ADDRESS', align: 'left', sortable: true },
  { name: 'LAND_MEASURE', label: '地坪', field: 'LAND_MEASURE', align: 'right', sortable: true, format: fmtNumber },
  {
    name: 'PARK_NM',
    label: '車位型態',
    field: (row) => row.USE_FOR_NM ?? row.PARK_NM ?? '無車位型態',
    align: 'left',
    sortable: true,
  },
  { name: 'BOSS_PER_PRICEA', label: '單價', field: (row) => fmtWithNA(row.BOSS_PER_PRICEA, '無單價'), align: 'right', sortable: true },
  {
    name: 'BOSS_TOTAL_PRICEA',
    label: '總價',
    field: (row) => {
      if (String(row.QUERY_TYPE ?? '') === '3' && row.BOSS_TOTAL_PRICEA == null) {
        return '無總價'
      }
      return fmtNumber(row.BOSS_TOTAL_PRICEA)
    },
    align: 'right',
    sortable: true,
  },
  { name: 'FLOOR', label: '總樓層', field: (row) => row.FLOOR ?? '無總樓層', align: 'left', sortable: true },
  { name: 'FINISH_DATE', label: '建築日', field: (row) => row.FINISH_DATE ? toRocDate(row.FINISH_DATE) : '無建築日', align: 'left', sortable: true },
  { name: 'USE_FOR_NM', label: '類別', field: (row) => row.USE_FOR_NM ?? '無類別', align: 'left', sortable: true },
  { name: 'TRADE_DATE', label: '買賣日', field: (row) => row.TRADE_DATE ? toRocDate(row.TRADE_DATE) : '無買賣日', align: 'left', sortable: true },
  { name: 'BUILD_AGE', label: '屋齡', field: (row) => row.BUILD_AGE ?? '無屋齡', align: 'left', sortable: true },
  { name: 'BUILD_MEASURE', label: '建坪', field: 'BUILD_MEASURE', align: 'right', sortable: true, format: fmtNumber },
  { name: 'BOSS_PARK_PRICEA', label: '車位價', field: (row) => fmtWithNA(row.BOSS_PARK_PRICEA, '無車位價'), align: 'right', sortable: true },
  { name: 'BOSS_LAND_PRICEA', label: '地價', field: (row) => fmtWithNA(row.BOSS_LAND_PRICEA, '無地價'), align: 'right', sortable: true },
  { name: 'AVG_PRICE', label: '均價', field: (row) => fmtWithNA(row.AVG_PRICE, '無均價'), align: 'right', sortable: true },
  { name: 'BUILD_TYPE', label: '樓別', field: (row) => row.BUILD_TYPE ?? '無樓別', align: 'left', sortable: true },
  { name: 'APPR_DATE', label: '鑑估日', field: (row) => toRocDate(row.APPR_DATE), align: 'left', sortable: true },
  { name: 'CASE_NAME', label: '案名', field: (row) => row.CASE_NAME ?? '無案名', align: 'left', sortable: true },
  { name: 'TRADE_AMT', label: '買賣價', field: (row) => fmtWithNA(row.TRADE_AMT, '無買賣價'), align: 'right', sortable: true },
  { name: 'RENT_PRICE', label: '租金', field: (row) => fmtWithNA(row.RENT_PRICE, '無租金'), align: 'right', sortable: true },
]

const gridColumns = computed(() => {
  if (showApplyId.value) {
    return baseGridColumns
  }
  return baseGridColumns.filter((col) => !['APPLY_ID', 'TRADE_DATE', 'TRADE_AMT', 'RENT_PRICE'].includes(col.name))
})

const onFunctionSwitch = (value) => {
  doClear(false)
  if (value === 'r_areaCodeQuery') {
    viewType.value = 'areaCodeQuery'
    pageTitle.value = '承作分區查詢'
  } else {
    viewType.value = 'query'
    pageTitle.value = '擔保品行情查詢'
  }
}

watch(city, async (newCity, oldCity) => {
  if (newCity !== oldCity) {
    town.value = ''
    await doGetTownList()
  }
})

const beanName = computed(() => {
  const fromPublicBean = String(route.query.fromPublicBean ?? '')
  return fromPublicBean === 'DSA3_2400' ? 'DSA3_2400' : 'DSA3_0900'
})

const postAction = async (actionName, params = {}) => {
  const resp = await customAxios.post(`/${beanName.value}/${actionName}`, params)
  return unwrapResponse(resp)
}

const doPrompt = async () => {
  const injected = {
    showApplyId: route.query.showApplyId,
    fromPublicBean: route.query.fromPublicBean,
  }

  try {
    const resp = await postAction('prompt', injected)
    applyPromptPayload(resp)
  } catch (error) {
    applyPromptPayload(injected)
  }
}

const applyPromptPayload = (payload) => {
  showApplyId.value = toBoolean(payload?.showApplyId ?? route.query.showApplyId ?? true)

  useArea1Options.value = mapLegacySelect(payload?.USE_AREA1_LIST, allOption)
  rstKindOptions.value = mapLegacySelect(payload?.RST_KIND_LIST, allOption)
  useForOptions.value = mapLegacySelect(payload?.USE_FOR_LIST, allOption)
  equSignOptions.value = mapLegacySelect(payload?.EQU_SIGN_LIST, { label: '=', value: '=' })

  cityOptions.value = [blankOption('縣市別'), ...mapCitySelect(payload?.CITY_LIST)]

  setValues({
    APPLY_ID: String(route.query.APPLY_ID ?? ''),
    USE_AREA1: useArea1.value || '0',
    RST_KIND: rstKind.value || '0',
    EQU_SIGN: equSign.value || '=',
    USE_FOR: useFor.value || '0',
  })
}

const doPromptQuery = async () => {
  applyId.value = String(applyId.value || '').toUpperCase()
  try {
    const resp = await postAction('promptQuery', {
      APPLY_ID: applyId.value,
      showApplyId: showApplyId.value,
    })
    gridRows.value = attachRowKeys(resp?.rtnList)
  } catch (error) {
    gridRows.value = []
  }
}

const doQuery = async () => {
  applyId.value = String(applyId.value || '').toUpperCase()

  const valid = await validateFields([
    'APPLY_ID',
    'TRADE_DATE_BEG',
    'TRADE_DATE_END',
    'APPR_DATE_BEG',
    'APPR_DATE_END',
    'FINISH_DATE_BEG',
    'FINISH_DATE_END',
    'FLOOR',
    'BUILD_AGE1',
    'BUILD_AGE2',
    'LAND_MEASURE1',
    'LAND_MEASURE2',
    'BUILD_MEASURE1',
    'BUILD_MEASURE2',
    'CITY',
    'ADDR_NO',
  ])

  if (!valid) {
    return
  }

  if (!validateAddrOrCity()) {
    return
  }

  if (!validateCityTownNeedAnotherCondition()) {
    return
  }

  await doActionQuery('queryByDSA3_0900', 'query')
}

const doLandQuery = async () => {
  applyId.value = String(applyId.value || '').toUpperCase()

  if (!checkLandQuery()) {
    return
  }

  const valid = await validateFields([
    'APPLY_ID',
    'TRADE_DATE_BEG',
    'TRADE_DATE_END',
    'APPR_DATE_BEG',
    'APPR_DATE_END',
    'FINISH_DATE_BEG',
    'FINISH_DATE_END',
    'CITY',
    'ADDR_NO',
    'LAND_MEASURE1',
    'LAND_MEASURE2',
  ])

  if (!valid) {
    return
  }

  if (!validateAddrOrCity()) {
    return
  }

  if (!validateCityTownNeedAnotherCondition()) {
    return
  }

  await doActionQuery('landQueryByDSA3_0900', 'landQuery')
}

const doGroupQuery = async () => {
  applyId.value = String(applyId.value || '').toUpperCase()

  if (!checkGroupQuery()) {
    return
  }

  const valid = await validateFields([
    'APPLY_ID',
    'TRADE_DATE_BEG',
    'TRADE_DATE_END',
    'APPR_DATE_BEG',
    'APPR_DATE_END',
    'FINISH_DATE_BEG',
    'FINISH_DATE_END',
    'CITY',
    'ADDR_NO',
    'CASE_NAME',
  ])

  if (!valid) {
    return
  }

  if (!validateAddrOrCity()) {
    return
  }

  await doActionQuery('groupQueryByDSA3_0900', 'groupQuery')
}

const doCommunityQuery = async () => {
  if (!checkCommunityQuery()) {
    return
  }

  const valid = await validateFields([
    'CITY',
    'CASE_NAME',
    'ADDR_NO',
    'FINISH_DATE_BEG',
    'FINISH_DATE_END',
  ])

  if (!valid) {
    return
  }

  if (!validateCaseNameOrCity()) {
    return
  }

  if (!validateCityTownNeedAnotherCondition()) {
    return
  }

  await doActionQuery('communityQueryByDSA3_0900', 'communityQuery')
}

const doActionQuery = async (publicBeanAction, defaultAction) => {
  const actionName = beanName.value === 'DSA3_2400' ? publicBeanAction : defaultAction
  try {
    const reqMap = getInputData()
    const resp = await postAction(actionName, { reqMap: JSON.stringify(reqMap) })
    gridRows.value = attachRowKeys(resp?.rtnList)
  } catch (error) {
    gridRows.value = []
  }
}

const doAreaCodeQuery = async () => {
  resetAreaCodeResult()

  const valid = await validateFields(['CITY', 'TOWN', 'ADDR_NO', 'LONGITUDE', 'LATITUDE'])
  if (!valid) {
    return
  }

  if (!validateAddrAndLon()) {
    return
  }

  if (!validateFullAddrNo()) {
    return
  }

  try {
    const reqMap = getInputData4AreaCodeQuery()
    const resp = await postAction('areacodeQuery', { reqMap: JSON.stringify(reqMap) })
    setAreaCodeResult(resp?.rtnMap)
  } catch (error) {
    resetAreaCodeResult()
  }
}

const doClear = (resetSwitch = true) => {
  resetForm({ values: initialValues })
  townOptions.value = [blankOption('鄉鎮區')]
  resetAreaCodeResult()
  gridRows.value = []

  if (!resetSwitch) {
    functionSwitch.value = viewType.value === 'areaCodeQuery' ? 'r_areaCodeQuery' : 'r_query'
    return
  }

  viewType.value = 'query'
  functionSwitch.value = 'r_query'
}

const doWindowOpen = (queryType, applyIdValue) => {
  if (!queryType || !applyIdValue) {
    return
  }

  if (String(queryType) === '4') {
    const url = `/${beanName.value}/DSA3_3310/prompt?COMMUNITY_NO=${encodeURIComponent(String(applyIdValue))}`
    openLegacyPopup(url, String(applyIdValue).replace('@', ''))
    return
  }

  let link = ''
  if (String(queryType) === '1') {
    link = 'DSA3_0500'
  } else if (String(queryType) === '2') {
    link = 'DSA3_0600'
  } else if (String(queryType) === '3') {
    link = 'DSA3_0700'
  }

  if (!link) {
    return
  }

  const url = `/${beanName.value}/${link}/prompt?APPLY_ID=${encodeURIComponent(String(applyIdValue))}`
  openLegacyPopup(url, String(applyIdValue).replace('@', ''))
}

const doGetTownList = async () => {
  townOptions.value = [blankOption('鄉鎮區')]

  if (!city.value) {
    return
  }

  if (townCache.value[city.value]?.length) {
    townOptions.value = [blankOption('鄉鎮區'), ...townCache.value[city.value]]
    return
  }

  try {
    const resp = await postAction('getTOWN_LIST', { CITY_NAME: city.value })
    const mapped = mapTownSelect(resp?.TOWN_LIST)
    townCache.value = {
      ...townCache.value,
      [city.value]: mapped,
    }
    townOptions.value = [blankOption('鄉鎮區'), ...mapped]
  } catch (error) {
    townOptions.value = [blankOption('鄉鎮區')]
  }
}

const getInputData = () => ({
  APPLY_ID: applyId.value,
  TRADE_DATE_BEG: toY2K(tradeDateBeg.value),
  TRADE_DATE_END: toY2K(tradeDateEnd.value),
  APPR_DATE_BEG: toY2K(apprDateBeg.value),
  APPR_DATE_END: toY2K(apprDateEnd.value),
  FINISH_DATE_BEG: toY2K(finishDateBeg.value),
  FINISH_DATE_END: toY2K(finishDateEnd.value),
  USE_AREA1: useArea1.value,
  RST_KIND: rstKind.value,
  CITY: city.value,
  TOWN: town.value,
  ADDR_NO: addrNo.value,
  EQU_SIGN: equSign.value,
  FLOOR: floor.value,
  USE_FOR: useFor.value,
  BUILD_AGE1: buildAge1.value,
  BUILD_AGE2: buildAge2.value,
  CASE_NAME: caseName.value,
  LAND_MEASURE1: landMeasure1.value,
  LAND_MEASURE2: landMeasure2.value,
  BUILD_MEASURE1: buildMeasure1.value,
  BUILD_MEASURE2: buildMeasure2.value,
  LONGITUDE: longitude.value,
  LATITUDE: latitude.value,
  showApplyId: showApplyId.value,
})

const getInputData4AreaCodeQuery = () => ({
  CITY: city.value,
  TOWN: town.value,
  ADDR_NO: addrNo.value,
  LONGITUDE: longitude.value,
  LATITUDE: latitude.value,
})

const validateFields = async (fieldNames) => {
  let allValid = true
  for (const fieldName of fieldNames) {
    const result = await validateField(fieldName)
    if (!result.valid) {
      allValid = false
    }
  }
  return allValid
}

const validateAddrOrCity = () => {
  if (!applyId.value && !addrNo.value && !city.value) {
    setFieldError('CITY', '地址路名門牌與縣市別需擇一輸入')
    setFieldError('ADDR_NO', '地址路名門牌與縣市別需擇一輸入')
    return false
  }
  return true
}

const validateCaseNameOrCity = () => {
  if (!caseName.value && !city.value) {
    setFieldError('CITY', '案名與縣市別需擇一輸入')
    setFieldError('CASE_NAME', '案名與縣市別需擇一輸入')
    return false
  }
  return true
}

const validateAddrAndLon = () => {
  if (!addrNo.value && (!longitude.value || !latitude.value)) {
    setFieldError('ADDR_NO', '【地址路名門牌】與【經度、緯度】需擇一輸入')
    return false
  }
  if (addrNo.value && (longitude.value || latitude.value)) {
    setFieldError('ADDR_NO', '【地址路名門牌】與【經度、緯度】需擇一輸入')
    return false
  }
  return true
}

const validateFullAddrNo = () => {
  if (addrNo.value && !String(addrNo.value).includes('號')) {
    setFieldError('ADDR_NO', '使用地址查詢，請輸入完整門牌')
    areaCodeResult.MEMO = '請輸入完整門牌進行查詢'
    return false
  }
  return true
}

const validateCityTownNeedAnotherCondition = () => {
  const chkMap = collectInputMap()
  let hasCityTown = false
  let hasOtherField = false

  Object.keys(chkMap).forEach((key) => {
    if (key === 'CITY' || key === 'TOWN') {
      hasCityTown = true
    } else if (!['r_areaCodeQuery', 'r_query'].includes(key)) {
      hasOtherField = true
    }
  })

  if (hasCityTown && !hasOtherField) {
    window.alert('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return false
  }

  return true
}

const collectInputMap = () => {
  const map = {}
  const valueMap = {
    APPLY_ID: applyId.value,
    TRADE_DATE_BEG: tradeDateBeg.value,
    TRADE_DATE_END: tradeDateEnd.value,
    APPR_DATE_BEG: apprDateBeg.value,
    APPR_DATE_END: apprDateEnd.value,
    CITY: city.value,
    TOWN: town.value,
    ADDR_NO: addrNo.value,
    FLOOR: floor.value,
    CASE_NAME: caseName.value,
    BUILD_AGE1: buildAge1.value,
    BUILD_AGE2: buildAge2.value,
    LAND_MEASURE1: landMeasure1.value,
    LAND_MEASURE2: landMeasure2.value,
    BUILD_MEASURE1: buildMeasure1.value,
    BUILD_MEASURE2: buildMeasure2.value,
    FINISH_DATE_BEG: finishDateBeg.value,
    FINISH_DATE_END: finishDateEnd.value,
    USE_AREA1: useArea1.value,
    RST_KIND: rstKind.value,
    USE_FOR: useFor.value,
  }

  Object.entries(valueMap).forEach(([key, value]) => {
    if (['USE_AREA1', 'RST_KIND', 'USE_FOR'].includes(key)) {
      if (String(value) !== '0') {
        map[key] = value
      }
      return
    }

    if (value !== '' && value != null) {
      map[key] = value
    }
  })

  return map
}

const checkLandQuery = () => {
  const blockList = []

  if (caseName.value) blockList.push('案名')
  if (floor.value) blockList.push('總樓層')
  if (String(useFor.value) !== '0') blockList.push('類別')
  if (String(useArea1.value) !== '0') blockList.push('使用分區')
  if (String(rstKind.value) !== '0') blockList.push('列管區')
  if (buildAge1.value || buildAge2.value) blockList.push('屋齡區間')
  if (buildMeasure1.value || buildMeasure2.value) blockList.push('建坪')

  if (blockList.length) {
    window.alert(`土建融案件無法以${blockList.join('、')}查詢資料`)
    return false
  }

  return true
}

const checkGroupQuery = () => {
  const blockList = []

  if (floor.value) blockList.push('總樓層')
  if (String(useFor.value) !== '0') blockList.push('類別')
  if (String(useArea1.value) !== '0') blockList.push('使用分區')
  if (String(rstKind.value) !== '0') blockList.push('列管區')
  if (buildAge1.value || buildAge2.value) blockList.push('屋齡區間')
  if (landMeasure1.value || landMeasure2.value) blockList.push('地坪')
  if (buildMeasure1.value || buildMeasure2.value) blockList.push('建坪')

  if (blockList.length) {
    window.alert(`整批分戶案件無法以${blockList.join('、')}查詢資料`)
    return false
  }

  return true
}

const checkCommunityQuery = () => {
  const blockList = []

  if (applyId.value) blockList.push('受理編號')
  if (floor.value) blockList.push('總樓層')
  if (tradeDateBeg.value || tradeDateEnd.value) blockList.push('買賣日期')
  if (apprDateBeg.value || apprDateEnd.value) blockList.push('鑑價日期')
  if (String(useFor.value) !== '0') blockList.push('類別')
  if (String(useArea1.value) !== '0') blockList.push('使用分區')
  if (String(rstKind.value) !== '0') blockList.push('列管區')
  if (buildAge1.value || buildAge2.value) blockList.push('屋齡區間')
  if (landMeasure1.value || landMeasure2.value) blockList.push('地坪')
  if (buildMeasure1.value || buildMeasure2.value) blockList.push('建坪')

  if (blockList.length) {
    window.alert(`社區資料無法以${blockList.join('、')}查詢資料`)
    return false
  }

  return true
}

const setAreaCodeResult = (map) => {
  areaCodeResult.SUBMKT_NAME = map?.SUBMKT_NAME ?? ''
  areaCodeResult.AREA_CODE_930318 = map?.AREA_CODE_930318 ?? ''
  areaCodeResult.MEMO = map?.MEMO ?? ''
}

const resetAreaCodeResult = () => {
  setAreaCodeResult()
}

const isContractOrRestricted = (row) => String(row?.CONTRACT_AREA ?? '') === '1' || Number(row?.RESTRICT_AREA ?? 0) > 1
const isMultiAddress = (row) => Number(row?.CNT ?? 0) > 1
const isAddBuilding = (row) => String(row?.IS_ADD ?? '') === '1'

onMounted(async () => {
  await doPrompt()

  // TODO: 自訂資源 PageUI.createPage / PageUI.loadin 語義未知，待人工補齊
  legacyPageUI.createPage('DSA30900', '鑑價作業', pageTitle.value, false)
  legacyPageUI.loadin(['form1', 'grid', 'tableC'], 1)

  // TODO: 自訂資源 displayMessage 語義未知，待人工補齊
  displayMessageFallback()

  if (route.query.APPLY_ID) {
    applyId.value = String(route.query.APPLY_ID)
    await doPromptQuery()
  }
})

function unwrapResponse(resp) {
  const data = resp?.data ?? resp

  // TODO: 自訂資源 CSRUtil.isSuccess 語義未知，待人工補齊
  const checked = csrUtilFallback.isSuccess(data)
  if (checked === false) {
    throw new Error('legacy response failed')
  }

  return data
}

function attachRowKeys(list) {
  if (!Array.isArray(list)) {
    return []
  }

  return list.map((item, idx) => ({
    ...item,
    _rowKey: `${item.APPLY_ID ?? 'ROW'}-${idx}`,
  }))
}

function mapLegacySelect(input, defaultOption) {
  if (!Array.isArray(input) || !input.length) {
    return [defaultOption]
  }

  return input.map((item) => ({
    label: String(item.value ?? item.label ?? item.key ?? ''),
    value: String(item.key ?? item.value ?? ''),
  }))
}

function mapCitySelect(input) {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .map((item) => String(item.CITY_NAME ?? ''))
    .filter(Boolean)
    .map((name) => ({ label: name, value: name }))
}

function mapTownSelect(input) {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .map((item) => String(item.TOWN_NAME ?? ''))
    .filter(Boolean)
    .map((name) => ({ label: name, value: name }))
}

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value
  }
  return String(value).toLowerCase() === 'true' || String(value) === '1'
}

function fmtWithNA(value, naText) {
  if (value == null || value === '') {
    return naText
  }
  return fmtNumber(value)
}

function fmtNumber(value) {
  // TODO: 自訂資源 CSRUtil.$fmt 語義未知，待人工補齊
  return csrUtilFallback.fmt(value)
}

function toRocDate(value) {
  // TODO: 自訂資源 Date.toROC 語義未知，待人工補齊
  return legacyDateBridge.toRoc(value)
}

function toY2K(value) {
  // TODO: 自訂資源 toY2K 語義未知，待人工補齊
  return legacyDateBridge.toY2k(value)
}

function openLegacyPopup(url, windowName) {
  // TODO: 自訂資源 popupWin.windowOpen 語義未知，待人工補齊
  popupWinFallback.windowOpen(url, { windowName })
}

const legacyPageUI = usePageUIFallback()
const displayMessageFallback = useDisplayMessageFallback()
const legacyDateBridge = useDateBridgeFallback()
const csrUtilFallback = useCSRUtilFallback()
const popupWinFallback = usePopupWinFallback()

function usePageUIFallback() {
  return {
    createPage: (...args) => args[0] ?? null,
    loadin: (...args) => args[0] ?? null,
  }
}

function useDisplayMessageFallback() {
  return () => null
}

function useDateBridgeFallback() {
  return {
    toRoc: (arg) => arg ?? null,
    toY2k: (arg) => arg ?? null,
  }
}

function useCSRUtilFallback() {
  return {
    isSuccess: (arg) => arg ?? null,
    fmt: (arg) => arg ?? null,
  }
}

function usePopupWinFallback() {
  return {
    windowOpen: (arg) => arg ?? null,
  }
}
</script>

<style scoped>
.dsa30900-page {
  width: 100%;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.button {
  width: 90px;
}

.grid {
  background: #ffffff;
}

@media (max-width: 900px) {
  .btn-group {
    align-items: stretch;
  }

  .button {
    width: 100%;
  }
}
</style>
