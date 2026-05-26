/**
 * Mock Server — 監聽 http://localhost:8080
 *
 * 啟動方式：npm run mock
 *
 * 所有 API mock 資料定義於各自的 handler 模組（如 DSA30900.js），
 * 本檔案僅負責 HTTP 路由分派，不包含任何業務資料。
 */

import http from 'node:http'
import { handleDSA30900 } from './DSA30900.js'

const PORT = 8080

// ── 所有 handler 清單（依序比對，第一個 matched 優先）────────────────────────
const HANDLERS = [handleDSA30900]

// ── 解析 POST body ─────────────────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
  })
}

// ── Server ─────────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS headers — 允許本機 Vite dev server (任意 origin) 呼叫
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = req.url ?? '/'
  const method = req.method ?? 'GET'
  const body = method === 'POST' ? await readBody(req) : {}

  // 逐一比對 handler
  for (const handler of HANDLERS) {
    const result = handler(url, method, body)
    if (result?.matched) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(result.data))
      console.log(`[mock] ${method} ${url} → 200`)
      return
    }
  }

  // 找不到對應路由
  console.warn(`[mock] ${method} ${url} → 404 (no handler matched)`)
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify({ error: 'Not found', url, method }))
})

server.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`)
  console.log('Press Ctrl+C to stop.\n')
  console.log('Registered routes:')
  console.log('  GET  /DSA3_0900/prompt')
  console.log('  POST /DSA3_0900/promptQuery')
  console.log('  POST /DSA3_0900/query')
  console.log('  POST /DSA3_0900/queryByDSA3_0900')
  console.log('  POST /DSA3_0900/landQuery')
  console.log('  POST /DSA3_0900/landQueryByDSA3_0900')
  console.log('  POST /DSA3_0900/groupQuery')
  console.log('  POST /DSA3_0900/groupQueryByDSA3_0900')
  console.log('  POST /DSA3_0900/communityQuery')
  console.log('  POST /DSA3_0900/communityQueryByDSA3_0900')
  console.log('  POST /DSA3_0900/getTOWN_LIST')
  console.log('  POST /DSA3_0900/areacodeQuery')
})
