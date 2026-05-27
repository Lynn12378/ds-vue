import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useUiStateStore } from "@/stores/uiStateStore.js";
import { useSnapshot } from "@/composables/useSnapshot.js";
import { useLoadingTask } from "@/composables/useLoadingTask.js";
import { useMessageCenter } from "@/composables/useMessageCenter.js";

/**
 * 聚合 UI 狀態操作（快照、loading、訊息、popup、query snapshot）。
 * @param {{pinia?: import('pinia').Pinia}} [options={}] 可選設定。
 * @returns {object} UI 狀態操作與響應式資料。
 */
export function useUiState(options = {}) {
  const store = useUiStateStore(options.pinia);
  const { loading, messages, tableState, popupState, reportState, securityPolicy } = storeToRefs(store);
  const { commitSnapshot, rollbackSnapshot } = useSnapshot();
  const { runWithLoading } = useLoadingTask(store);
  const { pushMessage, clearMessages } = useMessageCenter(store);

  /**
   * 判斷目前訊息佇列是否包含錯誤訊息。
   * @returns {boolean} 是否存在 error 等級訊息。
   */
  function computeHasErrorMessage() {
    return messages.value.some((item) => item.level === "error");
  }

  const hasErrorMessage = computed(computeHasErrorMessage);

  /**
   * 儲存查詢條件快照。
   * @param {string} key 快照 key。
   * @param {any} payload 快照內容。
   * @returns {void} 執行結果。
   */
  function saveQuerySnapshot(key, payload) {
    store.saveQuerySnapshot(key, payload);
  }

  /**
   * 讀取查詢條件快照。
   * @param {string} key 快照 key。
   * @returns {any|null} 快照內容。
   */
  function restoreQuerySnapshot(key) {
    return store.getQuerySnapshot(key);
  }

  /**
   * 更新表格狀態（分頁、排序等）。
   * @param {Partial<{page:number,rowsPerPage:number,sortBy:string,descending:boolean,selectedIds:Array<any>}>} patch 狀態 patch。
   * @returns {void} 執行結果。
   */
  function patchTableState(patch = {}) {
    store.patchTableState(patch);
  }

  /**
   * 更新表格勾選 id 清單。
   * @param {Array<any>} ids 勾選 id 陣列。
   * @returns {void} 執行結果。
   */
  function setSelectedIds(ids = []) {
    store.setSelectedIds(ids);
  }

  /**
   * 更新報表任務狀態。
   * @param {Partial<{status:string,taskType:string,actionUrl:string,errorMessage:string,lastExecutedAt:number|null,payload:any}>} patch 狀態 patch。
   * @returns {void} 執行結果。
   */
  function patchReportState(patch = {}) {
    store.patchReportState(patch);
  }

  /**
   * 重設報表任務狀態。
   * @returns {void} 執行結果。
   */
  function resetReportState() {
    store.resetReportState();
  }

  /**
   * 更新資安策略。
   * @param {Partial<{disablePrint:boolean,disableCopy:boolean,disableContextMenu:boolean,disableSave:boolean,disableSelectAll:boolean,enableWatermark:boolean,watermarkText:string,logCopyEvent:boolean}>} patch 狀態 patch。
   * @returns {void} 執行結果。
   */
  function patchSecurityPolicy(patch = {}) {
    store.patchSecurityPolicy(patch);
  }

  /**
   * 重設資安策略。
   * @returns {void} 執行結果。
   */
  function resetSecurityPolicy() {
    store.resetSecurityPolicy();
  }

  /**
   * 開啟 popup。
   * @param {Partial<{title:string,payload:any}>} payload popup 資料。
   * @returns {void} 執行結果。
   */
  function openPopup(payload = {}) {
    store.openPopup(payload);
  }

  /**
   * 關閉 popup。
   * @returns {void} 執行結果。
   */
  function closePopup() {
    store.closePopup();
  }

  return {
    loading,
    messages,
    tableState,
    popupState,
    reportState,
    securityPolicy,
    hasErrorMessage,
    commitSnapshot,
    rollbackSnapshot,
    runWithLoading,
    saveQuerySnapshot,
    restoreQuerySnapshot,
    patchTableState,
    setSelectedIds,
    patchReportState,
    resetReportState,
    patchSecurityPolicy,
    resetSecurityPolicy,
    openPopup,
    closePopup,
    pushMessage,
    clearMessages,
  };
}

export default useUiState;
