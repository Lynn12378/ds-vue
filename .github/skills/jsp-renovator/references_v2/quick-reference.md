# 翻新前後速查表（v2）

## A. include/script 層級速查
| 翻新前（JSP） | 翻新後（Vue） | 動作 |
| --- | --- | --- |
| `<%@ include file="/html/CM/header.jsp" %>` | 由 `BaseLayout` 全局處理頁框與資安策略 | `DIRECT_REMOVE` |
| `<%@ include file="/html/CM/msgDisplayer.jsp" %>` | 由 `BaseLayout` + `messageStore` 全局顯示訊息 | `DIRECT_REMOVE` |
| `<script src="/html/CM/calendar.js"></script>` + `autoCreateDate()` | 使用 `CustomDate` 元件與 `v-model` | `ONE_TO_ONE_REPLACE` |
| `<script src="/html/CM/TableUI.js"></script>` | 使用 `CustomDataTable`/`CustomTable` 與 Pinia 狀態 | `ONE_TO_ONE_REPLACE` |

## B. API 層級速查
| legacy API | v2 對應 | 動作 |
| --- | --- | --- |
| `displayMessage(...)` / `alertMessages(...)` | `useMessageCenter().pushMessage(...)` + `normalizeLegacyMessages(...)` | `ONE_TO_ONE_REPLACE` |
| `new TableUI(config)` | `CustomDataTable` props + `tableStateStore` | `ONE_TO_ONE_REPLACE` |
| `tableUI.exportAllToXLS(...)` | `exportToXls(...)` | `ONE_TO_ONE_REPLACE` |
| `new PageUI(...)` / `createContent(...)` | `pageUiPure` + SFC 版型元件（Panel/Form/Table） | `ONE_TO_ONE_REPLACE` |
| `popupWin.popup/fullPopup/close/back` | `getPopupWinFacade()` 或 `window.popupWin` facade | `WRAP_AND_KEEP_BLACKBOX` |
| `RPTUtil.executePrint/...` | `useReportTask()` + `reportService` | `ONE_TO_ONE_REPLACE` |
| `toROC` / `addDate` / `SimpleDateFormat` | `@/assets/utils/legacy/date.js` 對應函式 | `ONE_TO_ONE_REPLACE` |
| `CSRUtil.$fmt` / `maskHandler` | `@/assets/utils/legacy/CSRUtil.js` | `ONE_TO_ONE_REPLACE` |
| `CSRUtil.AjaxHandler` | `customAxios` (`src/assets/libs/customAxios/index.js`) | `ONE_TO_ONE_REPLACE` |
| `submitOnce` / `showCoverPage` | `useLoadingTask().runWithLoading(...)` + reactive `isSubmitting` | `ONE_TO_ONE_REPLACE` |
| `new Validation(...)` | `validator.js` 規則函式 + 元件 `error`/`error-message` | `ONE_TO_ONE_REPLACE` |

## C. 無歧義決策規則
1. 若速查表標示 `DIRECT_REMOVE`，直接刪除 legacy 呼叫。
2. 若同時命中 `ONE_TO_ONE_REPLACE` 與 `WRAP_AND_KEEP_BLACKBOX`，優先 `ONE_TO_ONE_REPLACE`。
3. 無任何命中時，建立最小 fallback 並標記 `FALLBACK_STUB`。
