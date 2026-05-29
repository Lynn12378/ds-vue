# date.js 翻新指引

## Core Principles

**REQUIRED**：
- `date.js` 的工具函數一律改為從 `@/assets/utils/date.js` 具名 import
- `dateJs.*` 命名空間的方法改為直接 import 對應函數

**FORBIDDEN**：
- 禁止自行實作日期運算邏輯

---

## Rules

### 翻新對應速查表

#### 工具函數：`@/assets/utils/date.js`

```js
import { xxx } from '@/assets/utils/date.js'
```

| 原始呼叫 | 翻新呼叫 |
|---|---|
| `isROCdate(...)` | `isROCdate(...)` |
| `diffDay(...)` | `diffDay(...)` |
| `diffDayROC(...)` | `diffDayROC(...)` |
| `diffDayY2K(...)` | `diffDayY2K(...)` |
| `toROC(Y2Kdate)` | `toROC(Y2Kdate)` |
| `toY2K(ROCdate)` | `toY2K(ROCdate)` |
| `isLeap(datInput)` | `isLeap(datInput)` |
| `addDate(...)` | `addDate(...)` |
| `getY2KToday()` | `getY2KToday()` |
| `getToday()` | `getToday()` |
| `getTime()` | `getTime()` |
| `isADdate(...)` / `isDate(...)` | `isADdate(...)`（兩者皆翻新為 `isADdate`） |
| `isROC13Mdate(...)` | `isROC13Mdate(...)` |
| `isROC13Month(...)` | `isROC13Month(...)` |
| `isROC13MonthFirstDay(...)` | `isROC13MonthFirstDay(...)` |
| `stringToDate_ROC(...)` | `stringToDate_ROC(...)` |
| `stringToDate_Y2K(...)` | `stringToDate_Y2K(...)` |
| `new SimpleDateFormat(pattern, locale)` → `.format(dateStr)` | `new SimpleDateFormat(pattern, locale)` → `.format(dateStr)` |
| `SimpleDateFormat.TW` | `SimpleDateFormat.TW` |
| `SimpleDateFormat.US` | `SimpleDateFormat.US` |
| `dateJs.getCurrentTimeStamp()` | `getCurrentTimeStamp()` |
| `dateJs.isDateYM(srcDate, isROC)` | `isDateYM(srcDate, isROC)` |

---

### 直接移除

| 原始函數 | 原因 |
|---|---|
| `toDBDate(inputDate)` | DOM 操作工具 |
| `dateFormatField(inputObj)` | DOM 操作工具 |
| `dateFieldChange(event)` | DOM 事件工具 |

### Fallback

| 原始函數 | 原因 |
|---|---|
| `isHoliday(day)` | 資料已過期（硬編碼 93-94 年假日清單），無法遷移 |
| `getDutyDay(strDate, dudt, intMonth)` | 業務邏輯，依頁面原始碼自行翻新，可引用 `addDate` 實作 |