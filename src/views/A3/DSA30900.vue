<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useForm, useField } from 'vee-validate'
import { object, string } from 'yup'
import dayjs from 'dayjs'
import customAxios from '@/assets/plugins/customAxios.js'
import { isSuccess } from '@/assets/utils/CSRUtil.js'
import { MoneyFormat } from '@/assets/utils/utility.js'
import { toY2K } from '@/assets/utils/date.js'

const route = useRoute()
const $q = useQuasar()

const showApplyId = ref(true)
const fromPublicBean = ref('')

const USE_AREA1_LIST = ref([])
const RST_KIND_LIST = ref([])
const CITY_LIST = ref([])
const EQU_SIGN_LIST = ref([])
const USE_FOR_LIST = ref([])

const TOWN_LIST = ref([])
const townCache = ref({})

const rows = ref([])
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: null,
  descending: false,
})

const viewType = ref('query')
const currentValid = ref('valid1')

const areaCodeResult = ref({
  SUBMKT_NAME: '',
  AREA_CODE_930318: '',
  MEMO: '',
})

const beanName = computed(() => (fromPublicBean.value === 'DSA3_2400' ? 'DSA3_2400' : 'DSA3_0900'))

const mapKeyValueOptions = (list, allText = '全部') => {
  const base = [{ key: '0', value: allText }]
  return base.concat(list || [])
}

const cityOptions = computed(() => {
  return [{ CITY_NAME: '' }].concat(CITY_LIST.value || [])
})

const townOptions = computed(() => {
  return [{ TOWN_NAME: '' }].concat(TOWN_LIST.value || [])
})

const useAreaOptions = computed(() => mapKeyValueOptions(USE_AREA1_LIST.value))
const rstKindOptions = computed(() => mapKeyValueOptions(RST_KIND_LIST.value))
const useForOptions = computed(() => mapKeyValueOptions(USE_FOR_LIST.value))

const equSignOptions = computed(() => {
  return EQU_SIGN_LIST.value || []
})

const validators = {
  validateBetween: {
    name: 'validateBetween',
    message: '迄值不得小於起值',
    test: function (v) {
      const value1 = parseInt(this.parent[`${this.path.slice(0, -1)}1`] || '', 10)
      const value2 = parseInt(v || '', 10)
      if (isNaN(value1) || isNaN(value2)) return true
      return value2 >= value1
    },
  },
  validateAddrNo: {
    name: 'validateAddrNo',
    message: '地址路名門牌與縣市別需擇一輸入',
    test: function () {
      return !!(this.parent['APPLY_ID'] || this.parent['ADDR_NO'] || this.parent['CITY'])
    },
  },
  validateCaseName: {
    name: 'validateCaseName',
    message: '案名與縣市別需擇一輸入',
    test: function () {
      return !!(this.parent['CASE_NAME'] || this.parent['CITY'])
    },
  },
  validateAddrAndLon: {
    name: 'validateAddrAndLon',
    message: '【地址路名門牌】與【經度、緯度】需擇一輸入',
    test: function () {
      const addr = this.parent['ADDR_NO'] || ''
      const lon = this.parent['LONGITUDE'] || ''
      const lat = this.parent['LATITUDE'] || ''
      if (!addr && (!lon || !lat)) return false
      if (addr && (lon || lat)) return false
      return true
    },
  },
  validateFullAddrNo: {
    name: 'validateFullAddrNo',
    message: '使用地址查詢，請輸入完整門牌',
    test: function (v) {
      if (!v) return true
      return String(v).includes('號')
    },
  },
}

const digitOptional = () =>
  string().test({
    name: 'digitOptional',
    message: '請輸入數字',
    test: (value) => value == null || value === '' || /^\d+$/.test(String(value)),
  })

const valid1Schema = object({
  APPLY_ID: string().max(11),
  TRADE_DATE_BEG: string().validateROCDate(),
  TRADE_DATE_END: string().validateROCDate(),
  APPR_DATE_BEG: string().validateROCDate(),
  APPR_DATE_END: string().validateROCDate(),
  FINISH_DATE_BEG: string().validateROCDate(),
  FINISH_DATE_END: string().validateROCDate(),
  FLOOR: digitOptional(),
  BUILD_AGE1: digitOptional(),
  BUILD_AGE2: digitOptional().test(validators.validateBetween),
  LAND_MEASURE1: digitOptional(),
  LAND_MEASURE2: digitOptional().test(validators.validateBetween),
  BUILD_MEASURE1: digitOptional(),
  BUILD_MEASURE2: digitOptional().test(validators.validateBetween),
  // FIXME: valid1.define('validateAddr_No', { id: 'CITY' }) 原為動態綁定
  CITY: string().test(validators.validateAddrNo),
  // FIXME: valid1.define('validateAddr_No', { id: 'ADDR_NO' }) 原為動態綁定
  ADDR_NO: string().test(validators.validateAddrNo),
})

const valid2Schema = object({
  // FIXME: valid2.define('validateCase_Name', { id: 'CITY' }) 原為動態綁定
  CITY: string().test(validators.validateCaseName),
  // FIXME: valid2.define('validateCase_Name', { id: 'CASE_NAME' }) 原為動態綁定
  CASE_NAME: string().test(validators.validateCaseName),
  FINISH_DATE_BEG: string().validateROCDate(),
  FINISH_DATE_END: string().validateROCDate(),
})

const valid3Schema = object({
  CITY: string().required(),
  TOWN: string().required(),
  // FIXME: valid3.define('validateAddrAndLon', { id: 'ADDR_NO' }) 原為動態綁定
  ADDR_NO: string().test(validators.validateAddrAndLon).test(validators.validateFullAddrNo),
})

const validationSchema = computed(() => {
  if (currentValid.value === 'valid1') return valid1Schema
  if (currentValid.value === 'valid2') return valid2Schema
  if (currentValid.value === 'valid3') return valid3Schema
  return object({})
})

const { errors, validate, resetForm, setFieldValue } = useForm({
  validationSchema,
  initialValues: {
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
    EQU_SIGN: '',
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
  },
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

const parseShowApplyId = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return true
}

const toRocDisplay = (value) => {
  if (!value) return ''
  const parsed = dayjs(String(value), ['YYYY-MM-DD', 'YYYYMMDD', 'YYYY/MM/DD'], true)
  if (!parsed.isValid()) return String(value)
  return `${parsed.year() - 1911}${parsed.format('MMDD')}`
}

const fmtAmount = (value) => {
  if (value == null || value === '') return ''
  return MoneyFormat(value)
}

const formatAddress = (record) => {
  let value = record.ADDRESS || ''
  if (!value) return value

  if (record.CONTRACT_AREA === '1' || parseInt(record.RESTRICT_AREA || '0', 10) > 1) {
    value = `$$ ${value}`
  }
  if (parseInt(record.CNT || '0', 10) > 1) {
    value = `@@ ${value}`
  }
  if (record.IS_ADD === '1') {
    value = `** ${value}`
  }
  return value
}

const gridColumnsBase = [
  { name: 'APPLY_ID', label: '編號', field: 'APPLY_ID', align: 'left', sortable: true },
  { name: 'ADDRESS', label: '地址', field: formatAddress, align: 'left', sortable: true },
  { name: 'LAND_MEASURE', label: '地坪', field: 'LAND_MEASURE', align: 'right', sortable: true },
  {
    name: 'PARK_NM',
    label: '車位型態',
    field: (row) => row.USE_FOR_NM ?? row.PARK_NM ?? '無車位型態',
    align: 'left',
    sortable: true,
  },
  {
    name: 'BOSS_PER_PRICEA',
    label: '單價',
    field: (row) => (row.BOSS_PER_PRICEA == null ? '無單價' : fmtAmount(row.BOSS_PER_PRICEA)),
    align: 'right',
    sortable: true,
  },
  {
    name: 'BOSS_TOTAL_PRICEA',
    label: '總價',
    field: (row) => {
      if (row.QUERY_TYPE === '3' && row.BOSS_TOTAL_PRICEA == null) return '無總價'
      return fmtAmount(row.BOSS_TOTAL_PRICEA)
    },
    align: 'right',
    sortable: true,
  },
  {
    name: 'FLOOR',
    label: '總樓層',
    field: (row) => row.FLOOR ?? '無總樓層',
    align: 'left',
    sortable: true,
  },
  {
    name: 'FINISH_DATE',
    label: '建築日',
    field: (row) => (row.FINISH_DATE == null ? '無建築日' : toRocDisplay(row.FINISH_DATE)),
    align: 'left',
    sortable: true,
  },
  {
    name: 'USE_FOR_NM',
    label: '類別',
    field: (row) => row.USE_FOR_NM ?? '無類別',
    align: 'left',
    sortable: true,
  },
  {
    name: 'TRADE_DATE',
    label: '買賣日',
    field: (row) => (row.TRADE_DATE == null ? '無買賣日' : toRocDisplay(row.TRADE_DATE)),
    align: 'left',
    sortable: true,
  },
  {
    name: 'BUILD_AGE',
    label: '屋齡',
    field: (row) => row.BUILD_AGE ?? '無屋齡',
    align: 'left',
    sortable: true,
  },
  { name: 'BUILD_MEASURE', label: '建坪', field: 'BUILD_MEASURE', align: 'right', sortable: true },
  {
    name: 'BOSS_PARK_PRICEA',
    label: '車位價',
    field: (row) => (row.BOSS_PARK_PRICEA == null ? '無車位價' : fmtAmount(row.BOSS_PARK_PRICEA)),
    align: 'right',
    sortable: true,
  },
  {
    name: 'BOSS_LAND_PRICEA',
    label: '地價',
    field: (row) => (row.BOSS_LAND_PRICEA == null ? '無地價' : fmtAmount(row.BOSS_LAND_PRICEA)),
    align: 'right',
    sortable: true,
  },
  {
    name: 'AVG_PRICE',
    label: '均價',
    field: (row) => (row.AVG_PRICE == null ? '無均價' : fmtAmount(row.AVG_PRICE)),
    align: 'right',
    sortable: true,
  },
  {
    name: 'BUILD_TYPE',
    label: '樓別',
    field: (row) => row.BUILD_TYPE ?? '無樓別',
    align: 'left',
    sortable: true,
  },
  {
    name: 'APPR_DATE',
    label: '鑑估日',
    field: (row) => toRocDisplay(row.APPR_DATE),
    align: 'left',
    sortable: true,
  },
  {
    name: 'CASE_NAME',
    label: '案名',
    field: (row) => row.CASE_NAME ?? '無案名',
    align: 'left',
    sortable: true,
  },
  {
    name: 'TRADE_AMT',
    label: '買賣價',
    field: (row) => (row.TRADE_AMT == null ? '無買賣價' : fmtAmount(row.TRADE_AMT)),
    align: 'right',
    sortable: true,
  },
  {
    name: 'RENT_PRICE',
    label: '租金',
    field: (row) => (row.RENT_PRICE == null ? '無租金' : fmtAmount(row.RENT_PRICE)),
    align: 'right',
    sortable: true,
  },
]

const visibleColumns = computed(() => {
  if (showApplyId.value) return gridColumnsBase
  return gridColumnsBase.filter((col) => !['APPLY_ID', 'TRADE_DATE', 'TRADE_AMT', 'RENT_PRICE'].includes(col.name))
})

const normalizeResp = (resp) => resp?.data ?? resp

const notifyError = (message) => {
  $q.dialog({ message })
}

const getInputData = () => {
  return {
    APPLY_ID: (APPLY_ID.value || '').toUpperCase(),
    TRADE_DATE_BEG: toY2K(TRADE_DATE_BEG.value || ''),
    TRADE_DATE_END: toY2K(TRADE_DATE_END.value || ''),
    APPR_DATE_BEG: toY2K(APPR_DATE_BEG.value || ''),
    APPR_DATE_END: toY2K(APPR_DATE_END.value || ''),
    USE_AREA1: USE_AREA1.value || '0',
    RST_KIND: RST_KIND.value || '0',
    CITY: CITY.value || '',
    TOWN: TOWN.value || '',
    ADDR_NO: ADDR_NO.value || '',
    LONGITUDE: LONGITUDE.value || '',
    LATITUDE: LATITUDE.value || '',
    EQU_SIGN: EQU_SIGN.value || '',
    FLOOR: FLOOR.value || '',
    USE_FOR: USE_FOR.value || '0',
    BUILD_AGE1: BUILD_AGE1.value || '',
    BUILD_AGE2: BUILD_AGE2.value || '',
    CASE_NAME: CASE_NAME.value || '',
    LAND_MEASURE1: LAND_MEASURE1.value || '',
    LAND_MEASURE2: LAND_MEASURE2.value || '',
    BUILD_MEASURE1: BUILD_MEASURE1.value || '',
    BUILD_MEASURE2: BUILD_MEASURE2.value || '',
    FINISH_DATE_BEG: toY2K(FINISH_DATE_BEG.value || ''),
    FINISH_DATE_END: toY2K(FINISH_DATE_END.value || ''),
    showApplyId: showApplyId.value,
  }
}

const getInputDataForAreaCode = () => {
  return {
    CITY: CITY.value || '',
    TOWN: TOWN.value || '',
    ADDR_NO: ADDR_NO.value || '',
    LONGITUDE: LONGITUDE.value || '',
    LATITUDE: LATITUDE.value || '',
  }
}

const hasOnlyCityTownCondition = () => {
  const req = getInputData()
  const ignore = new Set(['functionSwitch'])

  let hasCityTown = false
  let hasOther = false

  Object.keys(req).forEach((key) => {
    if (ignore.has(key)) return
    const value = req[key]
    const isSelectDefault = ['USE_AREA1', 'RST_KIND', 'USE_FOR'].includes(key) && String(value) === '0'
    if (value == null || value === '' || isSelectDefault) return

    if (key === 'CITY' || key === 'TOWN') {
      hasCityTown = true
    } else if (!['showApplyId'].includes(key)) {
      hasOther = true
    }
  })

  return hasCityTown && !hasOther
}

const checkLandQueryInput = () => {
  const blocked = []
  if (CASE_NAME.value) blocked.push('案名')
  if (FLOOR.value) blocked.push('總樓層')
  if ((USE_FOR.value || '0') !== '0') blocked.push('類別')
  if ((USE_AREA1.value || '0') !== '0') blocked.push('使用分區')
  if ((RST_KIND.value || '0') !== '0') blocked.push('列管區')
  if (BUILD_AGE1.value || BUILD_AGE2.value) blocked.push('屋齡區間')
  if (BUILD_MEASURE1.value || BUILD_MEASURE2.value) blocked.push('建坪')
  if (blocked.length === 0) return true
  notifyError(`土建融案件無法以${blocked.join('、')}查詢資料`)
  return false
}

const checkGroupQueryInput = () => {
  const blocked = []
  if (FLOOR.value) blocked.push('總樓層')
  if ((USE_FOR.value || '0') !== '0') blocked.push('類別')
  if ((USE_AREA1.value || '0') !== '0') blocked.push('使用分區')
  if ((RST_KIND.value || '0') !== '0') blocked.push('列管區')
  if (BUILD_AGE1.value || BUILD_AGE2.value) blocked.push('屋齡區間')
  if (LAND_MEASURE1.value || LAND_MEASURE2.value) blocked.push('地坪')
  if (BUILD_MEASURE1.value || BUILD_MEASURE2.value) blocked.push('建坪')
  if (blocked.length === 0) return true
  notifyError(`整批分戶案件無法以${blocked.join('、')}查詢資料`)
  return false
}

const checkCommunityQueryInput = () => {
  const blocked = []
  if (APPLY_ID.value) blocked.push('受理編號')
  if (FLOOR.value) blocked.push('總樓層')
  if (TRADE_DATE_BEG.value || TRADE_DATE_END.value) blocked.push('買賣日期')
  if (APPR_DATE_BEG.value || APPR_DATE_END.value) blocked.push('鑑價日期')
  if ((USE_FOR.value || '0') !== '0') blocked.push('類別')
  if ((USE_AREA1.value || '0') !== '0') blocked.push('使用分區')
  if ((RST_KIND.value || '0') !== '0') blocked.push('列管區')
  if (BUILD_AGE1.value || BUILD_AGE2.value) blocked.push('屋齡區間')
  if (LAND_MEASURE1.value || LAND_MEASURE2.value) blocked.push('地坪')
  if (BUILD_MEASURE1.value || BUILD_MEASURE2.value) blocked.push('建坪')
  if (blocked.length === 0) return true
  notifyError(`社區資料無法以${blocked.join('、')}查詢資料`)
  return false
}

const ajaxPost = async (actionName, payload) => {
  const resp = await customAxios.post(`/api/${beanName.value}/${actionName}`, payload)
  return normalizeResp(resp)
}

const loadGrid = async (actionName) => {
  try {
    const reqMap = getInputData()
    const resp = await ajaxPost(actionName, { reqMap: JSON.stringify(reqMap) })
    if (isSuccess(resp)) {
      rows.value = resp.rtnList || []
      return
    }
    rows.value = []
  } catch (error) {
    rows.value = []
  }
}

const doPromptQuery = async () => {
  APPLY_ID.value = (APPLY_ID.value || '').toUpperCase()
  try {
    const resp = await ajaxPost('promptQuery', {
      APPLY_ID: APPLY_ID.value,
      showApplyId: showApplyId.value,
    })
    if (isSuccess(resp)) {
      rows.value = resp.rtnList || []
      return
    }
    rows.value = []
  } catch (error) {
    rows.value = []
  }
}

const doQuery = async () => {
  APPLY_ID.value = (APPLY_ID.value || '').toUpperCase()
  currentValid.value = 'valid1'
  const result = await validate()
  if (!result.valid) return

  if (hasOnlyCityTownCondition()) {
    notifyError('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }

  const action = fromPublicBean.value === 'DSA3_2400' ? 'queryByDSA3_0900' : 'query'
  await loadGrid(action)
}

const doLandQuery = async () => {
  APPLY_ID.value = (APPLY_ID.value || '').toUpperCase()
  if (!checkLandQueryInput()) return

  currentValid.value = 'valid1'
  const result = await validate()
  if (!result.valid) return

  if (hasOnlyCityTownCondition()) {
    notifyError('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }

  const action = fromPublicBean.value === 'DSA3_2400' ? 'landQueryByDSA3_0900' : 'landQuery'
  await loadGrid(action)
}

const doGroupQuery = async () => {
  APPLY_ID.value = (APPLY_ID.value || '').toUpperCase()
  if (!checkGroupQueryInput()) return

  currentValid.value = 'valid1'
  const result = await validate()
  if (!result.valid) return

  const action = fromPublicBean.value === 'DSA3_2400' ? 'groupQueryByDSA3_0900' : 'groupQuery'
  await loadGrid(action)
}

const doCommunityQuery = async () => {
  if (!checkCommunityQueryInput()) return

  currentValid.value = 'valid2'
  const result = await validate()
  if (!result.valid) return

  if (hasOnlyCityTownCondition()) {
    notifyError('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }

  const action = fromPublicBean.value === 'DSA3_2400' ? 'communityQueryByDSA3_0900' : 'communityQuery'
  await loadGrid(action)
}

const resetAreaCodeResult = () => {
  areaCodeResult.value = {
    SUBMKT_NAME: '',
    AREA_CODE_930318: '',
    MEMO: '',
  }
}

const doClear = () => {
  resetForm()
  TOWN_LIST.value = []
  rows.value = []
  resetAreaCodeResult()
  setFieldValue('USE_AREA1', '0')
  setFieldValue('RST_KIND', '0')
  setFieldValue('USE_FOR', '0')
  setFieldValue('functionSwitch', viewType.value === 'areaCodeQuery' ? 'r_areaCodeQuery' : 'r_query')
}

const doAreaCodeQuery = async () => {
  currentValid.value = 'valid3'
  resetAreaCodeResult()

  const result = await validate()
  if (!result.valid) return

  if (ADDR_NO.value && !String(ADDR_NO.value).includes('號')) {
    areaCodeResult.value.MEMO = '請輸入完整門牌進行查詢'
    return
  }

  try {
    const reqMap = getInputDataForAreaCode()
    const resp = await ajaxPost('areacodeQuery', { reqMap: JSON.stringify(reqMap) })
    if (isSuccess(resp) && resp.rtnMap) {
      areaCodeResult.value = {
        SUBMKT_NAME: resp.rtnMap.SUBMKT_NAME || '',
        AREA_CODE_930318: resp.rtnMap.AREA_CODE_930318 || '',
        MEMO: resp.rtnMap.MEMO || '',
      }
    }
  } catch (error) {
    resetAreaCodeResult()
  }
}

const switchFunction = (target) => {
  doClear()
  viewType.value = target
  functionSwitch.value = target === 'query' ? 'r_query' : 'r_areaCodeQuery'
}

const doWindowOpen = (record) => {
  // TODO: popupWin.windowOpen('<%=dispatcher%>/'+link+'/prompt', {...})
  // skipCM=true：舊有 popupWin 依賴未翻新，保留錨點待人工處理。
  notifyError(`TODO: 尚未翻新外部開窗依賴，APPLY_ID=${record.APPLY_ID || ''}`)
}

const doGetTownList = async () => {
  TOWN_LIST.value = []
  TOWN.value = ''
  const city = CITY.value || ''
  if (!city) return

  if (townCache.value[city] && townCache.value[city].length > 0) {
    TOWN_LIST.value = townCache.value[city]
    return
  }

  try {
    const resp = await ajaxPost('getTOWN_LIST', { CITY_NAME: city })
    if (isSuccess(resp)) {
      const list = resp.TOWN_LIST || []
      townCache.value = { ...townCache.value, [city]: list }
      TOWN_LIST.value = list
      return
    }
    TOWN_LIST.value = []
  } catch (error) {
    TOWN_LIST.value = []
  }
}

// FIXME: Server-side 資料來源待確認
const doPrompt = async () => {
  const resp = await customAxios.get('/api/DSA3_0900/prompt')
  const data = normalizeResp(resp)

  showApplyId.value = parseShowApplyId(data?.showApplyId)
  fromPublicBean.value = data?.fromPublicBean || route.query.fromPublicBean || ''

  USE_AREA1_LIST.value = data?.USE_AREA1_LIST || []
  RST_KIND_LIST.value = data?.RST_KIND_LIST || []
  CITY_LIST.value = data?.CITY_LIST || []
  EQU_SIGN_LIST.value = data?.EQU_SIGN_LIST || []
  USE_FOR_LIST.value = data?.USE_FOR_LIST || []

  if (route.query.APPLY_ID) {
    APPLY_ID.value = String(route.query.APPLY_ID)
    await doPromptQuery()
  }
}

onMounted(async () => {
  if (route.query.showApplyId != null) {
    showApplyId.value = parseShowApplyId(route.query.showApplyId)
  }

  functionSwitch.value = 'r_query'
  viewType.value = 'query'

  await doPrompt()

  // TODO: PageUI.createPage("DSA30900", "鑑價作業", "擔保品行情查詢", false)
  // TODO: displayMessage()
})

const pageTitle = computed(() => (viewType.value === 'query' ? '擔保品行情查詢' : '承作分區查詢'))

// region TODO

// TODO: <%@ taglib prefix="dz" tagdir="/WEB-INF/tags/csr/dz" %>
const useDzTaglib = () => null

// TODO: <%@ include file="/html/CM/header.jsp" %>
const useHeaderJsp = () => null

// TODO: <%@ include file="/html/CM/msgDisplayer.jsp" %>
const useMsgDisplayerJsp = () => null

// TODO: Event.observe(window, 'resize', fix)
// TODO: Event.observe(window, 'scroll', fix)
const useLegacyFix = () => null

// TODO: new TableUI({ table: $("grid"), ... })
const useLegacyTableUi = () => null

// TODO: popupWin.windowOpen(...)
const usePopupWin = () => null

// TODO: getCalendarFor($(...))
const useLegacyCalendar = () => null

// endregion TODO
</script>

<template>
  <div :style="{ backgroundColor: '#F0FBC6' }" class="q-pa-sm">
    <q-markup-table class="tbBox2" flat bordered dense :style="{ width: '100%', borderSpacing: '1px' }">
      <tbody>
        <tr>
          <td class="tbYellow" colspan="6">
            <q-field dense borderless>
              <div class="row items-center q-gutter-md">
                <label>
                  <q-radio v-model="functionSwitch" name="functionSwitch" val="r_query" dense @update:model-value="switchFunction('query')" />
                  擔保品行情查詢
                </label>
                <label>
                  <q-radio
                    v-model="functionSwitch"
                    name="functionSwitch"
                    val="r_areaCodeQuery"
                    dense
                    @update:model-value="switchFunction('areaCodeQuery')"
                  />
                  承作分區查詢
                </label>
              </div>
            </q-field>
          </td>
          <td class="tbYellow2" align="center" width="10%">
            <div class="column q-gutter-sm items-center">
              <q-btn
                v-if="viewType === 'areaCodeQuery'"
                name="btn_areaCodeQuery"
                class="button ele_for_areaCode_query"
                label="承作分區查詢"
                dense
                unelevated
                @click="doAreaCodeQuery"
              />
              <template v-else>
                <q-btn name="btn_query" class="button ele_for_price_query" label="查詢" dense unelevated @click="doQuery" />
                <q-btn name="btn_landQuery" class="button ele_for_price_query" label="土建融查詢" dense unelevated @click="doLandQuery" />
                <q-btn name="btn_qroupQuery" class="button ele_for_price_query" label="整批分戶查詢" dense unelevated @click="doGroupQuery" />
                <q-btn
                  name="btn_communityQuery"
                  class="button ele_for_price_query"
                  label="社區資料查詢"
                  dense
                  unelevated
                  @click="doCommunityQuery"
                />
              </template>
              <q-btn name="btn_clear" class="button" label="清除" dense unelevated @click="doClear" />
            </div>
          </td>
        </tr>

        <tr v-if="showApplyId && viewType === 'query'">
          <td class="tbYellow">受理編號</td>
          <td class="tbYellow2">
            <q-field dense borderless :error="!!errors.APPLY_ID" :error-message="errors.APPLY_ID">
              <q-input id="APPLY_ID" v-model="APPLY_ID" name="APPLY_ID" class="textBox2 checkInputLength" :maxlength="11" dense outlined />
            </q-field>
          </td>
          <td class="tbYellow">買賣日期</td>
          <td class="tbYellow2" colspan="3">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-field dense borderless :error="!!errors.TRADE_DATE_BEG" :error-message="errors.TRADE_DATE_BEG">
                <q-input v-model="TRADE_DATE_BEG" name="TRADE_DATE_BEG" class="textBox2" :maxlength="7" dense outlined>
                  <template #append>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </q-field>
              <span>~</span>
              <q-field dense borderless :error="!!errors.TRADE_DATE_END" :error-message="errors.TRADE_DATE_END">
                <q-input v-model="TRADE_DATE_END" name="TRADE_DATE_END" class="textBox2" :maxlength="7" dense outlined>
                  <template #append>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </q-field>
            </div>
          </td>
        </tr>

        <tr v-if="viewType === 'query'">
          <td class="tbYellow" width="13%">鑑價日期</td>
          <td class="tbYellow2" width="29%">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-field dense borderless :error="!!errors.APPR_DATE_BEG" :error-message="errors.APPR_DATE_BEG">
                <q-input v-model="APPR_DATE_BEG" name="APPR_DATE_BEG" class="textBox2" :maxlength="7" dense outlined>
                  <template #append>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </q-field>
              <span>~</span>
              <q-field dense borderless :error="!!errors.APPR_DATE_END" :error-message="errors.APPR_DATE_END">
                <q-input v-model="APPR_DATE_END" name="APPR_DATE_END" class="textBox2" :maxlength="7" dense outlined>
                  <template #append>
                    <q-icon name="event" />
                  </template>
                </q-input>
              </q-field>
            </div>
          </td>
          <td class="tbYellow" width="16%">使用分區</td>
          <td class="tbYellow2" width="10%">
            <q-field dense borderless>
              <q-select
                v-model="USE_AREA1"
                name="USE_AREA1"
                class="ele_for_price_query"
                dense
                outlined
                emit-value
                map-options
                option-value="key"
                option-label="value"
                :options="useAreaOptions"
              />
            </q-field>
          </td>
          <td class="tbYellow" width="12%">列管區</td>
          <td class="tbYellow2" width="10%">
            <q-field dense borderless>
              <q-select
                v-model="RST_KIND"
                name="RST_KIND"
                class="ele_for_price_query"
                dense
                outlined
                emit-value
                map-options
                option-value="key"
                option-label="value"
                :options="rstKindOptions"
              />
            </q-field>
          </td>
        </tr>

        <tr>
          <td class="tbYellow">縣市別</td>
          <td class="tbYellow2">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-field dense borderless :error="!!errors.CITY" :error-message="errors.CITY">
                <q-select
                  v-model="CITY"
                  name="CITY"
                  dense
                  outlined
                  emit-value
                  map-options
                  option-value="CITY_NAME"
                  option-label="CITY_NAME"
                  :options="cityOptions"
                  @update:model-value="doGetTownList"
                >
                  <template #selected-item="scope">
                    <span>{{ scope.opt.CITY_NAME || '縣市別' }}</span>
                  </template>
                </q-select>
              </q-field>
              <q-field dense borderless>
                <q-select
                  v-model="TOWN"
                  name="TOWN"
                  dense
                  outlined
                  emit-value
                  map-options
                  option-value="TOWN_NAME"
                  option-label="TOWN_NAME"
                  :options="townOptions"
                >
                  <template #selected-item="scope">
                    <span>{{ scope.opt.TOWN_NAME || '鄉鎮區' }}</span>
                  </template>
                </q-select>
              </q-field>
            </div>
          </td>

          <td class="tbYellow">地址路名門牌</td>
          <td class="tbYellow2" colspan="3">
            <q-field dense borderless :error="!!errors.ADDR_NO" :error-message="errors.ADDR_NO">
              <q-input
                v-model="ADDR_NO"
                name="ADDR_NO"
                class="textBox2"
                :placeholder="viewType === 'areaCodeQuery' ? '請輸入完整門牌' : ''"
                dense
                outlined
              />
            </q-field>
          </td>
        </tr>

        <tr v-if="viewType === 'areaCodeQuery'" class="tr_for_areaCode_query">
          <td class="tbYellow">經度</td>
          <td class="tbYellow2">
            <q-field dense borderless>
              <q-input
                v-model="LONGITUDE"
                name="LONGITUDE"
                class="textBox2 ele_for_areaCode_query"
                placeholder="精確至小數第6位(例:121.553012)"
                dense
                outlined
              />
            </q-field>
          </td>

          <td class="tbYellow">緯度</td>
          <td class="tbYellow2" colspan="3">
            <q-field dense borderless>
              <q-input
                v-model="LATITUDE"
                name="LATITUDE"
                class="textBox2 ele_for_areaCode_query"
                placeholder="精確至小數第6位(例:25.033021)"
                dense
                outlined
              />
            </q-field>
          </td>
        </tr>

        <template v-if="viewType === 'query'">
          <tr class="tr_for_price_query">
            <td class="tbYellow">總樓層</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-field dense borderless>
                  <q-select
                    v-model="EQU_SIGN"
                    name="EQU_SIGN"
                    class="ele_for_price_query"
                    dense
                    outlined
                    emit-value
                    map-options
                    option-value="key"
                    option-label="value"
                    :options="equSignOptions"
                  />
                </q-field>
                <q-field dense borderless :error="!!errors.FLOOR" :error-message="errors.FLOOR">
                  <q-input v-model="FLOOR" name="FLOOR" class="textBox2 validate-digits" dense outlined />
                </q-field>
              </div>
            </td>
            <td class="tbYellow">類別</td>
            <td class="tbYellow2">
              <q-field dense borderless>
                <q-select
                  v-model="USE_FOR"
                  name="USE_FOR"
                  class="ele_for_price_query"
                  dense
                  outlined
                  emit-value
                  map-options
                  option-value="key"
                  option-label="value"
                  :options="useForOptions"
                />
              </q-field>
            </td>
            <td class="tbYellow">屋齡區間</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-field dense borderless :error="!!errors.BUILD_AGE1" :error-message="errors.BUILD_AGE1">
                  <q-input v-model="BUILD_AGE1" name="BUILD_AGE1" class="textBox2 validate-digits validateBetween" dense outlined />
                </q-field>
                <span>~</span>
                <q-field dense borderless :error="!!errors.BUILD_AGE2" :error-message="errors.BUILD_AGE2">
                  <q-input v-model="BUILD_AGE2" name="BUILD_AGE2" class="textBox2 validate-digits validateBetween" dense outlined />
                </q-field>
              </div>
            </td>
          </tr>

          <tr class="tr_for_price_query">
            <td class="tbYellow">案名</td>
            <td class="tbYellow2">
              <q-field dense borderless :error="!!errors.CASE_NAME" :error-message="errors.CASE_NAME">
                <q-input v-model="CASE_NAME" name="CASE_NAME" class="textBox2 ele_for_price_query" dense outlined />
              </q-field>
            </td>
            <td class="tbYellow">地坪</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-field dense borderless :error="!!errors.LAND_MEASURE1" :error-message="errors.LAND_MEASURE1">
                  <q-input
                    v-model="LAND_MEASURE1"
                    name="LAND_MEASURE1"
                    class="textBox2 validate-digits validateBetween"
                    dense
                    outlined
                  />
                </q-field>
                <span>~</span>
                <q-field dense borderless :error="!!errors.LAND_MEASURE2" :error-message="errors.LAND_MEASURE2">
                  <q-input
                    v-model="LAND_MEASURE2"
                    name="LAND_MEASURE2"
                    class="textBox2 validate-digits validateBetween"
                    dense
                    outlined
                  />
                </q-field>
              </div>
            </td>
            <td class="tbYellow">建坪</td>
            <td class="tbYellow2">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-field dense borderless :error="!!errors.BUILD_MEASURE1" :error-message="errors.BUILD_MEASURE1">
                  <q-input
                    v-model="BUILD_MEASURE1"
                    name="BUILD_MEASURE1"
                    class="textBox2 validate-digits validateBetween"
                    dense
                    outlined
                  />
                </q-field>
                <span>~</span>
                <q-field dense borderless :error="!!errors.BUILD_MEASURE2" :error-message="errors.BUILD_MEASURE2">
                  <q-input
                    v-model="BUILD_MEASURE2"
                    name="BUILD_MEASURE2"
                    class="textBox2 validate-digits validateBetween"
                    dense
                    outlined
                  />
                </q-field>
              </div>
            </td>
          </tr>

          <tr class="tr_for_price_query">
            <td class="tbYellow">建築完成日</td>
            <td class="tbYellow2" colspan="5">
              <div class="row items-center no-wrap q-gutter-sm">
                <q-field dense borderless :error="!!errors.FINISH_DATE_BEG" :error-message="errors.FINISH_DATE_BEG">
                  <q-input v-model="FINISH_DATE_BEG" name="FINISH_DATE_BEG" class="textBox2" :maxlength="7" dense outlined>
                    <template #append>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </q-field>
                <span>~</span>
                <q-field dense borderless :error="!!errors.FINISH_DATE_END" :error-message="errors.FINISH_DATE_END">
                  <q-input v-model="FINISH_DATE_END" name="FINISH_DATE_END" class="textBox2" :maxlength="7" dense outlined>
                    <template #append>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </q-field>
              </div>
            </td>
          </tr>

          <tr>
            <td class="tbYellow2" colspan="7">
              ※<span class="text-red">＊＊</span>表示擔保品有增建情形。
              <span class="text-blue">＠＠</span>表示同一編號含兩筆以上門牌(主建號)。
              <span class="text-green">＄＄</span>表示擔保品為非承作區或列管區。
            </td>
          </tr>
        </template>
      </tbody>
    </q-markup-table>

    <div class="q-mt-md">
      <div class="text-subtitle1 q-mb-sm">{{ pageTitle }}</div>
      <q-table
        v-if="viewType === 'query'"
        class="grid"
        flat
        bordered
        dense
        row-key="APPLY_ID"
        :rows="rows"
        :columns="visibleColumns"
        v-model:pagination="pagination"
      >
        <template #body-cell-APPLY_ID="props">
          <q-td :props="props">
            <a href="#" @click.prevent="doWindowOpen(props.row)">{{ props.row.APPLY_ID }}</a>
          </q-td>
        </template>
      </q-table>
    </div>

    <q-markup-table v-if="viewType === 'areaCodeQuery'" id="tableC" class="tbBox2 q-mt-md" flat bordered dense>
      <thead>
        <tr>
          <th colspan="2" align="left">承作分區查詢結果</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="tbBlue" width="50%" align="center">所在生活圈</td>
          <td class="tbYellow2">{{ areaCodeResult.SUBMKT_NAME }}</td>
        </tr>
        <tr>
          <td class="tbBlue" align="center">承作分區</td>
          <td class="tbYellow2">{{ areaCodeResult.AREA_CODE_930318 }}</td>
        </tr>
        <tr>
          <td class="tbBlue" align="center">備註</td>
          <td class="tbYellow2">{{ areaCodeResult.MEMO }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>
