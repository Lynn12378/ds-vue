# calendar.js 業務邏輯分析

## 業務邏輯清單

### UI 渲染與視圖

- [x] 日期視圖（`createDateSelectBox`）— 固定 6 列 × 7 欄的月曆格，顯示當月日期，相鄰月份日期以灰色標示（QDate 預設行為）
- [x] 月份視圖（`createMonthSelectBox`）— 4 列 × 3 欄顯示 12 個月份供選擇（QDate 預設行為）
- [x] 年份視圖（`createYearSelectBox`）— 4 列 × 3 欄顯示年份或年份區間，支援 1 / 10 / 100 年層級切換（QDate 預設行為）
- [x] 視圖切換（`preLevelEvent`）— 點擊標題列從日期視圖切換至月份視圖，再切換至年份視圖（QDate 預設行為）
- [x] 導覽（`shiftLevelEvent`）— 左右箭頭切換上/下月、上/下年、上/下年份區間（QDate 預設行為）
- [x] 當前月標題顯示（`format_YM`）— 顯示目前導覽年月，ROC 模式顯示民國年（`CustomDate` 透過 `locale.yearOrigin` + DOM patch 實作）
- [x] 星期列標題顯示（`getWeekDayDisplay`）— 依 locale 顯示星期縮寫（QDate locale prop）
- [x] 今日按鈕（`getTodayTag`）— 點擊直接選入今日日期（`today-btn` prop）
- [x] 清除按鈕（`getClearTag`）— 點擊清空輸入值（`clearable` prop 於外層 q-input）

### Locale 語系

- [x] 繁體中文（ROC）語系 — 民國年標題、中文月份、中文星期（`CustomDate` datatype="ROC"）
- [x] 預設（西元）語系 — 西元年標題、中文月份、中文星期（QDate 預設）
- [ ] 越南語系（VN）— 英文月份縮寫、英文星期縮寫，`dd/MM/yyyy` 格式（QDate 不直接支援此語系設定）

### 日期格式與解析

- [x] ROC 民國日期格式（`yyyMMdd`）— 輸入/輸出（`CustomDate` datatype="ROC" 處理）
- [x] 西元日期格式（`yyyy-MM-dd`）— 輸入/輸出（QDate 預設 mask）
- [ ] 越南日期格式（`dd/MM/yyyy`）— 輸入/輸出（QDate mask 可設定但 locale 不完整）
- [x] 日期字串解析（`parseDate`）— 將顯示格式字串解析回 `[year, month, date]`（`CustomDate` 內部 `convertInputValue` / `convertOutputValue` 處理）
- [x] 日期格式化輸出（`format`）— 將 `[year, month, date]` 組合為顯示格式字串（`CustomDate` 內部 `tranCEorROCDate` 處理）
- [x] ROC / 西元換算（`year - 1911`）— 顯示時民國年與西元年互轉（`CustomDate` ROC_YEAR_OFFSET 常數）

### 開關與互動

- [ ] `autoCreateDate(elem)` — 掃描 DOM 內所有 `datatype="...DATE"` 的 input 並自動綁定 calendar（DOM 掃描，不遷移）
- [ ] `showCalendar(node)` / `getCalendarFor(elem)` — 對指定 input 開啟 calendar 浮層（DOM 操作，改由 q-popup-proxy 觸發）
- [ ] focus/blur 開關控制（`setCalendarStatus` / `closeAfterWait`）— 追蹤 input 與 calendar 的 focus 狀態決定是否關閉（QDate popup 自動處理）
- [ ] `getValue(node)` — 從 input DOM 取得日期值並轉回標準格式（DOM 操作，改為直接讀取 ref）
- [ ] `setValue(node, DBvalue)` — 將 DB 格式日期寫入 input DOM（DOM 操作，改為直接對 ref 賦值）

### 內部工具

- [ ] `createDOM` — 通用 DOM 建立工具（JSP DOM 操作，不遷移）
- [ ] `getPatternSetting` — 依 locale / pattern 初始化格式設定物件（已內化至 `CustomDate`）
- [ ] `workingNode` 狀態追蹤 — 記錄當前綁定的 input 參照（改由 v-model 取代）
