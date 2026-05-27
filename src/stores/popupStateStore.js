import { defineStore } from "pinia";

/**
 * 管理彈窗顯示狀態。
 */
export const usePopupStateStore = defineStore("popup-state-store", {
  state: () => ({
    visible: false,
    title: "",
    payload: null,
  }),

  actions: {
    /**
     * 批次更新彈窗狀態。
     * @param {Partial<{visible:boolean,title:string,payload:any}>} patch 狀態 patch。
     * @returns {void} 執行結果。
     */
    patchPopupState(patch = {}) {
      Object.assign(this, patch);
    },

    /**
     * 開啟彈窗並更新資料。
     * @param {Partial<{title:string,payload:any}>} payload 彈窗資料。
     * @returns {void} 執行結果。
     */
    openPopup(payload = {}) {
      this.patchPopupState({
        visible: true,
        ...payload,
      });
    },

    /**
     * 關閉彈窗。
     * @returns {void} 執行結果。
     */
    closePopup() {
      this.patchPopupState({ visible: false });
    },
  },
});

export default usePopupStateStore;
