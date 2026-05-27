# `jsp_CM/TableUI.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/TableUI.js`
- 目標：資料表格渲染、分頁、排序、群組、勾選、輸出
- 對應模組：
  - `src/components/common/data-table/CustomDataTable.vue`
  - `src/components/common/custom-table/CustomTable.js`
  - `src/stores/tableStateStore.js`
  - `src/assets/utils/legacy/exportXls.js`

## 黑盒子邊界
- 列資料如何查詢、如何組裝欄位值，視為頁面業務黑盒。
- 本文件只處理 `TableUI` 共用介面與行為替換。

## 建構與配置映射
| legacy pattern | v2 對應 | 分類 | 規則 |
| --- | --- | --- | --- |
| `new TableUI(config)` | `CustomDataTable` props + `tableStateStore` | `ONE_TO_ONE_REPLACE` | `config` 中欄位/排序/分頁設定拆成 reactive state |
| `config.column` / `config.headerColumn` | `columns` + 欄位 slot | `ONE_TO_ONE_REPLACE` | 欄位 key 與 label 不可改名 |
| `config.split` | `headerRows`/slot 分段渲染 | `ONE_TO_ONE_REPLACE` | 規則見 `resources/TableUI/headerRows.md` |
| `config.groupKey` | row-group 計算與合併渲染 | `ONE_TO_ONE_REPLACE` | 規則見 `resources/TableUI/groupKey.md` |
| `config.sortRule` / `config.sortKey` | `pagination.sortBy/descending` + comparator | `ONE_TO_ONE_REPLACE` | 規則見 `resources/TableUI/sort.md` |
| `config.input[...]` | cell slot + `v-model` 雙向綁定 | `ONE_TO_ONE_REPLACE` | 規則見 `resources/TableUI/autoInput.md` |

## 常用方法映射
| legacy API | v2 寫法 | 分類 | 契約要求 |
| --- | --- | --- | --- |
| `tableUI.loadin(records, totalCount, subTotalCount, preCheckedValues)` | 更新 `rows`、`pagination.rowsNumber`、`selectedKeys` | `ONE_TO_ONE_REPLACE` | 保留勾選結果與總筆數語意 |
| `tableUI.loadin(url, queryRules, successCB, failCB)` | `runWithLoading(async () => fetchRows())` + `customAxios` | `ONE_TO_ONE_REPLACE` | success/fail callback 轉為 Promise 流程 |
| `tableUI.getAllRecords()` | 讀取 reactive `rows` | `ONE_TO_ONE_REPLACE` | 回傳完整資料集 |
| `tableUI.getCurrentPageRecords()` | 由 `rows` + `pagination.page/rowsPerPage` 切片 | `ONE_TO_ONE_REPLACE` | 與畫面頁碼一致 |
| `tableUI.getCheckedRecords()` / `getUncheckedRecords()` | 由 `selectedKeys` 過濾 | `ONE_TO_ONE_REPLACE` | 保留 key 判斷邏輯 |
| `tableUI.getErrorRecords()` / `getCorrectRecords()` | 由 validation state 過濾 | `ONE_TO_ONE_REPLACE` | 錯誤判定條件不可改 |
| `tableUI.exportAllToXLS(...)` / `exportCheckToXLS(...)` | `exportToXls({ rows, columns, ... })` | `ONE_TO_ONE_REPLACE` | 匯出欄位順序與標題需一致 |
| `tableUI.loadNext/loadPrevious/loadPage/...` | 更新 `pagination.page` | `ONE_TO_ONE_REPLACE` | 保留頁碼邊界保護 |
| `tableUI.show()` / `hide()` | `v-if` 或 `q-tab` 切換顯示 | `ONE_TO_ONE_REPLACE` | 不再用 DOM `display` |

## 直接移除清單
- 依 `document.getElementById(...)` 直接改 TD 內容/樣式。
- 以全局事件綁定滑鼠 hover 來模擬列高亮。
- 與 legacy iframe/table 結構綁死的 DOM selector 操作。

## 子章節
- `resources/TableUI/headerRows.md`
- `resources/TableUI/groupKey.md`
- `resources/TableUI/sort.md`
- `resources/TableUI/pagination.md`
- `resources/TableUI/autoInput.md`

## Fallback（無法命中既有 pattern）
- 分類：`FALLBACK_STUB`
- 作法：建立 `useLegacyTableUiAdapter({ config, rows })`，輸出統一欄位與事件介面給 `CustomDataTable`。
- 必須保留：
  - `rowKey`/`selected` 的辨識邏輯
  - 分頁與排序輸入參數格式
  - 匯出資料欄位順序
