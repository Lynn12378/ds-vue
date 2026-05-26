<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { object, string, number } from 'yup'
import '@/assets/libs/CathayValidateRules.js'
import customAxios from '@/assets/libs/axios/instance.js'
import { usePageUIAdapter } from '@/assets/composables/usePageUIAdapter.js'
import PageUILayout from '@/components/common/page/PageUILayout.vue'
import { usePopupWinAdapter } from '@/assets/composables/usePopupWinAdapter.js'
import PopupWinDialog from '@/components/common/modals/PopupWinDialog.vue'
import TableUI from '@/components/common/table/TableUI.vue'
import ROCDatePicker from '@/components/common/ROCDatePicker.vue'
import useCommon from '@/assets/utils/common.js'
import { numberAddComma } from '@/assets/utils/format.js'

// ─── PageUI ─────────────────────────────────────────────────────────────────

const pageUI = usePageUIAdapter()
pageUI.createPage('DSA30900', '鑑價作業', '擔保品行情查詢', false)
pageUI.loadin(['form1', 'grid', 'tableC'], 1)

// ─── Router ──────────────────────────────────────────────────────────────────

const route = useRoute()

// ─── popupWin ────────────────────────────────────────────────────────────────

const popupWin = usePopupWinAdapter()

// ─── Server-side 資料補償 ──────────────────────────────────────────────────────

// ${showApplyId}
const showApplyId = ref(true)
// ${fromPublicBean}
const fromPublicBean = ref('')
// ${USE_AREA1_LIST}
const useArea1List = ref([])
// ${RST_KIND_LIST}
const rstKindList = ref([])
// ${CITY_LIST}
const cityList = ref([])
// ${EQU_SIGN_LIST}
const equSignList = ref([])
// ${USE_FOR_LIST}
const useForList = ref([])

const doPrompt = async () => {
  const resp = await customAxios.get('DSA3_0900/prompt')
  // FIXME: 資料來源待確認
  showApplyId.value = resp.showApplyId
  fromPublicBean.value = resp.fromPublicBean
  useArea1List.value = resp.USE_AREA1_LIST?.map(m => ({ label: m.key === '0' ? '全部' : m.value, value: m.key })) ?? []
  rstKindList.value = resp.RST_KIND_LIST?.map(m => ({ label: m.key === '0' ? '全部' : m.value, value: m.key })) ?? []
  cityList.value = resp.CITY_LIST?.map(m => ({ label: m.CITY_NAME, value: m.CITY_NAME })) ?? []
  equSignList.value = resp.EQU_SIGN_LIST?.map(m => ({ label: m.value, value: m.key })) ?? []
  useForList.value = resp.USE_FOR_LIST?.map(m => ({ label: m.key === '0' ? '全部' : m.value, value: m.key })) ?? []
}

// ─── TableUI ──────────────────────────────────────────────────────────────────

const tableRef = ref(null)

const AMT_FORMAT = '#,###.####'

// FIXME: column.attrs.rowSpan 及 column.split 屬性無 tableUI.instructions.md 明確對應，需人工確認是否等價
const baseGridColumns = [
  {
    label: '編號', field: 'APPLY_ID', name: 'APPLY_ID',
    sortable: true, style: 'width:10%',
  },
  {
    label: '地址', field: 'ADDRESS', name: 'ADDRESS',
    sortable: true, align: 'left',
  },
  { label: '地坪', field: 'LAND_MEASURE', name: 'LAND_MEASURE', sortable: true },
  { label: '車位型態', field: 'PARK_NM', name: 'PARK_NM', sortable: true },
  { label: '單價', field: 'BOSS_PER_PRICEA', name: 'BOSS_PER_PRICEA', sortable: true },
  { label: '總價', field: 'BOSS_TOTAL_PRICEA', name: 'BOSS_TOTAL_PRICEA', sortable: true },
  { label: '總樓層', field: 'FLOOR', name: 'FLOOR', sortable: true },
  { label: '建築日', field: 'FINISH_DATE', name: 'FINISH_DATE', sortable: true },
  { label: '類別', field: 'USE_FOR_NM', name: 'USE_FOR_NM', sortable: true },
  { label: '買賣日', field: 'TRADE_DATE', name: 'TRADE_DATE', sortable: true },
  { label: '屋齡', field: 'BUILD_AGE', name: 'BUILD_AGE', sortable: true },
  { label: '建坪', field: 'BUILD_MEASURE', name: 'BUILD_MEASURE', sortable: true },
  { label: '車位價', field: 'BOSS_PARK_PRICEA', name: 'BOSS_PARK_PRICEA', sortable: true },
  { label: '地價', field: 'BOSS_LAND_PRICEA', name: 'BOSS_LAND_PRICEA', sortable: true },
  { label: '均價', field: 'AVG_PRICE', name: 'AVG_PRICE', sortable: true },
  { label: '樓別', field: 'BUILD_TYPE', name: 'BUILD_TYPE', sortable: true },
  { label: '鑑估日', field: 'APPR_DATE', name: 'APPR_DATE', sortable: true },
  { label: '案名', field: 'CASE_NAME', name: 'CASE_NAME', sortable: true },
  { label: '買賣價', field: 'TRADE_AMT', name: 'TRADE_AMT', sortable: true },
  { label: '租金', field: 'RENT_PRICE', name: 'RENT_PRICE', sortable: true },
]

// FIXME: showApplyId 為 false 時需移除 APPLY_ID、TRADE_DATE、BUILD_AGE（重構為不含 rowSpan 版本）欄位，並將 RENT_PRICE 移除，依原 JSP gridColumn.slice(1, length-2) 邏輯改寫為 computed
const gridColumns = computed(() => {
  if (!showApplyId.value) {
    return baseGridColumns.filter(col =>
      !['APPLY_ID', 'TRADE_DATE', 'BUILD_AGE', 'TRADE_AMT', 'RENT_PRICE'].includes(col.field)
    )
  }
  return baseGridColumns
})

// ─── 鄉鎮區快取 ────────────────────────────────────────────────────────────────

const townMap = ref({})
const townOptions = ref([{ label: '鄉鎮區', value: '' }])

// ─── 畫面切換狀態 ────────────────────────────────────────────────────────────────

// view_type
const viewType = ref('query')

// 承作分區查詢結果
const submktName = ref('')
const areaCode930318 = ref('')
const memo = ref('')

// addrNo placeholder
const addrNoPlaceholder = computed(() => viewType.value === 'areaCodeQuery' ? '請輸入完整門牌' : '')

// FIXME: showApplyId 控制按鈕 rowSpan（原 $('A1_TD_BTN').rowSpan = btnRowSpan），Vue 無直接 DOM rowSpan 控制，待人工確認是否以 :rowspan binding 或 CSS 取代
const btnRowSpan = computed(() => {
  if (viewType.value === 'r_query' || viewType.value === 'query') {
    return showApplyId.value ? 7 : 6
  }
  return 3
})

// ─── 表單驗證 ──────────────────────────────────────────────────────────────────

// FIXME: 改寫自 validateBetween，需人工確認邏輯等價
const validateBetween = (val1, val2) => {
  const v1 = parseInt(val1, 10)
  const v2 = parseInt(val2, 10)
  if (isNaN(v1) || isNaN(v2)) return true
  return v2 >= v1
}

// FIXME: 改寫自 validateAddr_No，需人工確認邏輯等價
const validateAddrNo = (applyIdVal, cityVal, addrNoVal) => {
  if (!applyIdVal && (!addrNoVal || addrNoVal === '') && (!cityVal || cityVal === '')) {
    return false
  }
  return true
}

// FIXME: 改寫自 validateCase_Name，需人工確認邏輯等價
const validateCaseName = (cityVal, caseNameVal) => {
  if ((!caseNameVal || caseNameVal === '') && (!cityVal || cityVal === '')) {
    return false
  }
  return true
}

// FIXME: 改寫自 validateAddrAndLon，需人工確認邏輯等價
const validateAddrAndLon = (addrNoVal, longitudeVal, latitudeVal) => {
  if ((!addrNoVal || addrNoVal === '') && ((!longitudeVal || longitudeVal === '') || (!latitudeVal || latitudeVal === ''))) {
    return false
  }
  if ((addrNoVal && addrNoVal !== '') && ((longitudeVal && longitudeVal !== '') || (latitudeVal && latitudeVal !== ''))) {
    return false
  }
  return true
}

// FIXME: 改寫自 validateFullAddrNo，需人工確認邏輯等價
const validateFullAddrNoFn = (addrNoVal) => {
  if (addrNoVal && addrNoVal !== '') {
    if (addrNoVal.indexOf('號') < 0) {
      memo.value = '請輸入完整門牌進行查詢'
      return false
    }
    return true
  }
  return true
}

// FIXME: JSP 使用三個 Validation 實例 (valid1, valid2, valid3) 各自驗證不同欄位子集
//        valid1：query / landQuery / groupQuery 使用
//        valid2：communityQuery 使用
//        valid3：areaCodeQuery 使用
//        VeeValidate 為單一 schema，以下合併所有規則，需人工確認各 query 方法的驗證分段邏輯是否等價
const schema = object({
  // APPLY_ID
  applyId: string().max(11),
  // TRADE_DATE_BEG
  tradeDateBeg: string().validateROCDate(),
  // TRADE_DATE_END
  tradeDateEnd: string().validateROCDate(),
  // APPR_DATE_BEG
  apprDateBeg: string().validateROCDate(),
  // APPR_DATE_END
  apprDateEnd: string().validateROCDate(),
  // USE_AREA1
  useArea1: string(),
  // RST_KIND
  rstKind: string(),
  // CITY (valid1 validateAddr_No)
  city: string()
    .test('validateAddr_No', '地址路名門牌與縣市別需擇一輸入', function (val) {
      return validateAddrNo(this.parent.applyId, val, this.parent.addrNo)
    })
    .test('validateCase_Name', '案名與縣市別需擇一輸入', function (val) {
      return validateCaseName(val, this.parent.caseName)
    }),
  // TOWN
  town: string(),
  // ADDR_NO (valid1 validateAddr_No, valid3 validateAddrAndLon + validateFullAddrNo)
  addrNo: string()
    .test('validateAddr_No', '地址路名門牌與縣市別需擇一輸入', function (val) {
      return validateAddrNo(this.parent.applyId, this.parent.city, val)
    })
    .test('validateAddrAndLon', '【地址路名門牌】與【經度、緯度】需擇一輸入', function (val) {
      return validateAddrAndLon(val, this.parent.longitude, this.parent.latitude)
    })
    .test('validateFullAddrNo', '使用地址查詢，請輸入完整門牌', function (val) {
      return validateFullAddrNoFn(val)
    }),
  // LONGITUDE
  longitude: string(),
  // LATITUDE
  latitude: string(),
  // EQU_SIGN
  equSign: string(),
  // FLOOR
  floor: number().positive().integer(),
  // USE_FOR
  useFor: string(),
  // BUILD_AGE1
  buildAge1: number().positive().integer(),
  // BUILD_AGE2
  buildAge2: number().positive().integer()
    .test('validateBetween', '迄值不得小於起值', function (val) {
      return validateBetween(this.parent.buildAge1, val)
    }),
  // CASE_NAME (valid2 validateCase_Name)
  caseName: string()
    .test('validateCase_Name', '案名與縣市別需擇一輸入', function (val) {
      return validateCaseName(this.parent.city, val)
    }),
  // LAND_MEASURE1
  landMeasure1: number().positive().integer(),
  // LAND_MEASURE2
  landMeasure2: number().positive().integer()
    .test('validateBetween', '迄值不得小於起值', function (val) {
      return validateBetween(this.parent.landMeasure1, val)
    }),
  // BUILD_MEASURE1
  buildMeasure1: number().positive().integer(),
  // BUILD_MEASURE2
  buildMeasure2: number().positive().integer()
    .test('validateBetween', '迄值不得小於起值', function (val) {
      return validateBetween(this.parent.buildMeasure1, val)
    }),
  // FINISH_DATE_BEG
  finishDateBeg: string().validateROCDate(),
  // FINISH_DATE_END
  finishDateEnd: string().validateROCDate(),
})

const { errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    functionSwitch: 'r_query',
    applyId: '',
    tradeDateBeg: '', tradeDateEnd: '',
    apprDateBeg: '', apprDateEnd: '',
    useArea1: '0', rstKind: '0',
    city: '', town: '',
    addrNo: '', longitude: '', latitude: '',
    equSign: '=',
    floor: '',
    useFor: '0',
    buildAge1: '', buildAge2: '',
    caseName: '',
    landMeasure1: '', landMeasure2: '',
    buildMeasure1: '', buildMeasure2: '',
    finishDateBeg: '', finishDateEnd: '',
  },
  validateOnMount: false,
})

// FUNCTIONSWITCH
const { value: functionSwitch } = useField('functionSwitch')
// APPLY_ID
const { value: applyId } = useField('applyId')
// TRADE_DATE_BEG
const { value: tradeDateBeg } = useField('tradeDateBeg')
// TRADE_DATE_END
const { value: tradeDateEnd } = useField('tradeDateEnd')
// APPR_DATE_BEG
const { value: apprDateBeg } = useField('apprDateBeg')
// APPR_DATE_END
const { value: apprDateEnd } = useField('apprDateEnd')
// USE_AREA1
const { value: useArea1 } = useField('useArea1')
// RST_KIND
const { value: rstKind } = useField('rstKind')
// CITY
const { value: city } = useField('city')
// TOWN
const { value: town } = useField('town')
// ADDR_NO
const { value: addrNo } = useField('addrNo')
// LONGITUDE
const { value: longitude } = useField('longitude')
// LATITUDE
const { value: latitude } = useField('latitude')
// EQU_SIGN
const { value: equSign } = useField('equSign')
// FLOOR
const { value: floor } = useField('floor')
// USE_FOR
const { value: useFor } = useField('useFor')
// BUILD_AGE1
const { value: buildAge1 } = useField('buildAge1')
// BUILD_AGE2
const { value: buildAge2 } = useField('buildAge2')
// CASE_NAME
const { value: caseName } = useField('caseName')
// LAND_MEASURE1
const { value: landMeasure1 } = useField('landMeasure1')
// LAND_MEASURE2
const { value: landMeasure2 } = useField('landMeasure2')
// BUILD_MEASURE1
const { value: buildMeasure1 } = useField('buildMeasure1')
// BUILD_MEASURE2
const { value: buildMeasure2 } = useField('buildMeasure2')
// FINISH_DATE_BEG
const { value: finishDateBeg } = useField('finishDateBeg')
// FINISH_DATE_END
const { value: finishDateEnd } = useField('finishDateEnd')

// ─── 共用資料收集 ────────────────────────────────────────────────────────────────

const getInputData = () => {
  const dataMap = {
    APPLY_ID: applyId.value,
    TRADE_DATE_BEG: useCommon().tranCEorROCDate(tradeDateBeg.value, 'ceDate'),
    TRADE_DATE_END: useCommon().tranCEorROCDate(tradeDateEnd.value, 'ceDate'),
    APPR_DATE_BEG: useCommon().tranCEorROCDate(apprDateBeg.value, 'ceDate'),
    APPR_DATE_END: useCommon().tranCEorROCDate(apprDateEnd.value, 'ceDate'),
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
    FINISH_DATE_BEG: useCommon().tranCEorROCDate(finishDateBeg.value, 'ceDate'),
    FINISH_DATE_END: useCommon().tranCEorROCDate(finishDateEnd.value, 'ceDate'),
    showApplyId: showApplyId.value,
  }
  return dataMap
}

const getInputData4AreaCodeQuery = () => {
  return {
    CITY: city.value,
    TOWN: town.value,
    ADDR_NO: addrNo.value,
    LONGITUDE: longitude.value,
    LATITUDE: latitude.value,
  }
}

// ─── 城市/縣市別只有城市時的輸入條件驗證 ────────────────────────────────────────────

const hasOnlyCityTown = (includeExtraFields) => {
  // 檢核當查詢條件只有縣市別時，至少要輸入另一個查詢條件
  const dataMap = getInputData()
  const hasDefaultValueField = ['r_areaCodeQuery', 'r_query']
  let hasCityTown = false
  let hasOtherField = false
  const checkKeys = includeExtraFields
    ? Object.keys(dataMap)
    : ['APPLY_ID', 'TRADE_DATE_BEG', 'TRADE_DATE_END', 'APPR_DATE_BEG', 'APPR_DATE_END', 'ADDR_NO', 'FLOOR', 'BUILD_AGE1', 'BUILD_AGE2', 'LAND_MEASURE1', 'LAND_MEASURE2', 'BUILD_MEASURE1', 'BUILD_MEASURE2', 'FINISH_DATE_BEG', 'FINISH_DATE_END', 'CASE_NAME', 'USE_AREA1', 'RST_KIND', 'USE_FOR', 'EQU_SIGN', 'CITY', 'TOWN']
  for (const key of checkKeys) {
    const val = dataMap[key]
    if (key === 'TOWN' || key === 'CITY') {
      if (val && val !== '') hasCityTown = true
    } else if (!hasDefaultValueField.includes(key)) {
      const isDefaultSelectValue = ['USE_AREA1', 'RST_KIND', 'USE_FOR'].includes(key) && val === '0'
      const isEmptyEqu = key === 'EQU_SIGN'
      if (!isDefaultSelectValue && !isEmptyEqu && val && val !== '') hasOtherField = true
    }
    if (hasOtherField) break
  }
  return hasCityTown && !hasOtherField
}

// ─── AJAX 共用 ────────────────────────────────────────────────────────────────

// FIXME: 改寫自 ajaxPost；beanName 由 fromPublicBean 動態決定
const ajaxPost = async (actionName, params, successAction, errorAction) => {
  const beanName = fromPublicBean.value === 'DSA3_2400' ? fromPublicBean.value : 'DSA3_0900'
  try {
    const resp = await customAxios.post(`${beanName}/${actionName}`, params)
    if (resp?.ErrMsg?.returnCode === 0) {
      if (successAction) successAction(resp)
    } else if (errorAction) {
      errorAction(resp)
    }
  } catch {
    if (errorAction) errorAction()
  }
}

// ─── 輸入條件業務檢核 ────────────────────────────────────────────────────────────

const checkInput = {
  landQuery() {
    let str = ''
    // 案名、總樓層
    for (const [id, fieldName] of [['CASE_NAME', '案名'], ['FLOOR', '總樓層']]) {
      const val = id === 'CASE_NAME' ? caseName.value : floor.value
      if (val && val !== '') str += fieldName + '、'
    }
    // 類別、使用分區、列管區
    const selectMap = { USE_FOR: useFor.value, USE_AREA1: useArea1.value, RST_KIND: rstKind.value }
    const selectFieldNames = { USE_FOR: '類別', USE_AREA1: '使用分區', RST_KIND: '列管區' }
    for (const key of ['USE_FOR', 'USE_AREA1', 'RST_KIND']) {
      if (selectMap[key] !== '0') str += selectFieldNames[key] + '、'
    }
    // 屋齡區間、建坪
    for (const [key, useKindName] of [['BUILD_AGE', '屋齡區間'], ['BUILD_MEASURE', '建坪']]) {
      const v1 = key === 'BUILD_AGE' ? buildAge1.value : buildMeasure1.value
      const v2 = key === 'BUILD_AGE' ? buildAge2.value : buildMeasure2.value
      if ((v1 && v1 !== '') || (v2 && v2 !== '')) str += useKindName + '、'
    }
    if (str === '') return true
    alert('土建融案件無法以' + str.substring(0, str.length - 1) + '查詢資料')
    return false
  },

  groupQuery() {
    let str = ''
    // 總樓層
    if (floor.value && floor.value !== '') str += '總樓層、'
    // 類別、使用分區、列管區
    const selectMap = { USE_FOR: useFor.value, USE_AREA1: useArea1.value, RST_KIND: rstKind.value }
    const selectFieldNames = { USE_FOR: '類別', USE_AREA1: '使用分區', RST_KIND: '列管區' }
    for (const key of ['USE_FOR', 'USE_AREA1', 'RST_KIND']) {
      if (selectMap[key] !== '0') str += selectFieldNames[key] + '、'
    }
    // 屋齡區間、地坪、建坪
    for (const [key, useKindName] of [['BUILD_AGE', '屋齡區間'], ['LAND_MEASURE', '地坪'], ['BUILD_MEASURE', '建坪']]) {
      let v1, v2
      if (key === 'BUILD_AGE') { v1 = buildAge1.value; v2 = buildAge2.value }
      else if (key === 'LAND_MEASURE') { v1 = landMeasure1.value; v2 = landMeasure2.value }
      else { v1 = buildMeasure1.value; v2 = buildMeasure2.value }
      if ((v1 && v1 !== '') || (v2 && v2 !== '')) str += useKindName + '、'
    }
    if (str === '') return true
    alert('整批分戶案件無法以' + str.substring(0, str.length - 1) + '查詢資料')
    return false
  },

  communityQuery() {
    let str = ''
    // 受理編號、總樓層、買賣日期、鑑價日期
    const fieldMap = [
      [applyId.value, '受理編號'],
      [floor.value, '總樓層'],
      [tradeDateBeg.value, '買賣日期(起)'],
      [tradeDateEnd.value, '買賣日期(訖)'],
      [apprDateBeg.value, '鑑價日期(起)'],
      [apprDateEnd.value, '鑑價日期(訖)'],
    ]
    for (const [val, name] of fieldMap) {
      if (val && val !== '') str += name + '、'
    }
    // 類別、使用分區、列管區
    const selectMap = { USE_FOR: useFor.value, USE_AREA1: useArea1.value, RST_KIND: rstKind.value }
    const selectFieldNames = { USE_FOR: '類別', USE_AREA1: '使用分區', RST_KIND: '列管區' }
    for (const key of ['USE_FOR', 'USE_AREA1', 'RST_KIND']) {
      if (selectMap[key] !== '0') str += selectFieldNames[key] + '、'
    }
    // 屋齡區間、地坪、建坪
    for (const [key, useKindName] of [['BUILD_AGE', '屋齡區間'], ['LAND_MEASURE', '地坪'], ['BUILD_MEASURE', '建坪']]) {
      let v1, v2
      if (key === 'BUILD_AGE') { v1 = buildAge1.value; v2 = buildAge2.value }
      else if (key === 'LAND_MEASURE') { v1 = landMeasure1.value; v2 = landMeasure2.value }
      else { v1 = buildMeasure1.value; v2 = buildMeasure2.value }
      if ((v1 && v1 !== '') || (v2 && v2 !== '')) str += useKindName + '、'
    }
    if (str === '') return true
    alert('社區資料無法以' + str.substring(0, str.length - 1) + '查詢資料')
    return false
  },
}

// ─── Actions ─────────────────────────────────────────────────────────────────

// 初始查詢
const doPromptQuery = () => {
  applyId.value = (applyId.value || '').toUpperCase()
  ajaxPost(
    'promptQuery',
    { APPLY_ID: applyId.value, showApplyId: showApplyId.value },
    (resp) => { tableRef.value?.load(resp.rtnList ?? []) },
    () => { tableRef.value?.load([]) },
  )
}

// 查詢
const doQuery = async () => {
  applyId.value = (applyId.value || '').toUpperCase()
  const { valid } = await validate()
  if (!valid) return
  if (hasOnlyCityTown(false)) {
    alert('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }
  const reqMap = getInputData()
  const actionName = fromPublicBean.value === 'DSA3_2400' ? 'queryByDSA3_0900' : 'query'
  ajaxPost(
    actionName,
    { reqMap: JSON.stringify(reqMap) },
    (resp) => { tableRef.value?.load(resp.rtnList ?? []) },
    () => { tableRef.value?.load([]) },
  )
}

// 土建融查詢
const doLandQuery = async () => {
  applyId.value = (applyId.value || '').toUpperCase()
  if (!checkInput.landQuery()) return
  const { valid } = await validate()
  if (!valid) return
  if (hasOnlyCityTown(false)) {
    alert('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }
  const reqMap = getInputData()
  const actionName = fromPublicBean.value === 'DSA3_2400' ? 'landQueryByDSA3_0900' : 'landQuery'
  ajaxPost(
    actionName,
    { reqMap: JSON.stringify(reqMap) },
    (resp) => { tableRef.value?.load(resp.rtnList ?? []) },
    () => { tableRef.value?.load([]) },
  )
}

// 整批分戶查詢
const doGroupQuery = async () => {
  applyId.value = (applyId.value || '').toUpperCase()
  if (!checkInput.groupQuery()) return
  const { valid } = await validate()
  if (!valid) return
  const reqMap = getInputData()
  const actionName = fromPublicBean.value === 'DSA3_2400' ? 'groupQueryByDSA3_0900' : 'groupQuery'
  ajaxPost(
    actionName,
    { reqMap: JSON.stringify(reqMap) },
    (resp) => { tableRef.value?.load(resp.rtnList ?? []) },
    () => { tableRef.value?.load([]) },
  )
}

// 社區資料查詢
const doCommunityQuery = async () => {
  if (!checkInput.communityQuery()) return
  const { valid } = await validate()
  if (!valid) return
  // 檢核當查詢條件只有縣市別(CITY、TOWN)時，至少要輸入另一個查詢條件
  const chkMap = {}
  if (city.value && city.value !== '') chkMap['CITY'] = city.value
  if (town.value && town.value !== '') chkMap['TOWN'] = town.value
  if (addrNo.value && addrNo.value !== '') chkMap['ADDR_NO'] = addrNo.value
  if (caseName.value && caseName.value !== '') chkMap['CASE_NAME'] = caseName.value
  if (Object.keys(chkMap).length === 2 && 'CITY' in chkMap && 'TOWN' in chkMap) {
    alert('當查詢條件只有縣市別時，至少要輸入另一個查詢條件')
    return
  }
  const reqMap = getInputData()
  const actionName = fromPublicBean.value === 'DSA3_2400' ? 'communityQueryByDSA3_0900' : 'communityQuery'
  ajaxPost(
    actionName,
    { reqMap: JSON.stringify(reqMap) },
    (resp) => { tableRef.value?.load(resp.rtnList ?? []) },
    () => { tableRef.value?.load([]) },
  )
}

// 清除
const doClear = () => {
  resetForm()
  townOptions.value = [{ label: '鄉鎮区', value: '' }]
  resetTableC()
}

// 編號超連結
const doWindowOpen = (QUERY_TYPE, APPLY_ID) => {
  if (QUERY_TYPE === '4') {
    popupWin.windowOpen(`DSA3_3310/prompt`, {
      parameters: { COMMUNITY_NO: APPLY_ID },
      windowName: APPLY_ID.replace('@', ''),
    })
  } else {
    let link = ''
    if (QUERY_TYPE === '1') link = 'DSA3_0500'
    else if (QUERY_TYPE === '2') link = 'DSA3_0600'
    else if (QUERY_TYPE === '3') link = 'DSA3_0700'
    else return
    popupWin.windowOpen(`${link}/prompt`, {
      parameters: { APPLY_ID: APPLY_ID },
      windowName: APPLY_ID.replace('@', ''),
    })
  }
}

// 取得鄉鎮區
const doGetTownList = () => {
  townOptions.value = [{ label: '鄉鎮區', value: '' }]
  town.value = ''
  const val = city.value
  if (!val || val === '') return
  if (townMap.value[val] && townMap.value[val].length > 0) {
    townOptions.value = [
      { label: '鄉鎮區', value: '' },
      ...townMap.value[val].map(o => ({ label: o.TOWN_NAME, value: o.TOWN_NAME })),
    ]
  } else {
    ajaxPost(
      'getTOWN_LIST',
      { CITY_NAME: val },
      (resp) => {
        townMap.value[val] = resp.TOWN_LIST ?? []
        townOptions.value = [
          { label: '鄉鎮區', value: '' },
          ...(resp.TOWN_LIST ?? []).map(o => ({ label: o.TOWN_NAME, value: o.TOWN_NAME })),
        ]
      },
    )
  }
}

// 切換承作分區查詢
const functionSwitch_fn = (text) => {
  doClear()
  if (text === 'r_query') {
    viewType.value = 'query'
    // FIXME: $$('.contentsTh span')[0].innerHTML = '擔保品行情查詢' 改以 pageUI.setSubTitle() 取代
    pageUI.setSubTitle('擔保品行情查詢')
  } else if (text === 'r_areaCodeQuery') {
    viewType.value = 'areaCodeQuery'
    pageUI.setSubTitle('承作分區查詢')
  }
  functionSwitch.value = text
}

// 承作分區查詢
const doAreaCodeQuery = async () => {
  resetTableC()
  const { valid } = await validate()
  if (!valid) return
  const reqMap = getInputData4AreaCodeQuery()
  ajaxPost(
    'areacodeQuery',
    { reqMap: JSON.stringify(reqMap) },
    (resp) => { setAreaCodeResult(resp.rtnMap) },
    () => { setAreaCodeResult() },
  )
}

// reset 承作分區查詢結果
const resetTableC = () => {
  submktName.value = ''
  areaCode930318.value = ''
  memo.value = ''
}

// 取得承作分區查詢結果
const setAreaCodeResult = (map) => {
  if (map) {
    submktName.value = map.SUBMKT_NAME ?? ''
    areaCode930318.value = map.AREA_CODE_930318 ?? ''
    memo.value = map.MEMO ?? ''
  } else {
    submktName.value = ''
    areaCode930318.value = ''
    memo.value = ''
  }
}

// ─── onMounted ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await doPrompt()
  functionSwitch_fn('r_query')

  // ${param.APPLY_ID}
  if (route.query.APPLY_ID && route.query.APPLY_ID !== '') {
    applyId.value = route.query.APPLY_ID
    doPromptQuery()
  }

  useMsgDisplayer().displayMessage()
})

// ─── region Fallback Composables ──────────────────────────────────────────────

const useMsgDisplayer = () => {
  // TODO: displayMessage 來自 /html/CM/msgDisplayer.jsp include，無對應翻新文件，待人工實作
  const displayMessage = () => void 0
  return { displayMessage }
}

// endregion
</script>

<template>
  <PageUILayout
    :page-no="pageUI.state.pageMeta.pageNo"
    :title="pageUI.state.pageMeta.title"
    :sub-title="pageUI.state.pageMeta.subTitle"
    :no-page-frame="pageUI.state.pageMeta.noPageFrame"
    :blocks="pageUI.state.loadinBlocks"
    :fixed-num="pageUI.state.fixedNum"
  />

  <!-- A區 -->
  <form id="form1" name="form1" method="post">
    <table :style="{ width: '100%', border: '0', borderCollapse: 'collapse' }" class="tbBox2" id="tableA">
      <tr>
        <td class="tbYellow" colspan="6">
          <!-- FIXME: radio 群組改為 q-field + q-radio，需人工確認 functionSwitch 事件觸發邏輯等價 -->
          <q-field dense outlined>
            <template #control>
              <q-radio
                v-model="functionSwitch"
                name="functionSwitch"
                val="r_query"
                label="擔保品行情查詢"
                @update:model-value="functionSwitch_fn('r_query')"
              />
              <q-radio
                v-model="functionSwitch"
                name="functionSwitch"
                val="r_areaCodeQuery"
                label="承作分區查詢"
                @update:model-value="functionSwitch_fn('r_areaCodeQuery')"
              />
            </template>
          </q-field>
        </td>
        <!-- FIXME: rowSpan 動態控制（原 $('A1_TD_BTN').rowSpan = btnRowSpan）無法直接以 :rowspan 綁定，待人工確認 -->
        <td class="tbYellow2" :rowspan="btnRowSpan" :style="{ textAlign: 'center', width: '10%' }" id="A1_TD_BTN">
          <q-btn
            id="btn_areaCodeQuery"
            name="btn_areaCodeQuery"
            :style="{ width: '90px' }"
            dense
            label="承作分區查詢"
            class="button ele_for_areaCode_query"
            v-show="viewType === 'areaCodeQuery'"
            @click="doAreaCodeQuery"
          />
          <q-btn
            id="btn_query"
            name="btn_query"
            dense
            label="查詢"
            class="button ele_for_price_query"
            v-show="viewType === 'query'"
            @click="doQuery"
          />
          <q-btn
            id="btn_landQuery"
            name="btn_landQuery"
            :style="{ width: '90px' }"
            dense
            label="土建融查詢"
            class="button ele_for_price_query"
            v-show="viewType === 'query'"
            @click="doLandQuery"
          />
          <q-btn
            id="btn_qroupQuery"
            name="btn_qroupQuery"
            :style="{ width: '90px' }"
            dense
            label="整批分戶查詢"
            class="button ele_for_price_query"
            v-show="viewType === 'query'"
            @click="doGroupQuery"
          />
          <q-btn
            id="btn_communityQuery"
            name="btn_communityQuery"
            :style="{ width: '90px' }"
            dense
            label="社區資料查詢"
            class="button ele_for_price_query"
            v-show="viewType === 'query'"
            @click="doCommunityQuery"
          />
          <br>
          <q-btn
            id="btn_clear"
            name="btn_clear"
            dense
            label="清除"
            class="button"
            @click="doClear"
          />
        </td>
      </tr>
      <!-- A1_TR_1：受理編號列；showApplyId 控制顯示/隱藏 -->
      <tr
        id="A1_TR_1"
        :class="showApplyId ? 'tr_for_price_query' : ''"
        v-show="showApplyId"
      >
        <td class="tbYellow">受理編號</td>
        <td class="tbYellow2">
          <q-input
            id="APPLY_ID"
            v-model="applyId"
            dense outlined
            name="APPLY_ID"
            class="textBox2 checkInputLength ele_for_price_query"
            :style="{ width: '130px' }"
            maxlength="11"
            :error="!!errors.applyId"
            :error-message="errors.applyId"
          />
        </td>
        <td class="tbYellow">買賣日期</td>
        <td class="tbYellow2" colspan="3">
          <!-- TRADE_DATE_BEG -->
          <q-input
            id="TRADE_DATE_BEG"
            v-model="tradeDateBeg"
            dense outlined
            name="TRADE_DATE_BEG"
            class="textBox2 validate-ROCDate ele_for_price_query"
            :style="{ width: '90px' }"
            maxlength="7"
            :error="!!errors.tradeDateBeg"
            :error-message="errors.tradeDateBeg"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <ROCDatePicker v-model="tradeDateBeg" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          ~
          <!-- TRADE_DATE_END -->
          <q-input
            id="TRADE_DATE_END"
            v-model="tradeDateEnd"
            dense outlined
            name="TRADE_DATE_END"
            class="textBox2 validate-ROCDate ele_for_price_query"
            :style="{ width: '90px' }"
            maxlength="7"
            :error="!!errors.tradeDateEnd"
            :error-message="errors.tradeDateEnd"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <ROCDatePicker v-model="tradeDateEnd" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </td>
      </tr>
      <tr class="tr_for_price_query" v-show="viewType === 'query'">
        <td class="tbYellow" :style="{ width: '13%' }">鑑價日期</td>
        <td class="tbYellow2" :style="{ width: '29%' }">
          <!-- APPR_DATE_BEG -->
          <q-input
            id="APPR_DATE_BEG"
            v-model="apprDateBeg"
            dense outlined
            name="APPR_DATE_BEG"
            class="textBox2 validate-ROCDate ele_for_price_query"
            :style="{ width: '90px' }"
            maxlength="7"
            :error="!!errors.apprDateBeg"
            :error-message="errors.apprDateBeg"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <ROCDatePicker v-model="apprDateBeg" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          ~
          <!-- APPR_DATE_END -->
          <q-input
            id="APPR_DATE_END"
            v-model="apprDateEnd"
            dense outlined
            name="APPR_DATE_END"
            class="textBox2 validate-ROCDate ele_for_price_query"
            :style="{ width: '90px' }"
            maxlength="7"
            :error="!!errors.apprDateEnd"
            :error-message="errors.apprDateEnd"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <ROCDatePicker v-model="apprDateEnd" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </td>
        <td class="tbYellow" :style="{ width: '16%' }">使用分區</td>
        <td class="tbYellow2" :style="{ width: '10%' }">
          <!-- USE_AREA1 -->
          <q-select
            id="USE_AREA1"
            v-model="useArea1"
            dense outlined
            emit-value map-options
            name="USE_AREA1"
            class="ele_for_price_query"
            :options="useArea1List"
            :error="!!errors.useArea1"
            :error-message="errors.useArea1"
          />
        </td>
        <td class="tbYellow" width="12%">列管區</td>
        <td class="tbYellow2" width="10%">
          <!-- RST_KIND -->
          <q-select
            id="RST_KIND"
            v-model="rstKind"
            dense outlined
            emit-value map-options
            name="RST_KIND"
            class="ele_for_price_query"
            :options="rstKindList"
            :error="!!errors.rstKind"
            :error-message="errors.rstKind"
          />
        </td>
      </tr>
      <tr>
        <td class="tbYellow">縣市別</td>
        <td class="tbYellow2">
          <!-- CITY -->
          <q-select
            id="CITY"
            v-model="city"
            dense outlined
            emit-value map-options
            name="CITY"
            :options="[{ label: '縣市別', value: '' }, ...cityList]"
            :error="!!errors.city"
            :error-message="errors.city"
            @update:model-value="doGetTownList"
          />
          <!-- TOWN -->
          <q-select
            id="TOWN"
            v-model="town"
            dense outlined
            emit-value map-options
            name="TOWN"
            :options="townOptions"
            :error="!!errors.town"
            :error-message="errors.town"
          />
        </td>
        <td class="tbYellow">地址路名門牌</td>
        <!-- [20240923] 修改件 陳勁谷 CHROME瀏覽器難字調整_DSA3~A6 -->
        <td class="tbYellow2" colspan="3">
          <q-input
            id="ADDR_NO"
            v-model="addrNo"
            dense outlined
            name="ADDR_NO"
            class="textBox2"
            :style="{ width: '330px' }"
            :placeholder="addrNoPlaceholder"
            :error="!!errors.addrNo"
            :error-message="errors.addrNo"
          />
        </td>
      </tr>
      <tr class="tr_for_areaCode_query" v-show="viewType === 'areaCodeQuery'">
        <td class="tbYellow">經度</td>
        <td class="tbYellow2">
          <q-input
            id="LONGITUDE"
            v-model="longitude"
            dense outlined
            name="LONGITUDE"
            :style="{ width: '300px' }"
            class="textBox2 ele_for_areaCode_query"
            placeholder="精確至小數第6位(例:121.553012)"
            :error="!!errors.longitude"
            :error-message="errors.longitude"
          />
        </td>
        <td class="tbYellow">緯度</td>
        <td class="tbYellow2" colspan="3">
          <q-input
            id="LATITUDE"
            v-model="latitude"
            dense outlined
            name="LATITUDE"
            :style="{ width: '300px' }"
            class="textBox2 ele_for_areaCode_query"
            placeholder="精確至小數第6位(例:25.033021)"
            :error="!!errors.latitude"
            :error-message="errors.latitude"
          />
        </td>
      </tr>
      <tr class="tr_for_price_query" v-show="viewType === 'query'">
        <td class="tbYellow">總樓層</td>
        <td class="tbYellow2">
          <!-- EQU_SIGN -->
          <q-select
            id="EQU_SIGN"
            v-model="equSign"
            dense outlined
            emit-value map-options
            name="EQU_SIGN"
            class="ele_for_price_query"
            :options="equSignList"
          />
          <!-- FLOOR -->
          <q-input
            id="FLOOR"
            v-model="floor"
            dense outlined
            name="FLOOR"
            class="textBox2 validate-digits ele_for_price_query"
            :style="{ width: '50px' }"
            :error="!!errors.floor"
            :error-message="errors.floor"
          />
        </td>
        <td class="tbYellow">類別</td>
        <td class="tbYellow2">
          <!-- USE_FOR -->
          <q-select
            id="USE_FOR"
            v-model="useFor"
            dense outlined
            emit-value map-options
            name="USE_FOR"
            class="ele_for_price_query"
            :options="useForList"
            :error="!!errors.useFor"
            :error-message="errors.useFor"
          />
        </td>
        <td class="tbYellow">屋齡區間</td>
        <td class="tbYellow2">
          <!-- BUILD_AGE1 -->
          <q-input
            id="BUILD_AGE1"
            v-model="buildAge1"
            dense outlined
            name="BUILD_AGE"
            class="textBox2 validate-digits validateBetween ele_for_price_query"
            :style="{ width: '50px' }"
            :error="!!errors.buildAge1"
            :error-message="errors.buildAge1"
          />
          ~
          <!-- BUILD_AGE2 -->
          <q-input
            id="BUILD_AGE2"
            v-model="buildAge2"
            dense outlined
            name="BUILD_AGE"
            class="textBox2 validate-digits validateBetween ele_for_price_query"
            :style="{ width: '50px' }"
            :error="!!errors.buildAge2"
            :error-message="errors.buildAge2"
          />
        </td>
      </tr>
      <tr class="tr_for_price_query" v-show="viewType === 'query'">
        <td class="tbYellow">案名</td>
        <td class="tbYellow2">
          <!-- CASE_NAME -->
          <q-input
            id="CASE_NAME"
            v-model="caseName"
            dense outlined
            name="CASE_NAME"
            class="textBox2 ele_for_price_query"
            :style="{ width: '130px' }"
            :error="!!errors.caseName"
            :error-message="errors.caseName"
          />
        </td>
        <td class="tbYellow">地坪</td>
        <td class="tbYellow2">
          <!-- LAND_MEASURE1 -->
          <q-input
            id="LAND_MEASURE1"
            v-model="landMeasure1"
            dense outlined
            name="LAND_MEASURE"
            class="textBox2 validate-digits validateBetween ele_for_price_query"
            :style="{ width: '65px' }"
            :error="!!errors.landMeasure1"
            :error-message="errors.landMeasure1"
          />
          ~
          <!-- LAND_MEASURE2 -->
          <q-input
            id="LAND_MEASURE2"
            v-model="landMeasure2"
            dense outlined
            name="LAND_MEASURE"
            class="textBox2 validate-digits validateBetween ele_for_price_query"
            :style="{ width: '65px' }"
            :error="!!errors.landMeasure2"
            :error-message="errors.landMeasure2"
          />
        </td>
        <td class="tbYellow">建坪</td>
        <td class="tbYellow2">
          <!-- BUILD_MEASURE1 -->
          <q-input
            id="BUILD_MEASURE1"
            v-model="buildMeasure1"
            dense outlined
            name="BUILD_MEASURE"
            class="textBox2 validate-digits validateBetween ele_for_price_query"
            :style="{ width: '65px' }"
            :error="!!errors.buildMeasure1"
            :error-message="errors.buildMeasure1"
          />
          ~
          <!-- BUILD_MEASURE2 -->
          <q-input
            id="BUILD_MEASURE2"
            v-model="buildMeasure2"
            dense outlined
            name="BUILD_MEASURE"
            class="textBox2 validate-digits validateBetween ele_for_price_query"
            :style="{ width: '65px' }"
            :error="!!errors.buildMeasure2"
            :error-message="errors.buildMeasure2"
          />
        </td>
      </tr>
      <tr class="tr_for_price_query" v-show="viewType === 'query'">
        <td class="tbYellow">建築完成日</td>
        <td class="tbYellow2" colspan="5">
          <!-- FINISH_DATE_BEG -->
          <q-input
            id="FINISH_DATE_BEG"
            v-model="finishDateBeg"
            dense outlined
            name="FINISH_DATE_BEG"
            class="textBox2 validate-ROCDate ele_for_price_query"
            :style="{ width: '90px' }"
            maxlength="7"
            :error="!!errors.finishDateBeg"
            :error-message="errors.finishDateBeg"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <ROCDatePicker v-model="finishDateBeg" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          ~
          <!-- FINISH_DATE_END -->
          <q-input
            id="FINISH_DATE_END"
            v-model="finishDateEnd"
            dense outlined
            name="FINISH_DATE_END"
            class="textBox2 validate-ROCDate ele_for_price_query"
            :style="{ width: '90px' }"
            maxlength="7"
            :error="!!errors.finishDateEnd"
            :error-message="errors.finishDateEnd"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <ROCDatePicker v-model="finishDateEnd" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </td>
      </tr>
      <tr class="tr_for_price_query" v-show="viewType === 'query'">
        <td colspan="7" class="tbYellow2">
          ※<span style="color:red">＊＊</span>表示擔保品有增建情形。
          <span style="color:blue">＠＠</span>表示同一編號含兩筆以上門牌(主建號)。
          <span style="color:green">＄＄</span>表示擔保品為非承作區或列管區。
        </td>
      </tr>
    </table>
  </form>

  <!-- B區 查詢結果 -->
  <div id="grid" v-show="viewType === 'query'">
    <TableUI
      ref="tableRef"
      :pagination="{ rowsPerPage: 10 }"
      :columns="gridColumns"
    >
      <!-- FIXME: APPLY_ID 欄位 render：原 Prototype.js Element 改為 Vue slot；點擊呼叫 doWindowOpen -->
      <template #body-cell-APPLY_ID="props">
        <q-td :props="props">
          <a
            v-if="props.row.APPLY_ID"
            href="#"
            @click.prevent="doWindowOpen(props.row.QUERY_TYPE, props.row.APPLY_ID)"
          >{{ props.row.APPLY_ID }}</a>
          <span v-else>{{ props.row.APPLY_ID }}</span>
        </q-td>
      </template>

      <!-- FIXME: ADDRESS 欄位 render：原 <FONT color> HTML 字串改為條件式 span；v-html 禁用 -->
      <template #body-cell-ADDRESS="props">
        <!-- [20240923] 修改件 陳勁谷 CHROME瀏覽器難字調整_DSA3~A6 -->
        <q-td :props="props" :style="{ fontFamily: 'EUDC' }">
          <span
            v-if="props.row.CONTRACT_AREA === '1' || parseInt(props.row.RESTRICT_AREA, 10) > 1"
            :style="{ color: 'green' }"
          >$$ </span>
          <span
            v-if="parseInt(props.row.CNT, 10) > 1"
            :style="{ color: 'blue' }"
          >@@ </span>
          <span
            v-if="props.row.IS_ADD === '1'"
            :style="{ color: 'red' }"
          >** </span>
          {{ props.row.ADDRESS }}
        </q-td>
      </template>

      <!-- PARK_NM render -->
      <template #body-cell-PARK_NM="props">
        <q-td :props="props">
          {{ props.row.USE_FOR_NM === undefined ? '無車位型態' : props.row.PARK_NM }}
        </q-td>
      </template>

      <!-- BOSS_PER_PRICEA render -->
      <template #body-cell-BOSS_PER_PRICEA="props">
        <q-td :props="props">
          {{ props.row.BOSS_PER_PRICEA === undefined ? '無單價' : numberAddComma(props.row.BOSS_PER_PRICEA) }}
        </q-td>
      </template>

      <!-- BOSS_TOTAL_PRICEA render -->
      <template #body-cell-BOSS_TOTAL_PRICEA="props">
        <q-td :props="props">
          {{ (props.row.QUERY_TYPE === '3' && props.row.BOSS_TOTAL_PRICEA === null) ? '無總價' : numberAddComma(props.row.BOSS_TOTAL_PRICEA) }}
        </q-td>
      </template>

      <!-- FLOOR render -->
      <template #body-cell-FLOOR="props">
        <q-td :props="props">
          {{ props.row.FLOOR === undefined ? '無總樓層' : props.row.FLOOR }}
        </q-td>
      </template>

      <!-- FINISH_DATE render -->
      <template #body-cell-FINISH_DATE="props">
        <q-td :props="props">
          {{ props.row.FINISH_DATE === undefined ? '無建築日' : useCommon().tranCEorROCDate(props.row.FINISH_DATE, 'rocDate') }}
        </q-td>
      </template>

      <!-- USE_FOR_NM render -->
      <template #body-cell-USE_FOR_NM="props">
        <q-td :props="props">
          {{ props.row.USE_FOR_NM === undefined ? '無類別' : props.row.USE_FOR_NM }}
        </q-td>
      </template>

      <!-- TRADE_DATE render -->
      <template #body-cell-TRADE_DATE="props">
        <q-td :props="props">
          {{ props.row.TRADE_DATE === undefined ? '無買賣日' : useCommon().tranCEorROCDate(props.row.TRADE_DATE, 'rocDate') }}
        </q-td>
      </template>

      <!-- BUILD_AGE render -->
      <template #body-cell-BUILD_AGE="props">
        <q-td :props="props">
          {{ props.row.BUILD_AGE === undefined ? '無屋齡' : props.row.BUILD_AGE }}
        </q-td>
      </template>

      <!-- BOSS_PARK_PRICEA render -->
      <template #body-cell-BOSS_PARK_PRICEA="props">
        <q-td :props="props">
          {{ props.row.BOSS_PARK_PRICEA === undefined ? '無車位價' : numberAddComma(props.row.BOSS_PARK_PRICEA) }}
        </q-td>
      </template>

      <!-- BOSS_LAND_PRICEA render -->
      <template #body-cell-BOSS_LAND_PRICEA="props">
        <q-td :props="props">
          {{ props.row.BOSS_LAND_PRICEA === undefined ? '無地價' : numberAddComma(props.row.BOSS_LAND_PRICEA) }}
        </q-td>
      </template>

      <!-- AVG_PRICE render -->
      <template #body-cell-AVG_PRICE="props">
        <q-td :props="props">
          {{ props.row.AVG_PRICE === undefined ? '無均價' : numberAddComma(props.row.AVG_PRICE) }}
        </q-td>
      </template>

      <!-- BUILD_TYPE render -->
      <template #body-cell-BUILD_TYPE="props">
        <q-td :props="props">
          {{ props.row.BUILD_TYPE === undefined ? '無樓別' : props.row.BUILD_TYPE }}
        </q-td>
      </template>

      <!-- APPR_DATE render -->
      <template #body-cell-APPR_DATE="props">
        <q-td :props="props">
          {{ useCommon().tranCEorROCDate(props.row.APPR_DATE, 'rocDate') }}
        </q-td>
      </template>

      <!-- CASE_NAME render -->
      <template #body-cell-CASE_NAME="props">
        <q-td :props="props">
          {{ props.row.CASE_NAME === undefined ? '無案名' : props.row.CASE_NAME }}
        </q-td>
      </template>

      <!-- TRADE_AMT render -->
      <template #body-cell-TRADE_AMT="props">
        <q-td :props="props">
          {{ props.row.TRADE_AMT === undefined ? '無買賣價' : numberAddComma(props.row.TRADE_AMT) }}
        </q-td>
      </template>

      <!-- RENT_PRICE render -->
      <template #body-cell-RENT_PRICE="props">
        <q-td :props="props">
          {{ props.row.RENT_PRICE === undefined ? '無租金' : numberAddComma(props.row.RENT_PRICE) }}
        </q-td>
      </template>
    </TableUI>
  </div>

  <!-- C區 承作分區查詢結果 -->
  <table
    :style="{ width: '100%', border: '0', borderCollapse: 'collapse' }"
    class="tbBox2"
    id="tableC"
    v-show="viewType === 'areaCodeQuery'"
  >
    <tr><th colspan="5" :style="{ textAlign: 'left' }">承作分區查詢結果</th></tr>
    <tr>
      <td class="tbBlue" :style="{ width: '50%', textAlign: 'center' }">所在生活圈</td>
      <td class="tbYellow2" id="SUBMKT_NAME">{{ submktName }}</td>
    </tr>
    <tr>
      <td class="tbBlue" :style="{ textAlign: 'center' }">承作分區</td>
      <td class="tbYellow2" id="AREA_CODE_930318">{{ areaCode930318 }}</td>
    </tr>
    <tr>
      <td class="tbBlue" :style="{ textAlign: 'center' }">備註</td>
      <td class="tbYellow2" colspan="2" id="MEMO">{{ memo }}</td>
    </tr>
  </table>

  <!-- popupWin 容器 -->
  <PopupWinDialog
    v-model="popupWin.state.visible"
    :src="popupWin.state.src"
    :title="popupWin.state.title"
    :width="popupWin.state.width"
    :height="popupWin.state.height"
    :parameters="popupWin.state.parameters"
    :scrolling="popupWin.state.scrolling"
    :full-popup="popupWin.state.fullPopup"
    :close-btn="popupWin.state.closeBtn"
    :close-confirm="popupWin.state.closeConfirm"
    @back="popupWin.onDialogBack"
    @close="popupWin.close"
  />
</template>

<style scoped>
/* EUDC 字型（原 JSP <style> 區塊，移至 scoped 範圍） */
@font-face {
  font-family: 'EUDC';
  src: url("/DSWeb/hanlinks/eudc.woff") format("woff"),
       url("/DSWeb/hanlinks/eudc.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}
</style>
