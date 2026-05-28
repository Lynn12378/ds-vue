<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useForm, useField } from 'vee-validate'
import { object, string, number } from 'yup'
import customAxios from '@/assets/libs/customAxios/index.js'
import { $fmt, isSuccess } from '@/assets/utils/CSRUtil.js'
import { toROC, toY2K } from '@/assets/utils/date.js'
import PageUI from '@/components/layout/PageUI.vue'
import CustomDate from '@/components/common/custom-date/CustomDate.js'
import CustomTable from '@/components/common/custom-table/CustomTable.js'
import { useWindowOpen } from '@/composables/useWindowOpen.js'

const route = useRoute()
const $q = useQuasar()
const { windowOpen } = useWindowOpen()

const AMT_FORMAT = '#,###.####'

// FIXME: Server-side 資料來源待確認
const showApplyId = ref(true)
// FIXME: Server-side 資料來源待確認
const fromPublicBean = ref('')
// FIXME: Server-side 資料來源待確認
const USE_AREA1_LIST = ref([])
// FIXME: Server-side 資料來源待確認
const RST_KIND_LIST = ref([])
// FIXME: Server-side 資料來源待確認
const CITY_LIST = ref([])
// FIXME: Server-side 資料來源待確認
const EQU_SIGN_LIST = ref([])
// FIXME: Server-side 資料來源待確認
const USE_FOR_LIST = ref([])

const rows = ref([])
const viewType = ref('query')
const TOWN_Map = ref({})
const TOWN_LIST = ref([])

const SUBMKT_NAME = ref('')
const AREA_CODE_930318 = ref('')
const MEMO = ref('')

const defaultValues = () => ({
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
  EQU_SIGN: '0',
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
})

const validators = {
  validateBetween: {
    name: 'validateBetween',
    message: '迄值不得小於起值',
    test: function (v) {
      // FIXME: parseInt($F(node.name+'1'),10) － 需確認行為是否等價
      const startField = this.path.endsWith('2') ? `${this.path.slice(0, -1)}1` : this.path
      const startValue = parseInt(this.parent[startField], 10)
      const endValue = parseInt(v, 10)
      if (isNaN(startValue) || isNaN(endValue)) return true
      return endValue >= startValue
    },
  },
  validateAddrNo: {
    name: 'validateAddrNo',
    message: '地址路名門牌與縣市別需擇一輸入',
    test: function () {
      // FIXME: $F('APPLY_ID') / $F('ADDR_NO') / $F('CITY') － 需確認行為是否等價
      if (!this.parent.APPLY_ID && this.parent.ADDR_NO === '' && this.parent.CITY === '') {
        return false
      }
      return true
    },
  },
  validateCaseName: {
    name: 'validateCaseName',
    message: '案名與縣市別需擇一輸入',
    test: function () {
      // FIXME: $F('CASE_NAME') / $F('CITY') － 需確認行為是否等價
      if (this.parent.CASE_NAME === '' && this.parent.CITY === '') {
        return false
      }
      return true
    },
  },
  validateAddrAndLon: {
    name: 'validateAddrAndLon',
    message: '【地址路名門牌】與【經度、緯度】需擇一輸入',
    test: function () {
      // FIXME: $F('ADDR_NO') / $F('LONGITUDE') / $F('LATITUDE') － 需確認行為是否等價
      if (this.parent.ADDR_NO === '' && (this.parent.LONGITUDE === '' || this.parent.LATITUDE === '')) {
        return false
      }
      if (this.parent.ADDR_NO !== '' && (this.parent.LONGITUDE !== '' || this.parent.LATITUDE !== '')) {
        return false
      }
      return true
    },
  },
  validateFullAddrNo: {
    name: 'validateFullAddrNo',
    message: '使用地址查詢，請輸入完整門牌',
    test: function () {
      // FIXME: $F('ADDR_NO').indexOf('號') － 需確認行為是否等價
      if (this.parent.ADDR_NO !== '') {
        return this.parent.ADDR_NO.indexOf('號') >= 0
      }
      return true
    },
  },
}

const baseSchemaFields = {
  APPLY_ID: string().max(11),
  TRADE_DATE_BEG: string().validateROCDate(),
  TRADE_DATE_END: string().validateROCDate(),
  APPR_DATE_BEG: string().validateROCDate(),
  APPR_DATE_END: string().validateROCDate(),
  USE_AREA1: string(),
  RST_KIND: string(),
  CITY: string(),
  TOWN: string(),
  ADDR_NO: string(),
  LONGITUDE: string(),
  LATITUDE: string(),
  EQU_SIGN: string(),
  FLOOR: number().skipEmptyStr().positive().integer(),
  USE_FOR: string(),
  BUILD_AGE1: number().skipEmptyStr().positive().integer().test(validators.validateBetween),
  BUILD_AGE2: number().skipEmptyStr().positive().integer().test(validators.validateBetween),
  CASE_NAME: string(),
  LAND_MEASURE1: number().skipEmptyStr().positive().integer().test(validators.validateBetween),
  LAND_MEASURE2: number().skipEmptyStr().positive().integer().test(validators.validateBetween),
  BUILD_MEASURE1: number().skipEmptyStr().positive().integer().test(validators.validateBetween),
  BUILD_MEASURE2: number().skipEmptyStr().positive().integer().test(validators.validateBetween),
  FINISH_DATE_BEG: string().validateROCDate(),
  FINISH_DATE_END: string().validateROCDate(),
}

const valid1Schema = object({
  ...baseSchemaFields,
  // FIXME: valid1.define('validateAddr_No', { id: 'CITY' }) － 原為動態綁定，需確認驗證行為是否等價
  CITY: string().test(validators.validateAddrNo),
  // FIXME: valid1.define('validateAddr_No', { id: 'ADDR_NO' }) － 原為動態綁定，需確認驗證行為是否等價
  ADDR_NO: string().test(validators.validateAddrNo),
})

const valid2Schema = object({
  ...baseSchemaFields,
  // FIXME: valid2.define('validateCase_Name', { id: 'CITY' }) － 原為動態綁定，需確認驗證行為是否等價
  CITY: string().test(validators.validateCaseName),
  // FIXME: valid2.define('validateCase_Name', { id: 'CASE_NAME' }) － 原為動態綁定，需確認驗證行為是否等價
  CASE_NAME: string().test(validators.validateCaseName),
})

const valid3Schema = object({
  ...baseSchemaFields,
  // FIXME: valid3.define('validateAddrAndLon', { id: 'ADDR_NO' }) － 原為動態綁定，需確認驗證行為是否等價
  ADDR_NO: string().test(validators.validateAddrAndLon).test(validators.validateFullAddrNo),
  // FIXME: valid3.define('required', { id: 'CITY' }) － 原為動態綁定，需確認驗證行為是否等價
  CITY: string().required(),
  // FIXME: valid3.define('required', { id: 'TOWN' }) － 原為動態綁定，需確認驗證行為是否等價
  TOWN: string().required(),
})

const currentValid = ref('valid1')

// FIXME: 新增 currentValid 切換驗證群組 － 需確認各 validate 動作對應的 valid 群組
const validationSchema = computed(() => {
  if (currentValid.value === 'valid1') return valid1Schema
  if (currentValid.value === 'valid2') return valid2Schema
  if (currentValid.value === 'valid3') return valid3Schema
  return object({})
})

const { errors, validate, resetForm, setValues } = useForm({
  validationSchema,
  initialValues: defaultValues(),
  validateOnMount: false,
})

const { value: functionSwitch } = useField('functionSwitch')
const { value: APPLY_ID } = useField('APPLY_ID')
const { value: TRADE_DATE_BEG } = useField('TRADE_DATE_BEG')
const { value: TRADE_DATE_END } = useField('TRADE_DATE_END')
const { value: APPR_DATE_BEG } = useField('APPR_DATE_BEG')
const { value: APPR_DATE_END } = useField('APPR_DATE_END')
const { value: USE_AREA1 } = useField('USE_AREA1')
const { value: RST_KIND } = useField('RST_KIND')
const { value: CITY } = useField('CITY')
const { value: TOWN } = useField('TOWN')
const { value: ADDR_NO } = useField('ADDR_NO')
const { value: LONGITUDE } = useField('LONGITUDE')
const { value: LATITUDE } = useField('LATITUDE')
const { value: EQU_SIGN } = useField('EQU_SIGN')
const { value: FLOOR } = useField('FLOOR')
const { value: USE_FOR } = useField('USE_FOR')
const { value: BUILD_AGE1 } = useField('BUILD_AGE1')
const { value: BUILD_AGE2 } = useField('BUILD_AGE2')
const { value: CASE_NAME } = useField('CASE_NAME')
const { value: LAND_MEASURE1 } = useField('LAND_MEASURE1')
const { value: LAND_MEASURE2 } = useField('LAND_MEASURE2')
const { value: BUILD_MEASURE1 } = useField('BUILD_MEASURE1')
const { value: BUILD_MEASURE2 } = useField('BUILD_MEASURE2')
const { value: FINISH_DATE_BEG } = useField('FINISH_DATE_BEG')
const { value: FINISH_DATE_END } = useField('FINISH_DATE_END')

const cityOptions = computed(() => {
  return [{ value: '', label: '縣市別' }].concat(
    (CITY_LIST.value || []).map((opt) => ({
      value: opt.CITY_NAME,
      label: opt.CITY_NAME,
    }))
  )
})

const townOptions = computed(() => {
  return [{ value: '', label: '鄉鎮區' }].concat(
    (TOWN_LIST.value || []).map((opt) => ({
      value: opt.TOWN_NAME,
      label: opt.TOWN_NAME,
    }))
  )
})

const useAreaOptions = computed(() => {
  return (USE_AREA1_LIST.value || []).map((opt) => ({
    value: opt.key,
    label: opt.key === '0' ? '全部' : opt.value,
  }))
})

const rstKindOptions = computed(() => {
  return (RST_KIND_LIST.value || []).map((opt) => ({
    value: opt.key,
    label: opt.key === '0' ? '全部' : opt.value,
  }))
})

const useForOptions = computed(() => {
  return (USE_FOR_LIST.value || []).map((opt) => ({
    value: opt.key,
    label: opt.key === '0' ? '全部' : opt.value,
  }))
})

const equSignOptions = computed(() => {
  return (EQU_SIGN_LIST.value || []).map((opt) => ({
    value: opt.key,
    label: opt.value,
  }))
})

const isPriceQuery = computed(() => viewType.value === 'query')
const addrPlaceholder = computed(() => {
  return viewType.value === 'areaCodeQuery' ? '請輸入完整門牌' : ''
})

const gridColumns = computed(() => {
  const columns = [
    { name: 'APPLY_ID', label: '編號', field: 'APPLY_ID', sortable: true, align: 'center' },
    { name: 'ADDRESS', label: '地址', field: 'ADDRESS', sortable: true, align: 'left' },
    { name: 'LAND_MEASURE', label: '地坪', field: 'LAND_MEASURE', sortable: true, align: 'center' },
    {
      name: 'PARK_NM',
      label: '車位型態',
      field: 'PARK_NM',
      sortable: true,
      format: (val, row) => (row.USE_FOR_NM === undefined ? '無車位型態' : val),
    },
    {
      name: 'BOSS_PER_PRICEA',
      label: '單價',
      field: 'BOSS_PER_PRICEA',
      sortable: true,
      format: (val, row) => (row.BOSS_PER_PRICEA === undefined ? '無單價' : $fmt(val, AMT_FORMAT)),
    },
    {
      name: 'BOSS_TOTAL_PRICEA',
      label: '總價',
      field: 'BOSS_TOTAL_PRICEA',
      sortable: true,
      format: (val, row) => {
        if (row.QUERY_TYPE === '3' && row.BOSS_TOTAL_PRICEA == null) return '無總價'
        return $fmt(val, AMT_FORMAT)
      },
    },
    {
      name: 'FLOOR',
      label: '總樓層',
      field: 'FLOOR',
      sortable: true,
      format: (val, row) => (row.FLOOR === undefined ? '無總樓層' : val),
    },
    {
      name: 'FINISH_DATE',
      label: '建築日',
      field: 'FINISH_DATE',
      sortable: true,
      format: (val, row) => (row.FINISH_DATE === undefined ? '無建築日' : toROC(val)),
    },
    {
      name: 'USE_FOR_NM',
      label: '類別',
      field: 'USE_FOR_NM',
      sortable: true,
      format: (val, row) => (row.USE_FOR_NM === undefined ? '無類別' : val),
    },
    {
      name: 'TRADE_DATE',
      label: '買賣日',
      field: 'TRADE_DATE',
      sortable: true,
      format: (val, row) => (row.TRADE_DATE === undefined ? '無買賣日' : toROC(val)),
    },
    {
      name: 'BUILD_AGE',
      label: '屋齡',
      field: 'BUILD_AGE',
      sortable: true,
      format: (val, row) => (row.BUILD_AGE === undefined ? '無屋齡' : val),
    },
    { name: 'BUILD_MEASURE', label: '建坪', field: 'BUILD_MEASURE', sortable: true, align: 'center' },
    {
      name: 'BOSS_PARK_PRICEA',
      label: '車位價',
      field: 'BOSS_PARK_PRICEA',
      sortable: true,
      format: (val, row) => (row.BOSS_PARK_PRICEA === undefined ? '無車位價' : $fmt(val, AMT_FORMAT)),
    },
    {
      name: 'BOSS_LAND_PRICEA',
      label: '地價',
      field: 'BOSS_LAND_PRICEA',
      sortable: true,
      format: (val, row) => (row.BOSS_LAND_PRICEA === undefined ? '無地價' : $fmt(val, AMT_FORMAT)),
    },
    {
      name: 'AVG_PRICE',
      label: '均價',
      field: 'AVG_PRICE',
      sortable: true,
      format: (val, row) => (row.AVG_PRICE === undefined ? '無均價' : $fmt(val, AMT_FORMAT)),
    },
    {
      name: 'BUILD_TYPE',
      label: '樓別',
      field: 'BUILD_TYPE',
      sortable: true,
      format: (val, row) => (row.BUILD_TYPE === undefined ? '無樓別' : val),
    },
    {
      name: 'APPR_DATE',
      label: '鑑估日',
      field: 'APPR_DATE',
      sortable: true,
      format: (val) => toROC(val),
    },
    {
      name: 'CASE_NAME',
      label: '案名',
      field: 'CASE_NAME',
      sortable: true,
      format: (val, row) => (row.CASE_NAME === undefined ? '無案名' : val),
    },
    {
      name: 'TRADE_AMT',
      label: '買賣價',
      field: 'TRADE_AMT',
      sortable: true,
      format: (val, row) => (row.TRADE_AMT === undefined ? '無買賣價' : $fmt(val, AMT_FORMAT)),
    },
    {
      name: 'RENT_PRICE',
      label: '租金',
      field: 'RENT_PRICE',
      sortable: true,
      format: (val, row) => (row.RENT_PRICE === undefined ? '無租金' : $fmt(val, AMT_FORMAT)),
    },
  ]

  if (!showApplyId.value) {
    return columns.filter((col) => {
      return !['APPLY_ID', 'TRADE_DATE', 'TRADE_AMT', 'RENT_PRICE'].includes(col.name)
    })
  }

  return columns
})

function getAddressPrefix(record) {
  const prefix = []
  if (record.CONTRACT_AREA === '1' || parseInt(record.RESTRICT_AREA, 10) > 1) {
    prefix.push({ color: 'green', text: '$$ ' })
  }
  if (parseInt(record.CNT, 10) > 1) {
    prefix.push({ color: 'blue', text: '@@ ' })
  }
  if (record.IS_ADD === '1') {
    prefix.push({ color: 'red', text: '** ' })
  }
  return prefix
}

function normalizeBoolean(val, fallback = true) {
  if (val === true || val === 'true') return true
  if (val === false || val === 'false') return false
  return fallback
}

async function doPrompt() {
  const resp = (await customAxios.get('DSA3_0900/prompt')).data
  // FIXME: Server-side 資料來源待確認
  showApplyId.value = normalizeBoolean(resp.showApplyId, true)
  // FIXME: Server-side 資料來源待確認
  fromPublicBean.value = resp.fromPublicBean || ''
  // FIXME: Server-side 資料來源待確認
  USE_AREA1_LIST.value = resp.USE_AREA1_LIST || []
  // FIXME: Server-side 資料來源待確認
  RST_KIND_LIST.value = resp.RST_KIND_LIST || []
  // FIXME: Server-side 資料來源待確認
  CITY_LIST.value = resp.CITY_LIST || []
  // FIXME: Server-side 資料來源待確認
  EQU_SIGN_LIST.value = resp.EQU_SIGN_LIST || []
  // FIXME: Server-side 資料來源待確認
  USE_FOR_LIST.value = resp.USE_FOR_LIST || []
}

async function ajaxPost(actionName, params, successAction, errorAction) {
  const beanName = fromPublicBean.value === 'DSA3_2400' ? fromPublicBean.value : 'DSA3_0900'
  const resp = (await customAxios.post(`${beanName}/${actionName}`, params)).data

  if (isSuccess(resp)) {
    if (successAction) successAction(resp)
  } else if (errorAction) {
    errorAction(resp)
  }
}

function getInputData() {
  return {
    APPLY_ID: APPLY_ID.value,
    TRADE_DATE_BEG: toY2K(TRADE_DATE_BEG.value),
    TRADE_DATE_END: toY2K(TRADE_DATE_END.value),
    APPR_DATE_BEG: toY2K(APPR_DATE_BEG.value),
    APPR_DATE_END: toY2K(APPR_DATE_END.value),
    USE_AREA1: USE_AREA1.value,
    RST_KIND: RST_KIND.value,
    CITY: CITY.value,
    TOWN: TOWN.value,
    ADDR_NO: ADDR_NO.value,
    EQU_SIGN: EQU_SIGN.value,
    FLOOR: FLOOR.value,
    USE_FOR: USE_FOR.value,
    BUILD_AGE1: BUILD_AGE1.value,
    BUILD_AGE2: BUILD_AGE2.value,
    CASE_NAME: CASE_NAME.value,
    LAND_MEASURE1: LAND_MEASURE1.value,
    LAND_MEASURE2: LAND_MEASURE2.value,
    BUILD_MEASURE1: BUILD_MEASURE1.value,
    BUILD_MEASURE2: BUILD_MEASURE2.value,
    FINISH_DATE_BEG: toY2K(FINISH_DATE_BEG.value),
    FINISH_DATE_END: toY2K(FINISH_DATE_END.value),
    showApplyId: showApplyId.value,
  }
}

function getInputData4AreaCodeQuery() {
  return {
    CITY: CITY.value,
    TOWN: TOWN.value,
    ADDR_NO: ADDR_NO.value,
    LONGITUDE: LONGITUDE.value,
    LATITUDE: LATITUDE.value,
  }
}

function hasOnlyCityTownCondition() {
  const hasCityTown = CITY.value !== '' || TOWN.value !== ''
  const hasOtherField = [
    APPLY_ID.value,
    TRADE_DATE_BEG.value,
    TRADE_DATE_END.value,
    APPR_DATE_BEG.value,
    APPR_DATE_END.value,
    ADDR_NO.value,
    FLOOR.value,
    BUILD_AGE1.value,
    BUILD_AGE2.value,
    CASE_NAME.value,
    LAND_MEASURE1.value,
    LAND_MEASURE2.value,
    BUILD_MEASURE1.value,
    BUILD_MEASURE2.value,
    FINISH_DATE_BEG.value,
    FINISH_DATE_END.value,
    USE_AREA1.value !== '0' ? USE_AREA1.value : '',
    RST_KIND.value !== '0' ? RST_KIND.value : '',
    USE_FOR.value !== '0' ? USE_FOR.value : '',
  ].some((val) => val !== '' && val !== null && val !== undefined)

  return hasCityTown && !hasOtherField
}

function showAlert(message) {
  $q.dialog({ message })
}

function checkLandQuery() {
  const disabledFieldNames = []

  if (CASE_NAME.value !== '') disabledFieldNames.push('案名')
  if (FLOOR.value !== '') disabledFieldNames.push('總樓層')

  if (USE_FOR.value !== '0') disabledFieldNames.push('類別')
  if (USE_AREA1.value !== '0') disabledFieldNames.push('使用分區')
  if (RST_KIND.value !== '0') disabledFieldNames.push('列管區')

  if (BUILD_AGE1.value !== '' || BUILD_AGE2.value !== '') disabledFieldNames.push('屋齡區間')
  if (BUILD_MEASURE1.value !== '' || BUILD_MEASURE2.value !== '') disabledFieldNames.push('建坪')

  if (disabledFieldNames.length === 0) return true

  showAlert(`土建融案件無法以${disabledFieldNames.join('、')}查詢資料`)
  return false
}

function checkGroupQuery() {
  const disabledFieldNames = []

  if (FLOOR.value !== '') disabledFieldNames.push('總樓層')

  if (USE_FOR.value !== '0') disabledFieldNames.push('類別')
  if (USE_AREA1.value !== '0') disabledFieldNames.push('使用分區')
  if (RST_KIND.value !== '0') disabledFieldNames.push('列管區')

  if (BUILD_AGE1.value !== '' || BUILD_AGE2.value !== '') disabledFieldNames.push('屋齡區間')
  if (LAND_MEASURE1.value !== '' || LAND_MEASURE2.value !== '') disabledFieldNames.push('地坪')
  if (BUILD_MEASURE1.value !== '' || BUILD_MEASURE2.value !== '') disabledFieldNames.push('建坪')

  if (disabledFieldNames.length === 0) return true

  showAlert(`整批分戶案件無法以${disabledFieldNames.join('、')}查詢資料`)
  return false
}

function checkCommunityQuery() {
  const disabledFieldNames = []

  if (APPLY_ID.value !== '') disabledFieldNames.push('受理編號')
  if (FLOOR.value !== '') disabledFieldNames.push('總樓層')
  if (TRADE_DATE_BEG.value !== '' || TRADE_DATE_END.value !== '') disabledFieldNames.push('買賣日期')
  if (APPR_DATE_BEG.value !== '' || APPR_DATE_END.value !== '') disabledFieldNames.push('鑑價日期')

  if (USE_FOR.value !== '0') disabledFieldNames.push('類別')
  if (USE_AREA1.value !== '0') disabledFieldNames.push('使用分區')
  if (RST_KIND.value !== '0') disabledFieldNames.push('列管區')

  if (BUILD_AGE1.value !== '' || BUILD_AGE2.value !== '') disabledFieldNames.push('屋齡區間')
  if (LAND_MEASURE1.value !== '' || LAND_MEASURE2.value !== '') disabledFieldNames.push('地坪')
  if (BUILD_MEASURE1.value !== '' || BUILD_MEASURE2.value !== '') disabledFieldNames.push('建坪')

  if (disabledFieldNames.length === 0) return true

  showAlert(`社區資料無法以${disabledFieldNames.join('、')}查詢資料`)
  return false
}

function normalizeApplyId() {
  APPLY_ID.value = (APPLY_ID.value || '').toUpperCase()
}

async function doPromptQuery() {
  normalizeApplyId()
  await ajaxPost(
    'promptQuery',
    { APPLY_ID: APPLY_ID.value, showApplyId: showApplyId.value },
    (resp) => {
      rows.value = resp.rtnList || []
    },
    () => {
      rows.value = []
    }
  )
}

async function doQuery() {
  normalizeApplyId()
  currentValid.value = 'valid1'
  const { valid } = await validate()
  if (!valid) return

  if (hasOnlyCityTownCondition()) {
    showAlert('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }

  const reqMap = getInputData()
  const actionName = fromPublicBean.value === 'DSA3_2400' ? 'queryByDSA3_0900' : 'query'

  await ajaxPost(
    actionName,
    { reqMap: JSON.stringify(reqMap) },
    (resp) => {
      rows.value = resp.rtnList || []
    },
    () => {
      rows.value = []
    }
  )
}

async function doLandQuery() {
  normalizeApplyId()

  if (!checkLandQuery()) return

  currentValid.value = 'valid1'
  const { valid } = await validate()
  if (!valid) return

  if (hasOnlyCityTownCondition()) {
    showAlert('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }

  const reqMap = getInputData()
  const actionName = fromPublicBean.value === 'DSA3_2400' ? 'landQueryByDSA3_0900' : 'landQuery'

  await ajaxPost(
    actionName,
    { reqMap: JSON.stringify(reqMap) },
    (resp) => {
      rows.value = resp.rtnList || []
    },
    () => {
      rows.value = []
    }
  )
}

async function doGroupQuery() {
  normalizeApplyId()

  if (!checkGroupQuery()) return

  currentValid.value = 'valid1'
  const { valid } = await validate()
  if (!valid) return

  const reqMap = getInputData()
  const actionName = fromPublicBean.value === 'DSA3_2400' ? 'groupQueryByDSA3_0900' : 'groupQuery'

  await ajaxPost(
    actionName,
    { reqMap: JSON.stringify(reqMap) },
    (resp) => {
      rows.value = resp.rtnList || []
    },
    () => {
      rows.value = []
    }
  )
}

async function doCommunityQuery() {
  if (!checkCommunityQuery()) return

  currentValid.value = 'valid2'
  const { valid } = await validate()
  if (!valid) return

  if (hasOnlyCityTownCondition()) {
    showAlert('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }

  const reqMap = getInputData()
  const actionName = fromPublicBean.value === 'DSA3_2400' ? 'communityQueryByDSA3_0900' : 'communityQuery'

  await ajaxPost(
    actionName,
    { reqMap: JSON.stringify(reqMap) },
    (resp) => {
      rows.value = resp.rtnList || []
    },
    () => {
      rows.value = []
    }
  )
}

function resetTableC() {
  SUBMKT_NAME.value = ''
  AREA_CODE_930318.value = ''
  MEMO.value = ''
}

function doClear() {
  resetForm({ values: defaultValues() })
  TOWN_LIST.value = []
  rows.value = []
  resetTableC()

  if (viewType.value === 'areaCodeQuery') {
    functionSwitch.value = 'r_areaCodeQuery'
  } else {
    functionSwitch.value = 'r_query'
  }
}

function setAreaCodeResult(map) {
  if (map) {
    SUBMKT_NAME.value = map.SUBMKT_NAME || ''
    AREA_CODE_930318.value = map.AREA_CODE_930318 || ''
    MEMO.value = map.MEMO || ''
    return
  }

  resetTableC()
}

async function doAreaCodeQuery() {
  resetTableC()

  currentValid.value = 'valid3'
  const { valid } = await validate()
  if (!valid) {
    if (ADDR_NO.value !== '' && ADDR_NO.value.indexOf('號') < 0) {
      MEMO.value = '請輸入完整門牌進行查詢'
    }
    return
  }

  const reqMap = getInputData4AreaCodeQuery()

  await ajaxPost(
    'areacodeQuery',
    { reqMap: JSON.stringify(reqMap) },
    (resp) => {
      setAreaCodeResult(resp.rtnMap)
    },
    () => {
      setAreaCodeResult()
    }
  )
}

function switchFunction(target) {
  viewType.value = target === 'r_areaCodeQuery' ? 'areaCodeQuery' : 'query'
  doClear()
}

async function doGetTOWN_LIST() {
  TOWN.value = ''
  TOWN_LIST.value = []

  if (CITY.value === '') return

  if (TOWN_Map.value[CITY.value] && TOWN_Map.value[CITY.value].length > 0) {
    TOWN_LIST.value = TOWN_Map.value[CITY.value]
    return
  }

  await ajaxPost('getTOWN_LIST', { CITY_NAME: CITY.value }, (resp) => {
    const opts = resp.TOWN_LIST || []
    TOWN_Map.value[CITY.value] = opts
    TOWN_LIST.value = opts
  })
}

function doWindowOpen(queryType, applyId) {
  if (queryType === '4') {
    windowOpen({ name: 'DSA33310' }, { COMMUNITY_NO: applyId }, String(applyId).replace('@', ''))
    return
  }

  const routeNameMap = {
    '1': 'DSA30500',
    '2': 'DSA30600',
    '3': 'DSA30700',
  }

  const routeName = routeNameMap[queryType]
  if (!routeName) return

  windowOpen({ name: routeName }, { APPLY_ID: applyId }, String(applyId).replace('@', ''))
}

watch(CITY, async () => {
  await doGetTOWN_LIST()
})

onMounted(async () => {
  await doPrompt()
  doClear()

  // ${param.APPLY_ID} → route.query.APPLY_ID
  if (route.query.APPLY_ID) {
    setValues({ APPLY_ID: String(route.query.APPLY_ID) })
    await doPromptQuery()
  }
})
</script>

<template>
  <PageUI title="鑑價作業" sub-title="擔保品行情查詢" page-no="DSA30900">
    <q-form id="form1" name="form1" @submit.prevent>
      <q-markup-table
        id="tableA"
        class="tbBox2"
        flat
        bordered
        dense
        :style="{ width: '100%', borderSpacing: '1px' }"
      >
        <tr>
          <td class="tbYellow" colspan="6">
            <q-field dense borderless>
              <q-radio v-model="functionSwitch" name="functionSwitch" val="r_query" dense @update:model-value="switchFunction('r_query')" />
              <span>擔保品行情查詢</span>
              <q-radio v-model="functionSwitch" name="functionSwitch" val="r_areaCodeQuery" dense @update:model-value="switchFunction('r_areaCodeQuery')" />
              <span>承作分區查詢</span>
            </q-field>
          </td>
          <td
            id="A1_TD_BTN"
            class="tbYellow2"
            :style="{ textAlign: 'center', width: '10%' }"
            :rowspan="isPriceQuery ? (showApplyId ? 7 : 6) : 3"
          >
            <q-btn id="btn_areaCodeQuery" name="btn_areaCodeQuery" class="button ele_for_areaCode_query" style="width:90px" label="承作分區查詢" dense @click="doAreaCodeQuery" v-show="!isPriceQuery" />
            <q-btn id="btn_query" name="btn_query" class="button ele_for_price_query" label="查詢" dense @click="doQuery" v-show="isPriceQuery" />
            <q-btn id="btn_landQuery" name="btn_landQuery" class="button ele_for_price_query" style="width:90px" label="土建融查詢" dense @click="doLandQuery" v-show="isPriceQuery" />
            <q-btn id="btn_qroupQuery" name="btn_qroupQuery" class="button ele_for_price_query" style="width:90px" label="整批分戶查詢" dense @click="doGroupQuery" v-show="isPriceQuery" />
            <q-btn id="btn_communityQuery" name="btn_communityQuery" class="button ele_for_price_query" style="width:90px" label="社區資料查詢" dense @click="doCommunityQuery" v-show="isPriceQuery" />
            <br>
            <q-btn id="btn_clear" name="btn_clear" class="button" label="清除" dense @click="doClear" />
          </td>
        </tr>

        <tr id="A1_TR_1" class="tr_for_price_query" v-if="isPriceQuery && showApplyId">
          <td class="tbYellow">受理編號</td>
          <td class="tbYellow2">
            <q-input
              id="APPLY_ID"
              v-model="APPLY_ID"
              name="APPLY_ID"
              class="textBox2 checkInputLength ele_for_price_query"
              dense
              outlined
              :maxlength="11"
              :error="!!errors.APPLY_ID"
              :error-message="errors.APPLY_ID"
            />
          </td>
          <td class="tbYellow">買賣日期</td>
          <td class="tbYellow2" colspan="3">
            <q-field dense borderless>
              <q-input
                id="TRADE_DATE_BEG"
                v-model="TRADE_DATE_BEG"
                name="TRADE_DATE_BEG"
                class="textBox2 validate-ROCDate ele_for_price_query"
                dense
                outlined
                clearable
                :maxlength="7"
                :error="!!errors.TRADE_DATE_BEG"
                :error-message="errors.TRADE_DATE_BEG"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <CustomDate v-model="TRADE_DATE_BEG" :datatype="'ROC'" :today-btn="true" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <span>~</span>
              <q-input
                id="TRADE_DATE_END"
                v-model="TRADE_DATE_END"
                name="TRADE_DATE_END"
                class="textBox2 validate-ROCDate ele_for_price_query"
                dense
                outlined
                clearable
                :maxlength="7"
                :error="!!errors.TRADE_DATE_END"
                :error-message="errors.TRADE_DATE_END"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <CustomDate v-model="TRADE_DATE_END" :datatype="'ROC'" :today-btn="true" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </q-field>
          </td>
        </tr>

        <tr class="tr_for_price_query" v-if="isPriceQuery">
          <td class="tbYellow" :style="{ width: '13%' }">鑑價日期</td>
          <td class="tbYellow2" :style="{ width: '29%' }">
            <q-field dense borderless>
              <q-input
                id="APPR_DATE_BEG"
                v-model="APPR_DATE_BEG"
                name="APPR_DATE_BEG"
                class="textBox2 validate-ROCDate ele_for_price_query"
                dense
                outlined
                clearable
                :maxlength="7"
                :error="!!errors.APPR_DATE_BEG"
                :error-message="errors.APPR_DATE_BEG"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <CustomDate v-model="APPR_DATE_BEG" :datatype="'ROC'" :today-btn="true" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <span>~</span>
              <q-input
                id="APPR_DATE_END"
                v-model="APPR_DATE_END"
                name="APPR_DATE_END"
                class="textBox2 validate-ROCDate ele_for_price_query"
                dense
                outlined
                clearable
                :maxlength="7"
                :error="!!errors.APPR_DATE_END"
                :error-message="errors.APPR_DATE_END"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <CustomDate v-model="APPR_DATE_END" :datatype="'ROC'" :today-btn="true" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </q-field>
          </td>
          <td class="tbYellow" :style="{ width: '16%' }">使用分區</td>
          <td class="tbYellow2" :style="{ width: '10%' }">
            <q-select
              id="USE_AREA1"
              v-model="USE_AREA1"
              name="USE_AREA1"
              class="ele_for_price_query"
              :options="useAreaOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              outlined
              :error="!!errors.USE_AREA1"
              :error-message="errors.USE_AREA1"
            />
          </td>
          <td class="tbYellow" :style="{ width: '12%' }">列管區</td>
          <td class="tbYellow2" :style="{ width: '10%' }">
            <q-select
              id="RST_KIND"
              v-model="RST_KIND"
              name="RST_KIND"
              class="ele_for_price_query"
              :options="rstKindOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              outlined
              :error="!!errors.RST_KIND"
              :error-message="errors.RST_KIND"
            />
          </td>
        </tr>

        <tr>
          <td class="tbYellow">縣市別</td>
          <td class="tbYellow2">
            <q-field dense borderless>
              <q-select
                id="CITY"
                v-model="CITY"
                name="CITY"
                :options="cityOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                dense
                outlined
                :error="!!errors.CITY"
                :error-message="errors.CITY"
              />
              <q-select
                id="TOWN"
                v-model="TOWN"
                name="TOWN"
                :options="townOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                dense
                outlined
                :error="!!errors.TOWN"
                :error-message="errors.TOWN"
              />
            </q-field>
          </td>

          <td class="tbYellow">地址路名門牌</td>
          <td class="tbYellow2" colspan="3">
            <q-input
              id="ADDR_NO"
              v-model="ADDR_NO"
              name="ADDR_NO"
              class="textBox2"
              dense
              outlined
              :placeholder="addrPlaceholder"
              :error="!!errors.ADDR_NO"
              :error-message="errors.ADDR_NO"
            />
          </td>
        </tr>

        <tr class="tr_for_areaCode_query" v-if="!isPriceQuery">
          <td class="tbYellow">經度</td>
          <td class="tbYellow2">
            <q-input
              id="LONGITUDE"
              v-model="LONGITUDE"
              name="LONGITUDE"
              class="textBox2 ele_for_areaCode_query"
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
              id="LATITUDE"
              v-model="LATITUDE"
              name="LATITUDE"
              class="textBox2 ele_for_areaCode_query"
              dense
              outlined
              placeholder="精確至小數第6位(例:25.033021)"
              :error="!!errors.LATITUDE"
              :error-message="errors.LATITUDE"
            />
          </td>
        </tr>

        <tr class="tr_for_price_query" v-if="isPriceQuery">
          <td class="tbYellow">總樓層</td>
          <td class="tbYellow2">
            <q-field dense borderless>
              <q-select
                id="EQU_SIGN"
                v-model="EQU_SIGN"
                name="EQU_SIGN"
                class="ele_for_price_query"
                :options="equSignOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                dense
                outlined
                :error="!!errors.EQU_SIGN"
                :error-message="errors.EQU_SIGN"
              />
              <q-input
                id="FLOOR"
                v-model="FLOOR"
                name="FLOOR"
                class="textBox2 validate-digits ele_for_price_query"
                dense
                outlined
                :error="!!errors.FLOOR"
                :error-message="errors.FLOOR"
              />
            </q-field>
          </td>
          <td class="tbYellow">類別</td>
          <td class="tbYellow2">
            <q-select
              id="USE_FOR"
              v-model="USE_FOR"
              name="USE_FOR"
              class="ele_for_price_query"
              :options="useForOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              outlined
              :error="!!errors.USE_FOR"
              :error-message="errors.USE_FOR"
            />
          </td>
          <td class="tbYellow">屋齡區間</td>
          <td class="tbYellow2">
            <q-field dense borderless>
              <q-input
                id="BUILD_AGE1"
                v-model="BUILD_AGE1"
                name="BUILD_AGE1"
                class="textBox2 validate-digits validateBetween ele_for_price_query"
                dense
                outlined
                :error="!!errors.BUILD_AGE1"
                :error-message="errors.BUILD_AGE1"
              />
              <span>~</span>
              <q-input
                id="BUILD_AGE2"
                v-model="BUILD_AGE2"
                name="BUILD_AGE2"
                class="textBox2 validate-digits validateBetween ele_for_price_query"
                dense
                outlined
                :error="!!errors.BUILD_AGE2"
                :error-message="errors.BUILD_AGE2"
              />
            </q-field>
          </td>
        </tr>

        <tr class="tr_for_price_query" v-if="isPriceQuery">
          <td class="tbYellow">案名</td>
          <td class="tbYellow2">
            <q-input
              id="CASE_NAME"
              v-model="CASE_NAME"
              name="CASE_NAME"
              class="textBox2 ele_for_price_query"
              dense
              outlined
              :error="!!errors.CASE_NAME"
              :error-message="errors.CASE_NAME"
            />
          </td>
          <td class="tbYellow">地坪</td>
          <td class="tbYellow2">
            <q-field dense borderless>
              <q-input
                id="LAND_MEASURE1"
                v-model="LAND_MEASURE1"
                name="LAND_MEASURE1"
                class="textBox2 validate-digits validateBetween ele_for_price_query"
                dense
                outlined
                :error="!!errors.LAND_MEASURE1"
                :error-message="errors.LAND_MEASURE1"
              />
              <span>~</span>
              <q-input
                id="LAND_MEASURE2"
                v-model="LAND_MEASURE2"
                name="LAND_MEASURE2"
                class="textBox2 validate-digits validateBetween ele_for_price_query"
                dense
                outlined
                :error="!!errors.LAND_MEASURE2"
                :error-message="errors.LAND_MEASURE2"
              />
            </q-field>
          </td>
          <td class="tbYellow">建坪</td>
          <td class="tbYellow2">
            <q-field dense borderless>
              <q-input
                id="BUILD_MEASURE1"
                v-model="BUILD_MEASURE1"
                name="BUILD_MEASURE1"
                class="textBox2 validate-digits validateBetween ele_for_price_query"
                dense
                outlined
                :error="!!errors.BUILD_MEASURE1"
                :error-message="errors.BUILD_MEASURE1"
              />
              <span>~</span>
              <q-input
                id="BUILD_MEASURE2"
                v-model="BUILD_MEASURE2"
                name="BUILD_MEASURE2"
                class="textBox2 validate-digits validateBetween ele_for_price_query"
                dense
                outlined
                :error="!!errors.BUILD_MEASURE2"
                :error-message="errors.BUILD_MEASURE2"
              />
            </q-field>
          </td>
        </tr>

        <tr class="tr_for_price_query" v-if="isPriceQuery">
          <td class="tbYellow">建築完成日</td>
          <td class="tbYellow2" colspan="5">
            <q-field dense borderless>
              <q-input
                id="FINISH_DATE_BEG"
                v-model="FINISH_DATE_BEG"
                name="FINISH_DATE_BEG"
                class="textBox2 validate-ROCDate ele_for_price_query"
                dense
                outlined
                clearable
                :maxlength="7"
                :error="!!errors.FINISH_DATE_BEG"
                :error-message="errors.FINISH_DATE_BEG"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <CustomDate v-model="FINISH_DATE_BEG" :datatype="'ROC'" :today-btn="true" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <span>~</span>
              <q-input
                id="FINISH_DATE_END"
                v-model="FINISH_DATE_END"
                name="FINISH_DATE_END"
                class="textBox2 validate-ROCDate ele_for_price_query"
                dense
                outlined
                clearable
                :maxlength="7"
                :error="!!errors.FINISH_DATE_END"
                :error-message="errors.FINISH_DATE_END"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <CustomDate v-model="FINISH_DATE_END" :datatype="'ROC'" :today-btn="true" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </q-field>
          </td>
        </tr>

        <tr class="tr_for_price_query" v-if="isPriceQuery">
          <td colspan="7" class="tbYellow2">
            ※<span :style="{ color: 'red' }">＊＊</span>表示擔保品有增建情形。
            <span :style="{ color: 'blue' }">＠＠</span>表示同一編號含兩筆以上門牌(主建號)。
            <span :style="{ color: 'green' }">＄＄</span>表示擔保品為非承作區或列管區。
          </td>
        </tr>
      </q-markup-table>
    </q-form>

    <CustomTable
      v-show="isPriceQuery"
      id="grid"
      class="grid"
      :rows="rows"
      :columns="gridColumns"
      row-key="APPLY_ID"
      :pagination="{ rowsPerPage: 10 }"
      flat
      bordered
      dense
    >
      <template #body-cell-APPLY_ID="props">
        <q-td :props="props">
          <a href="#" @click.prevent="doWindowOpen(props.row.QUERY_TYPE, props.row.APPLY_ID)">
            {{ props.value }}
          </a>
        </q-td>
      </template>

      <template #body-cell-ADDRESS="props">
        <q-td :props="props" class="text-left">
          <span v-for="(prefix, idx) in getAddressPrefix(props.row)" :key="`${props.row.APPLY_ID}-${idx}`" :style="{ color: prefix.color }">
            {{ prefix.text }}
          </span>
          <span>{{ props.value }}</span>
        </q-td>
      </template>
    </CustomTable>

    <q-markup-table
      v-show="!isPriceQuery"
      id="tableC"
      class="tbBox2"
      flat
      bordered
      dense
      :style="{ width: '100%', borderSpacing: '1px' }"
    >
      <tr>
        <th scope="col" colspan="5" :style="{ textAlign: 'left' }">承作分區查詢結果</th>
      </tr>
      <tr>
        <td class="tbBlue" :style="{ width: '50%', textAlign: 'center' }">所在生活圈</td>
        <td id="SUBMKT_NAME" class="tbYellow2">{{ SUBMKT_NAME }}</td>
      </tr>
      <tr>
        <td class="tbBlue" :style="{ textAlign: 'center' }">承作分區</td>
        <td id="AREA_CODE_930318" class="tbYellow2">{{ AREA_CODE_930318 }}</td>
      </tr>
      <tr>
        <td class="tbBlue" :style="{ textAlign: 'center' }">備註</td>
        <td id="MEMO" class="tbYellow2" colspan="2">{{ MEMO }}</td>
      </tr>
    </q-markup-table>
  </PageUI>
</template>
