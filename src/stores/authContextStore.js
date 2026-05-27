import { defineStore } from "pinia";

/**
 * 管理 eBAF 相關驗證與平台上下文。
 */
export const useAuthContextStore = defineStore("auth-context-store", {
  state: () => ({
    platformInfo: "",
    systemInfo: "",
    userFlag: "",
    dispatcher: "",
  }),

  actions: {
    /**
     * 更新登入上下文資料。
     * @param {Partial<{platformInfo:string,systemInfo:string,userFlag:string,dispatcher:string}>} context 上下文資料。
     * @returns {void} 執行結果。
     */
    setAuthContext(context = {}) {
      this.platformInfo = context.platformInfo ?? this.platformInfo;
      this.systemInfo = context.systemInfo ?? this.systemInfo;
      this.userFlag = context.userFlag ?? this.userFlag;
      this.dispatcher = context.dispatcher ?? this.dispatcher;
    },

    /**
     * 清空登入上下文資料。
     * @returns {void} 執行結果。
     */
    clearAuthContext() {
      this.platformInfo = "";
      this.systemInfo = "";
      this.userFlag = "";
      this.dispatcher = "";
    },
  },
});

export default useAuthContextStore;
