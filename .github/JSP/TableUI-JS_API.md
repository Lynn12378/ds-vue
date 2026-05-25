# TableUI API 文件

> `TableUI` 是一個基於原生 JavaScript 的表格 UI 元件，支援分頁、排序、固定欄位、隱藏欄位、自動 CheckBox、行內編輯（AutoInput）、XLS 匯出等功能。  
> 相依性：需搭配 `prototype.js` 或 `jQuery.js`（擇一）。

---

## 目錄

1. [初始化](#初始化)
2. [資料載入](#資料載入)
3. [換頁控制](#換頁控制)
4. [資料取得](#資料取得)
5. [排序](#排序)
6. [AutoCheckBox](#autocheckbox)
7. [AutoInput（行內編輯）](#autoinput行內編輯)
8. [TD 欄位控制](#td-欄位控制)
9. [驗證](#驗證)
10. [匯出 XLS](#匯出-xls)
11. [顯示與尺寸](#顯示與尺寸)
12. [表格操作歷程](#表格操作歷程)
13. [全域工具函式](#全域工具函式)

---

## 初始化

```js
var grid = new TableUI(config);
```

### config 參數

| 參數 | 型別 | 說明 |
|------|------|------|
| `table` | `string \| Element` | 目標 table 的 ID 或 DOM 元素 |
| `column` | `Array<Object>` | 欄位設定（見下方欄位設定） |
| `headerColumn` | `Array<Object>` | 獨立的標頭欄位設定（不設定時同 column） |
| `split` | `Array<string>` | 多行欄位時，指定換行的 key |
| `pageSize` | `number` | 每頁筆數；`0` 為不分頁 |
| `isLoadByFatch` | `boolean \| number` | 啟用真分頁（每次 AJAX 取資料）；數字代表每批筆數上限 |
| `title` | `string \| Object` | 表格標題 |
| `printMode` | `boolean` | 列印模式（停用 overDiv、不產生 input） |
| `overDiv` | `boolean \| Object` | 控制捲動區塊；`false` 停用，Object 可設 `maxHeight` / `minHeight` |
| `fixedColumns` | `Array \| false` | 固定欄位群組編號 |
| `hiddenColumns` | `Array` | 隱藏欄位群組編號 |
| `pageInfo` | `boolean` | 是否顯示分頁資訊文字 |
| `recordInfoPattern` | `string` | 自訂分頁資訊格式，變數：`{nowPage}` `{totalPage}` `{totalRecord}` `{totalGroup}` |
| `allSortable` | `boolean` | 全欄預設可排序（預設 `true`） |
| `allRenderInCount` | `boolean` | 合計列是否套用 render（預設 `false`） |
| `whenDataNull` | `string` | 資料為空時的顯示值（預設全形空白） |
| `autoCheckBox` | `boolean \| Object` | 啟用自動 CheckBox（見 AutoCheckBox 設定） |
| `rowClick` | `function(tr, record, sn)` | 點擊資料列的 callback |
| `setRecordBackground` | `function(records): string` | 依資料決定 tbody 背景色 |
| `setRecordClass` | `function(records): string` | 依資料決定 tbody 的 CSS class |
| `validateRecord` | `boolean \| function(record, sn): boolean` | 欄位驗證規則 |
| `validateRecordCheckedOnly` | `boolean` | 只驗證已勾選的資料 |
| `default_total_header` | `string` | 合計列預設標題文字 |
| `default_subTotal_header` | `string` | 小計列預設標題文字 |
| `beforeLoad` | `function(div, table_id, ctrl)` | 資料載入前 callback |
| `afterLoad` | `function(div, table_id, ctrl)` | 資料載入後 callback |
| `beforePageChange` | `function(nowPage, targetPage, totalPage, div, table_id, ctrl): boolean` | 換頁前 callback；回傳 `false` 可阻止換頁 |
| `pageChange` | `function(nowPage, totalPage, div, table_id, ctrl)` | 換頁後 callback |

---

### 欄位設定（column item）

```js
{
  key: 'fieldName',        // 對應資料的 key
  header: '欄位名稱',       // 表頭顯示文字（可為 Element 或 function）
  sortable: true,          // 是否可排序（預設同 allSortable）
  sortKey: 'otherKey',     // 排序時使用的 key（預設同 key）
  sortRule: 'string',      // 排序規則：string | number | date | rocdate
  dataType: 'string',      // 資料型態：string | number | date | rocdate | datetime
  format: Object,          // 數字格式化（im / rc / rz）
  render: function(record, value, sn, key),  // 自訂顯示內容
  input: Object,           // 行內編輯設定（見 AutoInput）
  defaultValue: any,       // 資料為空時的預設值
  whenDataNull: string,    // 資料為空時顯示文字
  groupKey: Array | number,// rowSpan 群組鍵
  ignoreGroup: boolean,    // 是否忽略群組
  fixedColumn: boolean,    // 是否可固定欄位
  hiddenColumn: boolean,   // 是否可隱藏欄位
  staticWidth: number,     // 固定欄位像素寬度
  attrs: Object,           // td 屬性（colSpan / rowSpan 等）
  styles: Object,          // td inline style
  classes: Array | string, // td CSS class
  renderInCount: boolean,  // 合計列是否套用 render
  colGroup: number,        // 自動填入的欄位群組編號（勿手動設定）
}
```

---

## 資料載入

### `grid.load(records, totalCount, subTotalCount, preCheckedValues)` / `grid.loadin()`

載入資料。

| 參數 | 型別 | 說明 |
|------|------|------|
| `records` | `Array<Object>` | 資料陣列 |
| `totalCount` | `Object \| Array<Object>` | 合計列資料（選填） |
| `subTotalCount` | `Array` | 小計列資料（選填） |
| `preCheckedValues` | `Array` | 預先勾選的 autoCheckBox 值（選填） |

```js
grid.load(records);
grid.load(records, totalRow);
grid.load(records, totalRow, subTotalRows, ['value1', 'value2']);
```

---

### `grid.reload()` / `grid.reloadin(preCheckedValues)`

重新整理當前頁（資料不重查）。

---

### `grid.clear()`

清除所有資料與畫面。

---

### `grid.addRecords(records, autoCheckStatus)`

新增資料至末尾（不支援群組模式）。

| 參數 | 型別 | 說明 |
|------|------|------|
| `records` | `Object \| Array<Object>` | 要新增的資料 |
| `autoCheckStatus` | `boolean` | 是否預設勾選（選填） |

---

### `grid.deleteRecords(records)`

從表格中刪除指定資料物件。

---

### `grid.resetTotalCount(totalCount)`

單獨更新合計列資料（不重載資料）。

---

### `grid.resetSubTotalCount(subTotalCount)`

單獨更新小計列資料（會重載資料）。

---

## 換頁控制

> 以下方法僅在 `pageSize > 0` 時有效。

| 方法 | 說明 |
|------|------|
| `grid.pageCtrl.loadin(...)` | 同 `grid.load()` |
| `grid.pageCtrl.loadFirst()` | 跳至第一頁 |
| `grid.pageCtrl.loadPrevious()` | 上一頁 |
| `grid.pageCtrl.loadNext()` | 下一頁 |
| `grid.pageCtrl.loadLast()` | 跳至最後一頁 |
| `grid.pageCtrl.loadPage(pageNo)` | 跳至指定頁碼（從 1 起） |

---

## 資料取得

### `grid.getAllRecords(template?)`

取得全部資料。

```js
var all = grid.getAllRecords();
var names = grid.getAllRecords('name');         // 只取 name 欄位值（Array<string>）
var objs = grid.getAllRecords(['id', 'name']);   // 只取指定欄位（Array<Object>）
```

---

### `grid.getCurrentPageRecords(template?)`

取得當前頁資料。

---

### `grid.getDeletedRecords(template?)`

取得已被 `deleteRecords()` 刪除的資料。

---

### `grid.getCheckedRecords(template?, includeDisabled?)`

取得已勾選（autoCheckBox）的資料。

| 參數 | 說明 |
|------|------|
| `template` | 同 getAllRecords |
| `includeDisabled` | 是否包含 disabled 的已勾選項目（預設 `false`） |

---

### `grid.getUncheckedRecords(template?, includeDisabled?)`

取得未勾選的資料。

---

### `grid.getErrorRecords(template?)` / `grid.getCorrectRecords(template?)`

取得驗證失敗 / 通過的資料。

---

### `grid.getCheckedErrorRecords(template?, includeDisabled?)`  
### `grid.getCheckedCorrectRecords(template?, includeDisabled?)`

取得已勾選且驗證失敗 / 通過的資料。

---

### `grid.hasRecords()`

回傳 `boolean`，判斷是否有資料。

---

### `grid.getRecordsBySerialNo(sns, template?)`

依序號陣列取得資料物件。

---

### `grid.getRecordByCell(node)` / `grid.getRecordsByCell(node)`

依 DOM 元素（td / input / 任意子元素）取得對應資料物件。

```js
grid.getRecordByCell(td);       // 回傳單筆 Object
grid.getRecordsByCell(td);      // 回傳 Array（跨欄 rowSpan 時可能多筆）
```

---

### `grid.getTotalCount()` / `grid.getSubTotalCount()`

取得合計 / 小計列資料。

---

## 排序

### `grid.sort(key, isIncrease, sortRule?)`

對資料進行排序並重新渲染。

| 參數 | 型別 | 說明 |
|------|------|------|
| `key` | `string` | 排序的資料欄位 key |
| `isIncrease` | `boolean` | `true` 正向、`false` 逆向 |
| `sortRule` | `string` | `string`（預設）\| `number` \| `date` \| `rocdate` |

```js
grid.sort('amount', true, 'number');   // 金額升冪
grid.sort('date', false, 'date');      // 日期降冪
```

---

## AutoCheckBox

在 config 中加入 `autoCheckBox` 設定啟用。

### autoCheckBox 設定

```js
autoCheckBox: {
  valueKey: 'id',              // checkbox value 使用的資料 key
  type: 'checkbox',            // checkbox（預設）| radio
  insertPosition: 0,           // 插入位置（欄位索引，預設 0）
  isSelectAll: true,           // 是否顯示全選按鈕；或 function(input, checked, records)
  text: '選取',                // 欄位標題文字
  groupKey: Array | number,    // 群組 rowSpan key
  withoutGroup: false,         // 強制不使用群組
  doNotRowSpan: false,         // 不跨行合併
  checkRule: function(record, sn): boolean,    // 初始勾選規則
  disableRule: function(record, sn): boolean,  // 停用規則
  genRule: function(record, sn): boolean,      // 是否產生 checkbox
  displayRule: function(record, value, sn): boolean, // 是否顯示 checkbox
  action: function(input, checked, records),   // 勾選後 callback
  returnValue: string | Array, // getCheckedRecords 回傳格式
  highlight: false,            // 勾選後 highlight 整列
  noBreakLine: false,          // 全選 checkbox 與文字不換行
  attrs: Object,               // 欄位 td 屬性
}
```

---

### AutoCheckBox 方法

| 方法 | 說明 |
|------|------|
| `grid.checkAll(isChecked?)` | 全選 / 全取消。不傳參數時依全選 checkbox 狀態決定 |
| `grid.setCurrentPageAutoCheckBox(checked)` | 設定當前頁全選狀態 |
| `grid.setAutoCheckBox(value, checked)` | 依 valueKey 值設定單筆勾選狀態 |
| `grid.setThisAutoCheckBox(td, checked)` | 依 DOM 元素設定勾選狀態 |
| `grid.isAutoCheckBoxSelected(td)` | 判斷該筆是否已勾選，回傳 `boolean` |
| `grid.showAutoCheckBox(td, checked)` | 顯示並設定指定列的 checkbox |
| `grid.hideAutoCheckBox(td, checked)` | 隱藏並設定指定列的 checkbox |

---

## AutoInput（行內編輯）

在欄位設定的 `input` 屬性中設定。

### input 設定

```js
input: {
  type: 'text',               // text | number | date | rocdate | textarea | select | checkbox | radio | button | show
  attrs: Object,              // input 屬性
  styles: Object,             // input style
  className: string | Array,  // input CSS class
  events: Object,             // input 事件（change / blur / click 等）
  action: function(input, records, displayBlock, oldValue, isChanged), // 值改變後 callback
  startAction: function(input, records, displayBlock, value, false),   // 初始化 callback
  actionWhenStart: boolean,   // 是否初始就執行 action
  disableRule: boolean | function(record, value, sn, key): boolean,
  readOnlyRule: boolean | function(record, value, sn, key): boolean,
  genRule: boolean | function(record, value, sn): boolean, // 是否預設顯示 input
  easyEdit: boolean | function,  // 點擊文字才切換 input
  clickText: string,          // easyEdit 的提示文字
  followText: string | function, // input 後附加文字
  // text / number 專用
  maxlength: number,
  size: number,
  // textarea 專用
  cols: number,
  rows: number,
  shortTextLength: number,    // 縮短顯示長度
  lengthLimit: { length, countByByte, customMsg }, // 字數限制（需 InputUtility）
  // select 專用
  opts: Object | Array,       // 選項資料
  opts_before: Object,        // 最前方選項
  opts_after: Object,         // 最後方選項
  optionKey: string,          // Array opts 中的 key 欄位名稱
  optionValue: string | function, // Array opts 中的 value 欄位名稱
  // checkbox / radio 專用（多選）
  opts: Object,               // { value: '顯示文字', ... }
  isChangeAll: boolean,       // 是否跨 rowSpan 同步
  // button 專用
  button_text: string,        // 按鈕顯示文字
}
```

---

### AutoInput 方法

| 方法 | 說明 |
|------|------|
| `grid.getAutoInput(tr, template?)` | 取得指定列的 input DOM Map |
| `grid.exchangeAutoInput(tr, template?, isCloseInput?)` | 切換 input 顯示 / 隱藏 |
| `grid.disableAutoInput(tr, template?, isDisabled?)` | 啟用 / 停用 input |
| `grid.setValueToAutoInput(tr, key, value)` | 設定 input 值（同步更新資料與顯示） |
| `grid.isAutoInputHidden(input)` | 判斷 input 是否隱藏，回傳 `boolean \| null` |

---

## TD 欄位控制

### `grid.getThisRecordTD(tr, template?)`

取得指定列的 td DOM。

```js
var tds = grid.getThisRecordTD(tr);              // 全部欄位
var tds = grid.getThisRecordTD(tr, 'amount');     // 單一欄位
var tds = grid.getThisRecordTD(tr, ['id', 'name']); // 多欄位
// 回傳 Array<Map<key, td | Array<td>>>
```

---

### `grid.setValueToTD(tr, key, value)`

設定指定欄位的顯示值（同步更新資料物件）。

```js
grid.setValueToTD(tr, 'amount', 1000);
```

---

## 驗證

### `grid.validTable()`

執行全部資料驗證（依 `validateRecord` 規則），回傳錯誤筆數。

```js
var errors = grid.validTable();
if (errors > 0) { /* 有錯誤 */ }
```

---

### `grid.validCheckedOnTable(includeDisabled?)`

只驗證已勾選資料，回傳錯誤筆數。

---

### `grid.resetValidate()`

重置驗證狀態（清除所有錯誤標記）。

---

### `grid.setValidRecord(node, validResult)`

手動設定單筆資料的驗證結果。

| 參數 | 型別 | 說明 |
|------|------|------|
| `node` | `Element` | 該資料列的任意子元素 |
| `validResult` | `boolean` | `true` = 正確，`false` = 錯誤 |

---

### `grid.setValidRecordByRecord(records, validResult)`

手動設定資料物件的驗證結果。

---

## 匯出 XLS

### `grid.exportAllToXLS(fileName, isCount?, bgColorType?, sheetName?)`

匯出全部資料至 XLS 檔案。

```js
grid.exportAllToXLS('report');
```

---

### `grid.exportCheckToXLS(fileName, isCount?, bgColorType?, sheetName?)`

匯出已勾選資料至 XLS 檔案。

---

### `grid.exportToXLS(fileName, records, isCount?, bgColorType?, sheetName?)`

匯出指定資料。`fileName` 傳 `null` 時回傳 JSON 格式（供多 Sheet 合併使用）。

---

### `grid.getXlsSettingJSON(sheetName?)`

取得欄位設定的 JSON 字串（供後端產生 XLS）。

---

## 顯示與尺寸

| 方法 | 說明 |
|------|------|
| `grid.show()` | 顯示表格 |
| `grid.hide()` | 隱藏表格 |
| `grid.resize()` / `grid.resetDiv()` / `grid.resetDivHeight()` | 重新計算表格尺寸與高度 |
| `grid.scrollTop()` | 捲動至頂端 |
| `grid.scrollBottom()` | 捲動至底部 |

---

## 表格操作歷程

### `grid.getTableInfo(setPage?, setSort?)`

取得當前操作狀態（目前頁碼、排序、固定 / 隱藏欄位）。

```js
var info = grid.getTableInfo();
// 回傳：{ pageNo, sortRecords, fixedColumns, hiddenColumns }
```

---

### `grid.setTableInfo(info)`

還原操作狀態（換頁 + 重新排序）。

```js
grid.setTableInfo(info);
```

---

## 全域工具函式

這些函式定義在全域範圍，可在頁面任意位置使用。

---

### `getTableUIByElement(element)`

依任意子元素取得對應的 TableUI 實例。

```js
var grid = getTableUIByElement(someInput);
```

---

### `getValueByElement(element, template?)`

依任意子元素取得對應的資料物件。

```js
var record = getValueByElement(td);
```

---

### `setValidRecord(node, dataObjs, validResult, msg)`

設定資料列驗證狀態（全域版）。

---

### `getValidRecord(node)`

取得含驗證錯誤的資料（全域版），無錯誤時回傳 `false`。

---

### `TableUIsExportToXLS(fileName, fileData)`

合併多個 Sheet 匯出至 XLS。

```js
var sheet1 = grid1.exportAllToXLS(null, false, 1, '工作表一');
var sheet2 = grid2.exportAllToXLS(null, false, 1, '工作表二');
TableUIsExportToXLS('output', [sheet1, sheet2]);
```

---

### `ExportXLSWithJSON(jsonString)`

直接傳入 JSON 字串進行 XLS 匯出（底層函式）。

---

## 附錄：_tableuiAutoCheckBoxResult 狀態碼

| 值 | 意義 |
|----|------|
| `1` | 已勾選 |
| `0` | 已勾選 + disabled |
| `-1` | 未勾選 |
| `-2` | 未勾選 + disabled |
| `-99` | 不產生 checkbox（genRule 回傳 false） |
