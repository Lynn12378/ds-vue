# DSD10100 待處理清單

## TODO — 需人工接手實作

| 位置 | 原始語法 |
|---|---|
| src/views/D1/DSD10100.vue:267 | `RPTUtil.executeCreateXlsFile('<%=dispatcher%>/DSD1_0100/exportCsv', Form.serialize("form1"));` |
| src/views/D1/DSD10100.vue:273 | `if ( "function" === typeof(parseEUDC) ) { parseEUDC('ap'); }` |

## FIXME — 翻新行為落差待確認

| 位置 | 落差說明 |
|---|---|
| src/views/D1/DSD10100.vue:14 | `dispatcher` 為 Server-side 注入資料，來源待確認 |
| src/views/D1/DSD10100.vue:16 | `imageBase` 為 Server-side 注入資料，來源待確認 |
| src/views/D1/DSD10100.vue:18 | `DIV_NO_CENTER_List` 為 Server-side 注入資料，來源待確認 |
| src/views/D1/DSD10100.vue:236 | `grid.getXlsSettingJSON('約定繳款明細資料')` 無等價翻新，匯出欄位設定待確認 |
| src/views/D1/DSD10100.vue:252 | `DIV_NO_CENTER_List` 由 `doPrompt` 補全，實際 API key 與資料來源待確認 |
| src/views/D1/DSD10100.vue:254 | `dispatcher` 由 `doPrompt` 補全，實際 API key 與資料來源待確認 |
| src/views/D1/DSD10100.vue:256 | `imageBase` 由 `doPrompt` 補全，實際 API key 與資料來源待確認 |
