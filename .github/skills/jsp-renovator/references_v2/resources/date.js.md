# `jsp_CM/date.js` 翻新指引（v2）

## 適用範圍
- 來源：`jsp_CM/date.js`
- 目標：日期轉換、日期驗證、日期運算、假日判斷
- 對應模組：
  - `src/assets/utils/legacy/date.js`
  - `src/components/common/custom-date/CustomDate.js`
  - `src/composables/useHolidayCalendar.js`

## Pattern 對照
| 識別 pattern | v2 動作 | 分類 | 明確規則 |
| --- | --- | --- | --- |
| `toROC(...)` | `toROC(...)`（同名函式） | `ONE_TO_ONE_REPLACE` | 輸入/輸出格式維持 legacy 契約 |
| `toY2K(...)` | `toY2K(...)`（同名函式） | `ONE_TO_ONE_REPLACE` | 同上 |
| `diffDay(...)` / `diffDayROC(...)` / `diffDayY2K(...)` | `legacy/date.js` 對應函式 | `ONE_TO_ONE_REPLACE` | 保留 ROC 與 AD 判斷邏輯 |
| `addDate(...)` | `addDate(...)`（同名函式） | `ONE_TO_ONE_REPLACE` | 年月日位移規則不變 |
| `isROCdate/isADdate/isDate` | 同名驗證函式 | `ONE_TO_ONE_REPLACE` | 回傳 boolean 契約不變 |
| `SimpleDateFormat` | `new SimpleDateFormat(...)` | `ONE_TO_ONE_REPLACE` | locale 與 pattern 行為保留 |
| `dateJs.getCurrentTimeStamp()` / `dateJs.isDateYM(...)` | `dateJs` 物件同名方法 | `ONE_TO_ONE_REPLACE` | API 名稱不變 |
| `isHoliday(day)` | `isHoliday(day)` 或 `isHolidayByCalendar(day)` | `ONE_TO_ONE_REPLACE` | day code 格式不可改 |
| `dateFormatField(...)` / `dateFieldChange(...)` | 移除並改由 `CustomDate` 或 input rules 處理 | `DIRECT_REMOVE` | 不再依賴 DOM/alert |

## 建議引用方式
```js
import {
  toROC,
  toY2K,
  addDate,
  diffDay,
  isROCdate,
  isADdate,
  SimpleDateFormat,
  dateJs
} from '@/assets/utils/legacy/date.js'
```

## 使用建議
- 有日期輸入 UI 時，優先使用 `CustomDate`，不要手刻 blur/focus 格式化。
- 有假日查詢時，先以 `useHolidayCalendar().syncHolidayCalendar()` 同步再判斷。

## 直接移除清單
- 依欄位 id 在 DOM 上直接改值的格式化函式。
- 直接 `alert` 驗證錯誤的流程（改由訊息中心處理）。

## Fallback
- 分類：`FALLBACK_STUB`
- 作法：建立 `normalizeLegacyDateInput(value, mode)`，內部僅呼叫 `toROC/toY2K/isDate` 等純函式。
