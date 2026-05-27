import { defineStore } from "pinia";

/**
 * 管理列表頁 Table 狀態（分頁、排序、勾選）。
 */
export const useTableStateStore = defineStore("table-state-store", {
  state: () => ({
    page: 1,
    rowsPerPage: 10,
    sortBy: "",
    descending: false,
    selectedIds: [],
  }),

  actions: {
    /**
     * 批次更新 table 狀態。
     * @param {Partial<{page:number,rowsPerPage:number,sortBy:string,descending:boolean,selectedIds:Array<any>}>} patch 狀態 patch。
     * @returns {void} 執行結果。
     */
    patchTableState(patch = {}) {
      Object.assign(this, patch);
    },

    /**
     * 更新勾選 id 清單。
     * @param {Array<any>} ids 勾選 id 陣列。
     * @returns {void} 執行結果。
     */
    setSelectedIds(ids = []) {
      this.selectedIds = Array.isArray(ids) ? [...ids] : [];
    },

    /**
     * 重設 table 狀態為預設值。
     * @returns {void} 執行結果。
     */
    resetTableState() {
      this.page = 1;
      this.rowsPerPage = 10;
      this.sortBy = "";
      this.descending = false;
      this.selectedIds = [];
    },
  },
});

export default useTableStateStore;
