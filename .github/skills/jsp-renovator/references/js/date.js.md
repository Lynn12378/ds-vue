# date.js 自訂依賴翻新指引

## Core Principles

- `<script src=".../date.js">` 記錄路徑後直接移除
- `date.js` 的工具函數一律改為從 `@/assets/utils/date.js` 具名 import
- `dateJs.*` 命名空間改為直接 import 對應函數（移除 `dateJs.` 前綴）
- **FORBIDDEN**：禁止自行實作日期運算邏輯

---

## 翻新對照表

| 原始呼叫 | 翻新對應 | 備註 |
|---|---|---|
| `isROCdate(...)` | `isROCdate(...)` | `import { isROCdate } from '@/assets/utils/date.js'` |
| `diffDay(...)` | `diffDay(...)` | `import { diffDay } from '@/assets/utils/date.js'` |
| `diffDayROC(...)` | `diffDayROC(...)` | `import { diffDayROC } from '@/assets/utils/date.js'` |
| `diffDayY2K(...)` | `diffDayY2K(...)` | `import { diffDayY2K } from '@/assets/utils/date.js'` |
| `toROC(Y2Kdate)` | `toROC(Y2Kdate)` | `import { toROC } from '@/assets/utils/date.js'` |
| `toY2K(ROCdate)` | `toY2K(ROCdate)` | `import { toY2K } from '@/assets/utils/date.js'` |
| `toDBDate(inputDate)` | `toDBDate(inputDate)` | `import { toDBDate } from '@/assets/utils/date.js'` |
| `isLeap(datInput)` | `isLeap(datInput)` | `import { isLeap } from '@/assets/utils/date.js'` |
| `addDate(...)` | `addDate(...)` | `import { addDate } from '@/assets/utils/date.js'` |
| `getY2KToday()` | `getY2KToday()` | `import { getY2KToday } from '@/assets/utils/date.js'` |
| `getToday()` | `getToday()` | `import { getToday } from '@/assets/utils/date.js'` |
| `getTime()` | `getTime()` | `import { getTime } from '@/assets/utils/date.js'` |
| `isDate(srcDate)` | `isADdate(srcDate)` | `import { isADdate } from '@/assets/utils/date.js'`；`isDate` 為 `isADdate` 的別名 |
| `isADdate(...)` | `isADdate(...)` | `import { isADdate } from '@/assets/utils/date.js'` |
| `isROC13Mdate(...)` | `isROC13Mdate(...)` | `import { isROC13Mdate } from '@/assets/utils/date.js'` |
| `isROC13Month(...)` | `isROC13Month(...)` | `import { isROC13Month } from '@/assets/utils/date.js'` |
| `isROC13MonthFirstDay(...)` | `isROC13MonthFirstDay(...)` | `import { isROC13MonthFirstDay } from '@/assets/utils/date.js'` |
| `stringToDate_ROC(...)` | `stringToDate_ROC(...)` | `import { stringToDate_ROC } from '@/assets/utils/date.js'` |
| `stringToDate_Y2K(...)` | `stringToDate_Y2K(...)` | `import { stringToDate_Y2K } from '@/assets/utils/date.js'` |
| `new SimpleDateFormat(pattern, locale)` | `new SimpleDateFormat(pattern, locale)` | `import { SimpleDateFormat } from '@/assets/utils/date.js'` |
| `SimpleDateFormat.TW` | `SimpleDateFormat.TW` | 透過 `SimpleDateFormat` 存取，無需獨立 import |
| `SimpleDateFormat.US` | `SimpleDateFormat.US` | 透過 `SimpleDateFormat` 存取，無需獨立 import |
| `dateJs.getCurrentTimeStamp()` | `getCurrentTimeStamp()` | `import { getCurrentTimeStamp } from '@/assets/utils/date.js'` |
| `dateJs.isDateYM(srcDate, isROC)` | `isDateYM(srcDate, isROC)` | `import { isDateYM } from '@/assets/utils/date.js'` |
| `dateFormatField(inputObj)` | — | — |
| `dateFieldChange(event)` | — | — |
| `isHoliday(day)` | `isHoliday(day)` | `import { isHoliday } from '@/assets/utils/date.js'` |
| `getDutyDay(strDate, dudt, intMonth)` | `getDutyDay(strDate, dudt, intMonth)` | `import { getDutyDay } from '@/assets/utils/date.js'` |