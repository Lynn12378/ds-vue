# jsp_CM 資源路徑索引（v2）

## 使用方式
1. 先依 JSP 中 `include/script` 命中下表的 `legacy 資源`。
2. 再開啟 `v2 指引文件` 套用具體 pattern 規則。
3. 若同頁命中多個資源，逐一處理，不可互相覆蓋規則。

## 索引表
| legacy 資源 | 常見識別 pattern | v2 指引文件 | 主要對應目標（程式路徑） |
| --- | --- | --- | --- |
| `jsp_CM/header.jsp` | `<%@ include file="/html/CM/header.jsp" %>` | `resources/header.jsp.md` | `src/components/BaseLayout.vue`, `src/composables/useSecurityPolicy.js`, `src/service/securityLogService.js`, `src/stores/uiStateStore.js` |
| `jsp_CM/msgDisplayer.jsp` | `<%@ include file="/html/CM/msgDisplayer.jsp" %>`, `displayMessage(` | `resources/msgDisplayer.jsp.md` | `src/components/BaseLayout.vue`, `src/composables/useMessageCenter.js`, `src/stores/messageStore.js`, `src/assets/utils/common.js`, `src/assets/utils/legacy/msgDisplayer.js` |
| `jsp_CM/TableUI.js` | `new TableUI(`, `tableUI.loadin(` | `resources/TableUI.js.md` | `src/components/common/data-table/CustomDataTable.vue`, `src/components/common/custom-table/CustomTable.js`, `src/stores/tableStateStore.js`, `src/assets/utils/legacy/exportXls.js` |
| `jsp_CM/PageUI.js` | `new PageUI(`, `createContent(`, `setButtonsEnable(` | `resources/PageUI.js.md` | `src/assets/utils/legacy/pageUiPure.js`, `src/components/common/data-panel/CustomDataPanel.vue`, `src/components/common/search-form/CustomSearchForm.vue`, `src/components/common/data-table/CustomDataTable.vue` |
| `jsp_CM/popupWin.js` | `popupWin.popup(`, `popupWin.fullPopup(` | `resources/popupWin.js.md` | `src/composables/usePopupWin.js`, `src/service/popupWinFacade.js`, `src/components/common/popup/PopupWinDialog.vue`, `src/service/legacyFacadeService.js` |
| `jsp_CM/RPTUtil.js` | `RPTUtil.executePrint(`, `executeCreateXlsFile(` | `resources/RPTUtil.js.md` | `src/composables/useReportTask.js`, `src/service/reportService.js`, `src/assets/utils/legacy/rptUtilPure.js` |
| `jsp_CM/calendar.js` | `autoCreateDate(`, `getCalendar(` | `resources/calendar.js.md` | `src/components/common/custom-date/CustomDate.js`, `src/composables/useHolidayCalendar.js`, `src/service/holidayService.js` |
| `jsp_CM/date.js` | `toROC(`, `addDate(`, `SimpleDateFormat` | `resources/date.js.md` | `src/assets/utils/legacy/date.js`, `src/assets/utils/validator.js`, `src/components/common/custom-date/CustomDate.js` |
| `jsp_CM/CSRUtil.js` | `CSRUtil.$fmt(`, `CSRUtil.isSuccess(`, `maskHandler` | `resources/CSRUtil.js.md` | `src/assets/utils/legacy/CSRUtil.js`, `src/assets/libs/customAxios/index.js`, `src/composables/useUiState.js` |
| `jsp_CM/utility.js` | `submitOnce(`, `disableButton(`, `trimSpace(` | `resources/utility.js.md` | `src/assets/utils/legacy/utility.js`, `src/composables/useLoadingTask.js`, `src/assets/libs/customAxios/index.js` |
| `jsp_CM/validation.js` | `new Validation(`, `new Validator(` | `resources/validation.js.md` | `src/assets/utils/validator.js`, `src/components/common/custom-input/CustomInput.vue`, `src/components/common/custom-select/CustomSelect.vue` |

## 直接移除優先命中
下列情況不需再查找次級對應，直接套用 `DIRECT_REMOVE`：
- 僅有 `header.jsp` 或 `msgDisplayer.jsp` 的 include，無額外 legacy API 呼叫。
- 只是在 JSP 中掛載 `calendar.js` 自動建構 DOM（`autoCreateDate`），無自訂事件邏輯。
- 只保留 legacy 全局覆寫用途（如直接覆寫 `window.open`/`form.submit`）且現有專案已有統一替代機制。
