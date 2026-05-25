---
description: JSP `date.js` → Day.js / `utils/common.js` 翻新指引
---

# 日期工具翻新規範

## Core Principles

**REQUIRED**
- `date.js` 函式一律依下方對照表替換，優先使用 `utils/common.js`，其次使用 Day.js
- `utils/common.js` 使用方式：`import useCommon from '@/assets/utils/common.js'`

**FORBIDDEN**
- 禁止重新實作 date.js 內部邏輯
- `isHoliday` 無法翻新，標記 TODO

---

## date.js → 對照表

| date.js 函式 | 對應來源 | 對應函式／方式 |
|---|---|---|
| `toROC(Y2Kdate)` | common.js | `tranCEorROCDate(date, 'rocDate')` |
| `toY2K(ROCdate)` | common.js | `tranCEorROCDate(date, 'ceDate')` |
| `isROCdate(srcData)` | common.js | `isValidROCDate(date)` |
| `isADdate(srcData)` | common.js | `isValidDate(date, true)` |
| `getY2KToday()` | common.js | `getNowDate(true)` |
| `getToday()` | common.js | `tranCEorROCDate(getNowDate(true), 'rocDate')` |
| `getTime()` | common.js | `getNowTime(0)` |
| `diffDayROC(str1, str2)` | Day.js | `dayjs(tranCEorROCDate(str2,'ceDate')).diff(dayjs(tranCEorROCDate(str1,'ceDate')), 'day')` |
| `diffDayY2K(str1, str2)` | Day.js | `dayjs(str2).diff(dayjs(str1), 'day')` |
| `addDate(strDate, yy, mm, dd)` | Day.js | `dayjs(strDate).add(yy,'year').add(mm,'month').add(dd,'day').format('YYYY-MM-DD')` |
| `isLeap(year)` | Day.js | `dayjs(year+'-01-01').isLeapYear()` |
| `dateJs.isDateYM(srcDate, isROC)` | common.js | `isValidROCDate(date)` / `isValidDate(date, true)` |
| `dateJs.getCurrentTimeStamp()` | Day.js | `dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')` |
| `SimpleDateFormat` | Day.js | `dayjs(date).format(pattern)` |
| `getDutyDay()` | 頁面內業務邏輯 | 依 R1 直接翻新 |
| `isHoliday(day)` | 無對應 | `// TODO: isHoliday 假日清單已過期，待人工處理` |

---

## Example

```jsp
<%-- JSP --%>
var rocDate = toROC(y2kDate);
var y2kDate = toY2K(rocDate);
var daysDiff = diffDayROC(str1, str2);
```

```js
// Vue
import useCommon from '@/assets/utils/common.js'
import dayjs from 'dayjs'

const { tranCEorROCDate, getNowDate, isValidROCDate } = useCommon()

const rocDate = tranCEorROCDate(y2kDate, 'rocDate')

const y2kDate = tranCEorROCDate(rocDate, 'ceDate')

const daysDiff = dayjs(tranCEorROCDate(str2, 'ceDate'))
  .diff(dayjs(tranCEorROCDate(str1, 'ceDate')), 'day')
```
