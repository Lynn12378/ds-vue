# date.js 業務邏輯分析

## Public Functions

- [x] `isROCdate(srcData, yearLimit?, isROCBefore?)` — 驗證字串是否為合法民國日期，支援多種格式（yyyMMdd、yyy/MM/dd、yyy-MM-dd）
- [x] `diffDay(str1, str2, isROC?)` — 計算兩日期相差天數（date2 - date1），自動判斷民國 / 西元格式
- [x] `diffDayROC(strRoc1, strRoc2)` — 計算兩民國日期相差天數
- [x] `diffDayY2K(str1, str2)` — 計算兩西元日期相差天數
- [x] `toROC(Y2Kdate)` — 將西元日期（yyyy-MM-dd）轉換為民國日期字串（yyyMMdd）
- [x] `toY2K(ROCdate)` — 將民國日期字串轉換為西元日期（yyyy-MM-dd）
- [x] `isLeap(datInput)` — 判斷西元年份是否為閏年
- [x] `addDate(strDate, intYY, intMM, intDD)` — 日期加減，輸入為 yyyy-MM-dd 格式，回傳 yyyy-MM-dd
- [x] `getY2KToday()` — 取得今日西元日期（yyyy-MM-dd）
- [x] `getToday()` — 取得今日民國日期（yyyMMdd）
- [x] `getTime()` — 取得現在時刻（HHmmss）
- [x] `isADdate(srcData, yearLimit?)` — 驗證字串是否為合法西元日期（yyyyMMdd、yyyy/MM/dd、yyyy-MM-dd）
- [x] `isROC13Mdate(srcData, yearLimit?)` — 驗證民國日期，月份允許 01-13（含第 13 月）
- [x] `isROC13Month(srcData)` — 驗證字串是否為民國年月格式，月份允許 01-13
- [x] `isROC13MonthFirstDay(srcData, yearLimit?)` — 驗證民國年月日，月份允許 01-13，且日期必須為 01
- [x] `stringToDate_ROC(srcData, isROCBefore?)` — 民國日期字串轉為 JS Date 物件（內部輔助函式）
- [x] `stringToDate_Y2K(srcData)` — 西元日期字串轉為 JS Date 物件（內部輔助函式）
- [x] `SimpleDateFormat(pattern, locale)` — 依指定 pattern 與語系格式化日期字串，支援民國（TW）與西元（US）
- [x] `dateJs.getCurrentTimeStamp()` — 取得當前 timestamp 字串（yyyy-MM-dd HH:mm:ss.SSS）
- [x] `dateJs.isDateYM(srcDate, isROC)` — 驗證字串是否為年月格式（民國：yyyMM；西元：yyyyMM）

## 不遷移項目

- [ ] `isHoliday(day)` — 硬編碼 93-94 年假日清單，資料已過期，無法遷移
- [ ] `getDutyDay(strDate, dudt, intMonth)` — 推放款應繳日計算，屬頁面業務邏輯，由各頁面自行實作
- [ ] `toDBDate(inputDate)` — 日期格式轉換供 DOM input 使用，JSP 層級工具，不遷移
- [ ] `dateFormatField(inputObj)` — 操作 DOM input 元素，JSP 層級工具，不遷移
- [ ] `dateFieldChange(event)` — DOM 事件處理，JSP 層級工具，不遷移
