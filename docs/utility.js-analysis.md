# utility.js 業務邏輯分析

## Public Functions

### 可遷移工具函數

- [x] `addPrefix(str, len, prestr)` — 將字串左側補填指定字元至目標長度
- [x] `MoneyFormat(inputString)` — 將數字轉換為千分位格式字串（如 `123,456,789`）
- [x] `DateFormat(strDate)` — 將民國日期數字字串插入分隔點（如 `920101` → `92.01.01`）
- [x] `timeForTextfield(timevalue)` — 將 DB 時間格式（`hh:mm:ss` 或 `hh.mm.ss`）標準化為 `hhmmss` 字串
- [x] `formatCurrency(num)` — 將數字轉換為帶兩位小數的千分位貨幣格式字串（如 `1,234,567.89`）
- [x] `utility.keypressNumberOnly(isDot, isNegative)` — 判斷 keypress 事件的 keyCode 是否為允許的數字按鍵
- [x] `utility.keypressNumberValue(obj, isDot, isNegative)` — 判斷 keypress 輸入是否為合法數值並處理負號、小數點邊界

### 不遷移項目

- [ ] `submitToUpper(element)` — 將 form 內所有 text input 值轉大寫（DOM 操作，JSP 表單送出前處理）
- [ ] `copyKey(formx)` — 將頁面主鍵欄位值複製至 `K_` 前綴的 hidden 欄位（DOM 操作）
- [ ] `stat()` / `fix()` — 持續定時固定頁面 MainTitle 列的捲動位置（DOM 操作，JSP 頁面佈局）
- [ ] `jump(current_element, next_element, len)` — 當輸入達到指定長度時自動跳至下一個輸入欄位（DOM 操作）
- [ ] `uncoverDocument(doc)` / `coverDocument(doc)` — 建立/移除頁面覆蓋遮罩 div，用於 submit once 防重複送出（DOM 操作）
- [ ] `submitOnce(button, openWindow, coverOnly)` — 防止表單重複送出，送出後 disable 按鈕並覆蓋頁面（DOM 操作，框架層）
- [ ] `disableButton(theform)` / `enableButton(theform)` — 停用/啟用 form 內所有送出按鈕（DOM 操作）
- [ ] `enableElements(elems)` — 依 id 清單啟用指定 DOM 元素的 readonly/disabled（DOM 操作）
- [ ] `keyWordReplaceFullSpace(frm, keyWord, ignoreCase)` — 將含關鍵字的 input 欄位值中的全形空白全部移除（DOM 操作）
- [ ] `replaceFullSpace(frm)` — 將 form 內所有 text/hidden input 的全形空白移除（DOM 操作）
- [ ] `trimSpace(frm)` — 去除 form 內所有 text/hidden input 值的右側半形空白（DOM 操作）
- [ ] `showHintBox(bID)` / `hideHintBox(bID)` — 依游標位置顯示/隱藏提示文字框（DOM 操作，依賴全域 event 物件）
- [ ] `createUtility()` — 建立 `utility` 全域物件，包含表單 submit 攔截、eBAF 參數注入、`window.open` 覆寫等框架層邏輯（JSP 框架依賴）
- [ ] `utility.overrideSubmitByForm(theForm)` — 攔截 form.submit 並注入 eBAF 認證參數與 requestTimeField（JSP 框架依賴）
- [ ] `utility.keepResponseTimeEndParameters(uuid)` — 記錄 Ajax 回應時間參數至 top window（JSP 框架依賴）
- [ ] `utility.keep_eBAF_parameter(opt)` — 將 eBAF 認證參數存入 top window（JSP 框架依賴）
- [ ] `CSS_Selectors` — 依屬性條件過濾 DOM 元素清單的工具物件（DOM 操作，JSP 環境依賴）
- [ ] `pageSupport` — 頁面責任人查詢浮動視窗元件，依功能代碼查詢並顯示 IT/業務負責人資訊（DOM 操作，JSP 環境依賴）
