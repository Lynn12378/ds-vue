# CSRUtil.js 業務邏輯分析

## Public Functions

### 可遷移工具函數

- [x] `CSRUtil.isSuccess(resp)` — 判斷 Ajax 回應的 `ErrMsg.returnCode` 是否為 0（代表成功）
- [x] `CSRUtil.getReturnMessage(resp)` — 從 Ajax 回應物件取出 `ErrMsg` 訊息物件
- [x] `CSRUtil.isOnProgress(xmlhttp)` — 判斷 XMLHttpRequest 是否仍在進行中（readyState 1~3）
- [x] `CSRUtil.$fmt(v, pattern, isInput)` — 依指定 pattern 格式化數字字串（支援千分位、小數位控制）
- [x] `CSRUtil.round(val, scale)` — 將數值四捨五入至指定小數位數，預設 4 位
- [x] `CSRUtil.parseDate(str)` — 將 YYYY-MM-DD 格式字串轉為 Date 物件（毫秒數）
- [x] `CSRUtil.dateRange(d1, d2)` — 計算兩個 YYYY-MM-DD 日期之間相差天數（d2 - d1）
- [x] `CSRUtil.pressNumber(code)` — 判斷 keyCode 是否為數字、負號、小數點或 Backspace（用於 keypress 事件）
- [x] `CSRUtil.upNumber(code)` — 判斷 keyCode 是否為數字相關按鍵（含 numpad，用於 keyup 事件）
- [x] `CSRUtil.getNumber(val)` — 將值轉為數字，遇 undefined / null / NaN 時回傳 0
- [x] `Date.toROC(d)` — 將西元日期字串轉為民國日期字串，分隔符號為 `/`（如 `114/05/27`）
- [x] `Date.toInputROC(d, delimiter)` — 將西元日期字串轉為民國日期字串，可自訂分隔符號
- [x] `CSRUtil.maskHandler.getMaskStr(str, beginIndex, maskLength, inSign)` — 對字串指定位置進行遮罩替換
- [x] `CSRUtil.maskHandler.getMaskID(str, maskLength)` — 遮罩身分證字號中間 n 碼（預設 3 碼）
- [x] `CSRUtil.maskHandler.getMaskName(str, inSign)` — 遮罩姓名第 2 個字
- [x] `CSRUtil.maskHandler.getMaskAddress(str, inSign)` — 遮罩地址第 3 碼之後的所有字元
- [x] `CSRUtil.maskHandler.getMaskAddress2(str, inSign)` — 遮罩地址（超過 20 碼遮後半、超過 10 碼遮後段、10 碼以內不遮）

### 不遷移項目

- [ ] `CSRUtil.voToInputs(panel_id, vo)` — 將 JS 物件的值寫入指定 DOM 容器內的 input 欄位（DOM 操作，依賴 Prototype.js）
- [ ] `CSRUtil.inputsToVo(panel_id, includeDisabled)` — 將 DOM 容器內 input 欄位值收集為 JS 物件（DOM 操作，依賴 Prototype.js）
- [ ] `CSRUtil.createCoverPage(inputOpts)` — 建立覆蓋整頁的遮罩 div，用於 submit once 防重複送出（DOM 操作）
- [ ] `CSRUtil.AjaxHandler` — Ajax 請求封裝，包含 cover page 顯示、錯誤訊息彈窗、timeout 控制（框架層邏輯）
- [ ] `CSRUtil.defaultAjaxHandler` — 預設 Ajax 回應處理器，供 Prototype.js Responders 使用（框架依賴）
- [ ] `CSRUtil.getMsgBoard(msg, returnCode)` — 取得底部訊息框並寫入訊息（DOM frame 操作）
- [ ] `CSRUtil.clearTable(tableID)` — 清除 HTML table 的所有資料列（DOM 操作）
- [ ] `CSRUtil.mapToSelectOptions(e, m, d)` — 將 Map 物件轉為 select 選項並填入（DOM 操作，依賴 Prototype.js）
- [ ] `CSRUtil.listToSelectOptions(e, l, d)` — 將 List 物件轉為 select 選項並填入（DOM 操作，依賴 Prototype.js）
- [ ] `CSRUtil.mark(elem)` / `CSRUtil.unmark(elem)` — 對 DOM 元素設定 / 清除錯誤背景色（DOM 操作）
- [ ] `CSRUtil.exportXls(fileName, grids, sheetNames)` — 將 grid 資料匯出為 XLS（依賴舊 grid 元件）
- [ ] `CSRUtil.linkTo(linkParams, formID)` — 發送 POST 表單並儲存 LP_JSON 頁面參數，實現頁面跳轉（頁面導覽）
- [ ] `CSRUtil.linkBack(backAction, cbFuncOptions)` — 依 LP_JSON 記錄返回上一頁（頁面導覽）
- [ ] `CSRUtil.getLP_JSON(remove)` — 取得最後一筆 LP_JSON 頁面導覽參數（頁面導覽狀態管理）
- [ ] `CSRUtil.isBackLink(formID, backFunc)` — 判斷是否為返回來源，並將 BQ_ARG 還原至表單（頁面導覽）
- [ ] `CSRUtil.clearLP_JSON()` — 清除所有 LP_JSON 頁面導覽記錄（頁面導覽狀態管理）
- [ ] `CSRUtil.keepParamsManager` — 跨頁面保存/取回參數的管理物件（頁面狀態管理，依賴 sessionStorage / top frame）
- [ ] `CSRUtil.UICore` — 設定 webBase / imageBase 路徑，以及子系統判斷工具（JSP 環境依賴）
- [ ] `CSRUtil.hasInclude_jQuery()` / `CSRUtil.hasInclude_Prototype()` — 判斷全域是否已載入 jQuery / Prototype.js（JSP 環境依賴）
- [ ] `autoFormatToDate()` — 為 `datatype="date"` 的 input 自動格式化並限制輸入（DOM 操作，依賴 Prototype.js）
- [ ] `autoFormatToNumber(elemID)` — 為 `datatype="number"` 的 input 自動格式化數字並限制輸入（DOM 操作，依賴 Prototype.js）
- [ ] `MsgWin` — 可拖曳的訊息視窗元件（DOM 操作，依賴 Prototype.js）
- [ ] `BigNumber` — 高精度數值運算類別（供 `$fmt` 內部使用，隨 `$fmt` 一同遷移，不獨立公開）
