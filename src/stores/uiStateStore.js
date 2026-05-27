import { defineStore } from "pinia";
import { normalizeMessage } from "@/stores/messageStore.js";

/**
 * 深拷貝資料，避免外部變更污染 store 內部狀態。
 * @template T
 * @param {T} value 欲複製的資料。
 * @returns {T} 深拷貝後資料。
 */
function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

/**
 * 聚合式 UI 狀態 store。
 * - 保留單一入口，方便既有程式碼過渡。
 * - 後續可逐步拆分到 auth/message/table/popup 各子 store。
 */
export const useUiStateStore = defineStore("ui-state-store", {
  state: () => ({
    authContext: {
      platformInfo: "",
      systemInfo: "",
      userFlag: "",
      dispatcher: "",
    },
    loading: false,
    messages: [],
    querySnapshots: {},
    tableState: {
      page: 1,
      rowsPerPage: 10,
      sortBy: "",
      descending: false,
      selectedIds: [],
    },
    popupState: {
      visible: false,
      title: "",
      payload: null,
    },
    reportState: {
      status: "idle",
      taskType: "",
      actionUrl: "",
      errorMessage: "",
      lastExecutedAt: null,
      payload: null,
    },
    securityPolicy: {
      disablePrint: false,
      disableCopy: false,
      disableContextMenu: false,
      disableSave: false,
      disableSelectAll: false,
      enableWatermark: false,
      watermarkText: "",
      logCopyEvent: true,
    },
  }),

  getters: {
    /**
     * 取得最新訊息。
     * @param {{messages:Array<any>}} state store state。
     * @returns {any|null} 最新訊息或 null。
     */
    latestMessage(state) {
      if (state.messages.length === 0) {
        return null;
      }
      return state.messages[state.messages.length - 1];
    },
  },

  actions: {
    /**
     * 設定 eBAF 相關上下文資訊。
     * @param {Partial<{platformInfo:string,systemInfo:string,userFlag:string,dispatcher:string}>} context 上下文資訊。
     * @returns {void} 執行結果。
     */
    setAuthContext(context = {}) {
      this.authContext = {
        ...this.authContext,
        ...context,
      };
    },

    /**
     * 更新全域 loading 狀態。
     * @param {boolean} value 是否顯示 loading。
     * @returns {void} 執行結果。
     */
    setLoading(value) {
      this.loading = !!value;
    },

    /**
     * 推入訊息事件。
     * @param {Record<string, any>} event 訊息事件。
     * @returns {void} 執行結果。
     */
    pushMessage(event) {
      this.messages.push(normalizeMessage(event));
    },

    /**
     * 清空訊息佇列。
     * @returns {void} 執行結果。
     */
    clearMessages() {
      this.messages = [];
    },

    /**
     * 儲存查詢條件快照。
     * @param {string} key 快照 key。
     * @param {any} payload 快照內容。
     * @returns {void} 執行結果。
     */
    saveQuerySnapshot(key, payload) {
      if (!key) {
        return;
      }
      this.querySnapshots[key] = cloneValue(payload ?? {});
    },

    /**
     * 讀取查詢條件快照。
     * @param {string} key 快照 key。
     * @returns {any|null} 快照內容。
     */
    getQuerySnapshot(key) {
      if (!key) {
        return null;
      }
      if (!(key in this.querySnapshots)) {
        return null;
      }
      return cloneValue(this.querySnapshots[key]);
    },

    /**
     * 批次更新 table 狀態。
     * @param {Partial<{page:number,rowsPerPage:number,sortBy:string,descending:boolean,selectedIds:Array<any>}>} patch 狀態 patch。
     * @returns {void} 執行結果。
     */
    patchTableState(patch = {}) {
      this.tableState = {
        ...this.tableState,
        ...patch,
      };
    },

    /**
     * 設定 table 勾選 id。
     * @param {Array<any>} ids 勾選 id 清單。
     * @returns {void} 執行結果。
     */
    setSelectedIds(ids = []) {
      this.tableState.selectedIds = Array.isArray(ids) ? [...ids] : [];
    },

    /**
     * 批次更新 popup 狀態。
     * @param {Partial<{visible:boolean,title:string,payload:any}>} patch 狀態 patch。
     * @returns {void} 執行結果。
     */
    patchPopupState(patch = {}) {
      this.popupState = {
        ...this.popupState,
        ...patch,
      };
    },

    /**
     * 開啟 popup。
     * @param {Partial<{title:string,payload:any}>} payload popup 資料。
     * @returns {void} 執行結果。
     */
    openPopup(payload = {}) {
      this.patchPopupState({
        visible: true,
        ...payload,
      });
    },

    /**
     * 關閉 popup。
     * @returns {void} 執行結果。
     */
    closePopup() {
      this.patchPopupState({
        visible: false,
      });
    },

    /**
     * 批次更新報表任務狀態。
     * @param {Partial<{status:string,taskType:string,actionUrl:string,errorMessage:string,lastExecutedAt:number|null,payload:any}>} patch 狀態 patch。
     * @returns {void} 執行結果。
     */
    patchReportState(patch = {}) {
      this.reportState = {
        ...this.reportState,
        ...patch,
      };
    },

    /**
     * 重設報表任務狀態。
     * @returns {void} 執行結果。
     */
    resetReportState() {
      this.reportState = {
        status: "idle",
        taskType: "",
        actionUrl: "",
        errorMessage: "",
        lastExecutedAt: null,
        payload: null,
      };
    },

    /**
     * 批次更新資安策略。
     * @param {Partial<{disablePrint:boolean,disableCopy:boolean,disableContextMenu:boolean,disableSave:boolean,disableSelectAll:boolean,enableWatermark:boolean,watermarkText:string,logCopyEvent:boolean}>} patch 狀態 patch。
     * @returns {void} 執行結果。
     */
    patchSecurityPolicy(patch = {}) {
      this.securityPolicy = {
        ...this.securityPolicy,
        ...patch,
      };
    },

    /**
     * 重設資安策略為預設值。
     * @returns {void} 執行結果。
     */
    resetSecurityPolicy() {
      this.securityPolicy = {
        disablePrint: false,
        disableCopy: false,
        disableContextMenu: false,
        disableSave: false,
        disableSelectAll: false,
        enableWatermark: false,
        watermarkText: "",
        logCopyEvent: true,
      };
    },
  },
});

export default useUiStateStore;
