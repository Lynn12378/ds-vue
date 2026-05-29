import http from 'node:http'

const PORT = Number(process.env.MOCK_PORT || 8080)

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

const success = (extra = {}) => ({
  ErrMsg: {
    returnCode: 0,
    returnMsg: 'OK'
  },
  ...extra
})

const notFound = () => ({
  ErrMsg: {
    returnCode: 404,
    returnMsg: 'Not Found'
  }
})

const promptData = () => success({
  showApplyId: true,
  fromPublicBean: '',
  USE_AREA1_LIST: [
    { key: '0', value: '全部' },
    { key: 'A', value: '住宅區' },
    { key: 'B', value: '商業區' }
  ],
  RST_KIND_LIST: [
    { key: '0', value: '全部' },
    { key: '1', value: '列管區' },
    { key: '2', value: '非列管區' }
  ],
  CITY_LIST: [
    { CITY_NAME: '台北市' },
    { CITY_NAME: '新北市' },
    { CITY_NAME: '桃園市' }
  ],
  EQU_SIGN_LIST: [
    { key: '0', value: '=' },
    { key: '1', value: '>=' },
    { key: '2', value: '<=' }
  ],
  USE_FOR_LIST: [
    { key: '0', value: '全部' },
    { key: 'A1', value: '住宅' },
    { key: 'B1', value: '店面' }
  ]
})

const buildRows = (queryType = '1') => ([
  {
    APPLY_ID: 'A1234567890',
    ADDRESS: '台北市中正區忠孝東路一段100號',
    LAND_MEASURE: 22.85,
    PARK_NM: '平面車位',
    BOSS_PER_PRICEA: 785000,
    BOSS_TOTAL_PRICEA: 31500000,
    FLOOR: 12,
    FINISH_DATE: '20210420',
    USE_FOR_NM: '住宅',
    TRADE_DATE: '20250320',
    BUILD_AGE: 4,
    BUILD_MEASURE: 40.5,
    BOSS_PARK_PRICEA: 2800000,
    BOSS_LAND_PRICEA: 9200000,
    AVG_PRICE: 777777,
    BUILD_TYPE: '電梯大樓',
    APPR_DATE: '20250401',
    CASE_NAME: '忠孝首府',
    TRADE_AMT: 33000000,
    RENT_PRICE: 0,
    CONTRACT_AREA: '0',
    RESTRICT_AREA: '1',
    CNT: '1',
    IS_ADD: '0',
    QUERY_TYPE: queryType
  },
  {
    APPLY_ID: 'B2234567890',
    ADDRESS: '新北市板橋區文化路二段88號',
    LAND_MEASURE: 18.22,
    PARK_NM: '',
    BOSS_PER_PRICEA: 598000,
    BOSS_TOTAL_PRICEA: 26800000,
    FLOOR: 10,
    FINISH_DATE: '20181215',
    USE_FOR_NM: '住宅',
    TRADE_DATE: '20250112',
    BUILD_AGE: 7,
    BUILD_MEASURE: 35.2,
    BOSS_PARK_PRICEA: null,
    BOSS_LAND_PRICEA: 8500000,
    AVG_PRICE: 612345,
    BUILD_TYPE: '華廈',
    APPR_DATE: '20250203',
    CASE_NAME: '文化名邸',
    TRADE_AMT: 27000000,
    RENT_PRICE: 35000,
    CONTRACT_AREA: '1',
    RESTRICT_AREA: '2',
    CNT: '2',
    IS_ADD: '1',
    QUERY_TYPE: queryType
  }
])

const safeJsonParse = (val, fallback = {}) => {
  if (!val || typeof val !== 'string') return fallback
  try {
    return JSON.parse(val)
  } catch {
    return fallback
  }
}

const matchText = (source, keyword) => {
  if (!keyword) return true
  return String(source || '').includes(String(keyword).trim())
}

const normalizeReqMap = (body = {}) => {
  if (body.reqMap && typeof body.reqMap === 'object') return body.reqMap
  if (typeof body.reqMap === 'string') return safeJsonParse(body.reqMap, {})
  return body
}

const filterRows = (rows, reqMap = {}) => {
  return rows.filter((row) => {
    if (!matchText(row.APPLY_ID, reqMap.APPLY_ID)) return false
    if (!matchText(row.ADDRESS, reqMap.CITY)) return false
    if (!matchText(row.ADDRESS, reqMap.TOWN)) return false
    if (!matchText(row.ADDRESS, reqMap.ADDR_NO)) return false
    if (!matchText(row.CASE_NAME, reqMap.CASE_NAME)) return false

    if (reqMap.USE_FOR && reqMap.USE_FOR !== '0' && !matchText(row.USE_FOR_NM, reqMap.USE_FOR)) {
      return false
    }

    if (reqMap.BUILD_AGE1 !== '' && reqMap.BUILD_AGE1 != null) {
      if (Number(row.BUILD_AGE) < Number(reqMap.BUILD_AGE1)) return false
    }

    if (reqMap.BUILD_AGE2 !== '' && reqMap.BUILD_AGE2 != null) {
      if (Number(row.BUILD_AGE) > Number(reqMap.BUILD_AGE2)) return false
    }

    return true
  })
}

const getAreaCodeResult = (reqMap = {}) => {
  const key = `${reqMap.CITY || ''}${reqMap.TOWN || ''}`
  const areaCodeByRegion = {
    台北市中正區: {
      SUBMKT_NAME: '台北都會核心生活圈',
      AREA_CODE_930318: 'A01',
      MEMO: '此區域屬於優先承作範圍'
    },
    新北市板橋區: {
      SUBMKT_NAME: '新北板橋都心生活圈',
      AREA_CODE_930318: 'B03',
      MEMO: '承作分區需留意建物使用分區'
    }
  }

  if (areaCodeByRegion[key]) return areaCodeByRegion[key]

  if (reqMap.LONGITUDE && reqMap.LATITUDE) {
    return {
      SUBMKT_NAME: '座標查詢生活圈',
      AREA_CODE_930318: 'C99',
      MEMO: '依經緯度估算，請再確認門牌資訊'
    }
  }

  return {
    SUBMKT_NAME: '',
    AREA_CODE_930318: '',
    MEMO: '查無對應承作分區資料'
  }
}

const townListByCity = {
  台北市: [{ TOWN_NAME: '中正區' }, { TOWN_NAME: '大安區' }, { TOWN_NAME: '信義區' }],
  新北市: [{ TOWN_NAME: '板橋區' }, { TOWN_NAME: '新店區' }, { TOWN_NAME: '三重區' }],
  桃園市: [{ TOWN_NAME: '桃園區' }, { TOWN_NAME: '中壢區' }, { TOWN_NAME: '龜山區' }]
}

const readBody = (req) => new Promise((resolve, reject) => {
  let data = ''
  req.on('data', (chunk) => {
    data += chunk
  })
  req.on('end', () => {
    if (!data) {
      resolve({})
      return
    }
    try {
      resolve(JSON.parse(data))
    } catch (error) {
      reject(error)
    }
  })
  req.on('error', reject)
})

const getRouteKey = (method, pathName) => `${method.toUpperCase()} ${pathName}`

const routes = new Map()

const register = (method, pathName, handler) => {
  routes.set(getRouteKey(method, pathName), handler)
}

const registerBeanRoutes = (beanName) => {
  register('POST', `/${beanName}/promptQuery`, (body) => {
    const reqMap = normalizeReqMap(body)
    return success({ rtnList: filterRows(buildRows('1'), reqMap) })
  })
  register('POST', `/${beanName}/query`, (body) => {
    const reqMap = normalizeReqMap(body)
    return success({ rtnList: filterRows(buildRows('1'), reqMap) })
  })
  register('POST', `/${beanName}/landQuery`, (body) => {
    const reqMap = normalizeReqMap(body)
    return success({ rtnList: filterRows(buildRows('2'), reqMap) })
  })
  register('POST', `/${beanName}/groupQuery`, (body) => {
    const reqMap = normalizeReqMap(body)
    return success({ rtnList: filterRows(buildRows('3'), reqMap) })
  })
  register('POST', `/${beanName}/communityQuery`, (body) => {
    const reqMap = normalizeReqMap(body)
    return success({ rtnList: filterRows(buildRows('4'), reqMap) })
  })
  register('POST', `/${beanName}/areacodeQuery`, (body) => {
    const reqMap = normalizeReqMap(body)
    return success({ rtnMap: getAreaCodeResult(reqMap) })
  })
  register('POST', `/${beanName}/getTOWN_LIST`, (body) => {
    const cityName = body?.CITY_NAME
    return success({ TOWN_LIST: townListByCity[cityName] || [] })
  })
}

register('GET', '/DSA3_0900/prompt', () => promptData())
registerBeanRoutes('DSA3_0900')
registerBeanRoutes('DSA3_2400')

register('POST', '/DSA3_2400/queryByDSA3_0900', (body) => {
  const reqMap = normalizeReqMap(body)
  return success({ rtnList: filterRows(buildRows('1'), reqMap) })
})
register('POST', '/DSA3_2400/landQueryByDSA3_0900', (body) => {
  const reqMap = normalizeReqMap(body)
  return success({ rtnList: filterRows(buildRows('2'), reqMap) })
})
register('POST', '/DSA3_2400/groupQueryByDSA3_0900', (body) => {
  const reqMap = normalizeReqMap(body)
  return success({ rtnList: filterRows(buildRows('3'), reqMap) })
})
register('POST', '/DSA3_2400/communityQueryByDSA3_0900', (body) => {
  const reqMap = normalizeReqMap(body)
  return success({ rtnList: filterRows(buildRows('4'), reqMap) })
})

register('GET', '/health', () => success({ service: 'mockserver', status: 'up' }))

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    res.writeHead(400, JSON_HEADERS)
    res.end(JSON.stringify(notFound()))
    return
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, JSON_HEADERS)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const routeKey = getRouteKey(req.method, url.pathname)
  const handler = routes.get(routeKey)

  if (!handler) {
    res.writeHead(404, JSON_HEADERS)
    res.end(JSON.stringify(notFound()))
    return
  }

  try {
    const body = req.method === 'POST' ? await readBody(req) : {}
    const payload = handler(body, req, url)
    res.writeHead(200, JSON_HEADERS)
    res.end(JSON.stringify(payload))
  } catch (error) {
    res.writeHead(500, JSON_HEADERS)
    res.end(JSON.stringify({
      ErrMsg: {
        returnCode: 500,
        returnMsg: String(error?.message || error)
      }
    }))
  }
})

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(`[mockserver] port ${PORT} is already in use. Use MOCK_PORT to switch port, e.g. MOCK_PORT=8081 npm run mock`)
    process.exit(1)
  }

  console.error('[mockserver] server error:', error)
  process.exit(1)
})

server.listen(PORT, () => {
  console.log(`[mockserver] listening on http://localhost:${PORT}`)
})
