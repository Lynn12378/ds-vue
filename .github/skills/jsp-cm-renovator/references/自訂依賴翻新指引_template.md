# {資源名稱} 自訂依賴翻新指引

## Core Principles

- 引用語法記錄路徑後移除
- 其他關鍵約束

**翻新對照表欄位說明：**
- **翻新對應**：依 R6 決策分類填入對應值
  - `yyy()` — 1:1 轉換
  - `見 [{子文件}]({path})` — 1:N 轉換，連結至子文件
  - `—` — 直接移除
  - `// TODO` — 待人工處理
- **備註**：僅填入 import 路徑、簡短差異說明、或子文件索引；`—` 項目備註欄留空

---

## 翻新對照表

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `xxx()` | `yyy()` | `import { yyy } from '@/...'` |
| `new Xxx(config)` | 見 [R-xxx](./xxx/R-xxx.md) | |
| `linkTo(...)` | `router.push(...)` | |
| `AjaxHandler.request()` | `customAxios.post(...)` | |
| `pageSupport.*` | — | |
| `keepParamsManager.*` | `// TODO` | 改用 Pinia store |
