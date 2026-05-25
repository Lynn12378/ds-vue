---
description: JSP `date.js` → Day.js / `utils/common.js` 翻新指引
---

# 日期工具語法轉換

## 固定引用路徑

| 用途 | 引用語法 | 引用路徑 |
|---|---|---|
| common 日期工具 | `import useCommon from '@/assets/utils/common.js'` | `src/assets/utils/common.js` |
| Day.js | `import dayjs from 'dayjs'` | npm `dayjs` |

---

## 語法轉換對照

| 舊語法（date.js） | 新語法 | 引用路徑 |
|---|---|---|
| `toROC(Y2Kdate)` | `useCommon().tranCEorROCDate(date, 'rocDate')` | `src/assets/utils/common.js` |
| `toY2K(ROCdate)` | `useCommon().tranCEorROCDate(date, 'ceDate')` | `src/assets/utils/common.js` |
| `isROCdate(srcData)` | `useCommon().isValidROCDate(date)` | `src/assets/utils/common.js` |
| `isADdate(srcData)` | `useCommon().isValidDate(date, true)` | `src/assets/utils/common.js` |
| `getY2KToday()` | `useCommon().getNowDate(true)` | `src/assets/utils/common.js` |
| `getToday()` | `useCommon().tranCEorROCDate(useCommon().getNowDate(true), 'rocDate')` | `src/assets/utils/common.js` |
| `getTime()` | `useCommon().getNowTime(0)` | `src/assets/utils/common.js` |
| `diffDayROC(str1, str2)` | `dayjs(useCommon().tranCEorROCDate(str2,'ceDate')).diff(dayjs(useCommon().tranCEorROCDate(str1,'ceDate')), 'day')` | `src/assets/utils/common.js` + `dayjs` |
| `diffDayY2K(str1, str2)` | `dayjs(str2).diff(dayjs(str1), 'day')` | `dayjs` |
| `addDate(strDate, yy, mm, dd)` | `dayjs(strDate).add(yy,'year').add(mm,'month').add(dd,'day').format('YYYY-MM-DD')` | `dayjs` |
| `isLeap(year)` | `dayjs(year + '-01-01').isLeapYear()` | `dayjs` |
| `dateJs.isDateYM(srcDate, isROC)` | `useCommon().isValidROCDate(date)` / `useCommon().isValidDate(date, true)` | `src/assets/utils/common.js` |
| `dateJs.getCurrentTimeStamp()` | `dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')` | `dayjs` |
| `SimpleDateFormat` | `dayjs(date).format(pattern)` | `dayjs` |

---

## 無對應 API

| 舊語法（date.js） | 新語法 | 引用路徑 |
|---|---|---|
| `isHoliday(day)` | `// TODO: isHoliday 假日清單已過期，待人工處理` | - |
| `getDutyDay()` | `// TODO: getDutyDay 屬頁面業務規則，待人工翻新` | - |
