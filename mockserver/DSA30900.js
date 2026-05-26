/**
 * Mock data & route handlers for DSA30900 (擔保品行情查詢)
 * ALL mock data lives here — do NOT import this file into page components.
 */

// ── Prompt 靜態資料 ────────────────────────────────────────────────────────────

const PROMPT_DATA = {
  showApplyId: true,
  fromPublicBean: '',
  USE_AREA1_LIST: [
    { key: '0', value: '全部' },
    { key: '1', value: '住宅區' },
    { key: '2', value: '商業區' },
    { key: '3', value: '工業區' },
    { key: '4', value: '農業區' },
  ],
  RST_KIND_LIST: [
    { key: '0', value: '全部' },
    { key: '1', value: '一般區' },
    { key: '2', value: '列管區' },
  ],
  CITY_LIST: [
    { CITY_NAME: '台北市' },
    { CITY_NAME: '新北市' },
    { CITY_NAME: '桃園市' },
    { CITY_NAME: '台中市' },
    { CITY_NAME: '台南市' },
    { CITY_NAME: '高雄市' },
  ],
  EQU_SIGN_LIST: [
    { key: '=',  value: '等於' },
    { key: '>=', value: '大於等於' },
    { key: '<=', value: '小於等於' },
  ],
  USE_FOR_LIST: [
    { key: '0', value: '全部' },
    { key: '1', value: '住宅大樓' },
    { key: '2', value: '公寓' },
    { key: '3', value: '透天' },
    { key: '4', value: '店面' },
    { key: '5', value: '辦公室' },
  ],
}

// ── 鄉鎮區對應表 ───────────────────────────────────────────────────────────────

const TOWN_MAP = {
  '台北市': [
    { TOWN_NAME: '中正區' },
    { TOWN_NAME: '大安區' },
    { TOWN_NAME: '信義區' },
    { TOWN_NAME: '松山區' },
    { TOWN_NAME: '內湖區' },
    { TOWN_NAME: '士林區' },
    { TOWN_NAME: '北投區' },
    { TOWN_NAME: '文山區' },
    { TOWN_NAME: '南港區' },
    { TOWN_NAME: '中山區' },
    { TOWN_NAME: '萬華區' },
    { TOWN_NAME: '大同區' },
  ],
  '新北市': [
    { TOWN_NAME: '板橋區' },
    { TOWN_NAME: '中和區' },
    { TOWN_NAME: '永和區' },
    { TOWN_NAME: '新莊區' },
    { TOWN_NAME: '三重區' },
    { TOWN_NAME: '新店區' },
    { TOWN_NAME: '淡水區' },
    { TOWN_NAME: '土城區' },
  ],
  '桃園市': [
    { TOWN_NAME: '桃園區' },
    { TOWN_NAME: '中壢區' },
    { TOWN_NAME: '八德區' },
    { TOWN_NAME: '蘆竹區' },
    { TOWN_NAME: '平鎮區' },
  ],
  '台中市': [
    { TOWN_NAME: '西屯區' },
    { TOWN_NAME: '北屯區' },
    { TOWN_NAME: '南屯區' },
    { TOWN_NAME: '中區' },
    { TOWN_NAME: '西區' },
    { TOWN_NAME: '北區' },
  ],
  '台南市': [
    { TOWN_NAME: '東區' },
    { TOWN_NAME: '西區' },
    { TOWN_NAME: '南區' },
    { TOWN_NAME: '北區' },
    { TOWN_NAME: '安平區' },
    { TOWN_NAME: '安南區' },
  ],
  '高雄市': [
    { TOWN_NAME: '前鎮區' },
    { TOWN_NAME: '苓雅區' },
    { TOWN_NAME: '三民區' },
    { TOWN_NAME: '楠梓區' },
    { TOWN_NAME: '鳳山區' },
    { TOWN_NAME: '左營區' },
  ],
}

// ── 查詢結果樣板列 ─────────────────────────────────────────────────────────────

const SAMPLE_ROWS = [
  {
    APPLY_ID: 'A0001234567',
    QUERY_TYPE: '1',
    ADDRESS: '台北市大安區信義路四段101號',
    LAND_MEASURE: '25.50',
    PARK_NM: '平面式車位',
    BOSS_PER_PRICEA: '680000',
    BOSS_TOTAL_PRICEA: '25000000',
    FLOOR: '12',
    FINISH_DATE: '20000101',
    USE_FOR_NM: '住宅大樓',
    TRADE_DATE: '20230615',
    BUILD_AGE: '23',
    BUILD_MEASURE: '36.80',
    BOSS_PARK_PRICEA: '1200000',
    BOSS_LAND_PRICEA: '5000000',
    AVG_PRICE: '620000',
    BUILD_TYPE: '7F',
    APPR_DATE: '20230701',
    CASE_NAME: '信義帝寶',
    TRADE_AMT: '28000000',
    RENT_PRICE: '35000',
    CONTRACT_AREA: '0',
    RESTRICT_AREA: '1',
    CNT: '1',
    IS_ADD: '0',
  },
  {
    APPLY_ID: 'B0002345678',
    QUERY_TYPE: '2',
    ADDRESS: '新北市板橋區文化路一段200號',
    LAND_MEASURE: '18.30',
    PARK_NM: '機械式車位',
    BOSS_PER_PRICEA: '420000',
    BOSS_TOTAL_PRICEA: '14500000',
    FLOOR: '8',
    FINISH_DATE: '20051215',
    USE_FOR_NM: '公寓',
    TRADE_DATE: '20230820',
    BUILD_AGE: '18',
    BUILD_MEASURE: '34.50',
    BOSS_PARK_PRICEA: '800000',
    BOSS_LAND_PRICEA: '3200000',
    AVG_PRICE: '390000',
    BUILD_TYPE: '3F',
    APPR_DATE: '20230901',
    CASE_NAME: '板橋新生活',
    TRADE_AMT: '15800000',
    RENT_PRICE: '22000',
    CONTRACT_AREA: '0',
    RESTRICT_AREA: '1',
    CNT: '1',
    IS_ADD: '0',
  },
  {
    APPLY_ID: 'C0003456789',
    QUERY_TYPE: '1',
    ADDRESS: '台北市信義區松仁路100號',
    LAND_MEASURE: '32.10',
    PARK_NM: '平面式車位',
    BOSS_PER_PRICEA: '980000',
    BOSS_TOTAL_PRICEA: '38000000',
    FLOOR: '20',
    FINISH_DATE: '20101001',
    USE_FOR_NM: '辦公室',
    TRADE_DATE: '20231010',
    BUILD_AGE: '13',
    BUILD_MEASURE: '38.80',
    BOSS_PARK_PRICEA: '2000000',
    BOSS_LAND_PRICEA: '8000000',
    AVG_PRICE: '900000',
    BUILD_TYPE: '15F',
    APPR_DATE: '20231101',
    CASE_NAME: '信義計畫A辦',
    TRADE_AMT: '42000000',
    RENT_PRICE: null,
    CONTRACT_AREA: '1',
    RESTRICT_AREA: '2',
    CNT: '2',
    IS_ADD: '1',
  },
  {
    APPLY_ID: 'D0004567890',
    QUERY_TYPE: '3',
    ADDRESS: '台中市西屯區台灣大道三段500號',
    LAND_MEASURE: '45.00',
    PARK_NM: '無',
    BOSS_PER_PRICEA: '280000',
    BOSS_TOTAL_PRICEA: null,
    FLOOR: '4',
    FINISH_DATE: '19980301',
    USE_FOR_NM: '透天',
    TRADE_DATE: '20231205',
    BUILD_AGE: '26',
    BUILD_MEASURE: '55.30',
    BOSS_PARK_PRICEA: '0',
    BOSS_LAND_PRICEA: '4500000',
    AVG_PRICE: '265000',
    BUILD_TYPE: 'B1F',
    APPR_DATE: '20231215',
    CASE_NAME: '台中透天別墅',
    TRADE_AMT: '18500000',
    RENT_PRICE: '28000',
    CONTRACT_AREA: '0',
    RESTRICT_AREA: '1',
    CNT: '1',
    IS_ADD: '0',
  },
  {
    APPLY_ID: '@E0005678901',
    QUERY_TYPE: '4',
    ADDRESS: '高雄市前鎮區中山三路100號',
    LAND_MEASURE: '20.50',
    PARK_NM: '平面式車位',
    BOSS_PER_PRICEA: '210000',
    BOSS_TOTAL_PRICEA: '8500000',
    FLOOR: '14',
    FINISH_DATE: '20081101',
    USE_FOR_NM: '住宅大樓',
    TRADE_DATE: '20240102',
    BUILD_AGE: '15',
    BUILD_MEASURE: '40.50',
    BOSS_PARK_PRICEA: '500000',
    BOSS_LAND_PRICEA: '1800000',
    AVG_PRICE: '195000',
    BUILD_TYPE: '5F',
    APPR_DATE: '20240110',
    CASE_NAME: '高雄美麗灣',
    TRADE_AMT: '9200000',
    RENT_PRICE: '18000',
    CONTRACT_AREA: '0',
    RESTRICT_AREA: '1',
    CNT: '1',
    IS_ADD: '0',
  },
]

// 土建融查詢結果（欄位較少）
const LAND_ROWS = [
  {
    APPLY_ID: 'L0001111111',
    QUERY_TYPE: '1',
    ADDRESS: '台北市中正區重慶南路一段50號',
    LAND_MEASURE: '120.00',
    PARK_NM: '無',
    BOSS_PER_PRICEA: null,
    BOSS_TOTAL_PRICEA: '85000000',
    FLOOR: null,
    FINISH_DATE: null,
    USE_FOR_NM: null,
    TRADE_DATE: '20231101',
    BUILD_AGE: null,
    BUILD_MEASURE: '0',
    BOSS_PARK_PRICEA: null,
    BOSS_LAND_PRICEA: '85000000',
    AVG_PRICE: null,
    BUILD_TYPE: null,
    APPR_DATE: '20231201',
    CASE_NAME: '中正土建融案',
    TRADE_AMT: '90000000',
    RENT_PRICE: null,
    CONTRACT_AREA: '0',
    RESTRICT_AREA: '1',
    CNT: '1',
    IS_ADD: '0',
  },
]

// 整批分戶查詢結果
const GROUP_ROWS = [
  {
    APPLY_ID: 'G0001222222',
    QUERY_TYPE: '1',
    ADDRESS: '台北市南港區經貿二路66號',
    LAND_MEASURE: '15.20',
    PARK_NM: '機械式車位',
    BOSS_PER_PRICEA: '750000',
    BOSS_TOTAL_PRICEA: '22000000',
    FLOOR: '18',
    FINISH_DATE: '20150601',
    USE_FOR_NM: '辦公室',
    TRADE_DATE: '20231201',
    BUILD_AGE: '8',
    BUILD_MEASURE: '29.30',
    BOSS_PARK_PRICEA: '1500000',
    BOSS_LAND_PRICEA: '4000000',
    AVG_PRICE: '720000',
    BUILD_TYPE: '10F',
    APPR_DATE: '20240101',
    CASE_NAME: '南港軟體園區',
    TRADE_AMT: '24000000',
    RENT_PRICE: '40000',
    CONTRACT_AREA: '0',
    RESTRICT_AREA: '1',
    CNT: '3',
    IS_ADD: '0',
  },
]

// 社區資料查詢結果
const COMMUNITY_ROWS = [
  {
    APPLY_ID: '@M0001333333',
    QUERY_TYPE: '4',
    ADDRESS: '新北市新店區中興路二段198號',
    LAND_MEASURE: '22.80',
    PARK_NM: '平面式車位',
    BOSS_PER_PRICEA: '350000',
    BOSS_TOTAL_PRICEA: '16000000',
    FLOOR: '10',
    FINISH_DATE: '20030301',
    USE_FOR_NM: '住宅大樓',
    TRADE_DATE: '20231001',
    BUILD_AGE: '20',
    BUILD_MEASURE: '45.70',
    BOSS_PARK_PRICEA: '900000',
    BOSS_LAND_PRICEA: '3500000',
    AVG_PRICE: '330000',
    BUILD_TYPE: '6F',
    APPR_DATE: '20231015',
    CASE_NAME: '新店碧潭社區',
    TRADE_AMT: '17500000',
    RENT_PRICE: '25000',
    CONTRACT_AREA: '0',
    RESTRICT_AREA: '1',
    CNT: '1',
    IS_ADD: '0',
  },
]

// ── 承作分區查詢結果 ────────────────────────────────────────────────────────────

const AREA_CODE_RESULT = {
  SUBMKT_NAME: '台北都會區',
  AREA_CODE_930318: 'A01',
  MEMO: '本區為台北市核心生活圈，房價穩定，流動性高。',
}

// ── Route Handlers ─────────────────────────────────────────────────────────────

/**
 * @param {string} url - 去除 baseURL 後的 path，如 'DSA3_0900/prompt'
 * @param {string} method - 'GET' | 'POST'
 * @param {object} body - POST 請求的 parsed body
 * @returns {{ matched: boolean, data: object } | null}
 */
export function handleDSA30900(url, method, body) {
  // GET DSA3_0900/prompt
  if (method === 'GET' && url === '/DSA3_0900/prompt') {
    return { matched: true, data: PROMPT_DATA }
  }

  // POST DSA3_0900/getTOWN_LIST
  if (method === 'POST' && url === '/DSA3_0900/getTOWN_LIST') {
    const cityName = body?.CITY_NAME ?? ''
    const list = TOWN_MAP[cityName] ?? []
    return { matched: true, data: { TOWN_LIST: list } }
  }

  // POST DSA3_0900/promptQuery
  if (method === 'POST' && url === '/DSA3_0900/promptQuery') {
    return { matched: true, data: { rtnList: SAMPLE_ROWS } }
  }

  // POST DSA3_0900/query  /  queryByDSA3_0900
  if (
    method === 'POST' &&
    (url === '/DSA3_0900/query' || url === '/DSA3_0900/queryByDSA3_0900')
  ) {
    return { matched: true, data: { rtnList: SAMPLE_ROWS } }
  }

  // POST DSA3_0900/landQuery  /  landQueryByDSA3_0900
  if (
    method === 'POST' &&
    (url === '/DSA3_0900/landQuery' || url === '/DSA3_0900/landQueryByDSA3_0900')
  ) {
    return { matched: true, data: { rtnList: LAND_ROWS } }
  }

  // POST DSA3_0900/groupQuery  /  groupQueryByDSA3_0900
  if (
    method === 'POST' &&
    (url === '/DSA3_0900/groupQuery' || url === '/DSA3_0900/groupQueryByDSA3_0900')
  ) {
    return { matched: true, data: { rtnList: GROUP_ROWS } }
  }

  // POST DSA3_0900/communityQuery  /  communityQueryByDSA3_0900
  if (
    method === 'POST' &&
    (url === '/DSA3_0900/communityQuery' || url === '/DSA3_0900/communityQueryByDSA3_0900')
  ) {
    return { matched: true, data: { rtnList: COMMUNITY_ROWS } }
  }

  // POST DSA3_0900/areacodeQuery
  if (method === 'POST' && url === '/DSA3_0900/areacodeQuery') {
    return { matched: true, data: { rtnMap: AREA_CODE_RESULT } }
  }

  return { matched: false, data: null }
}
