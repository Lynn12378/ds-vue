import { defineStore } from "pinia";

const MESSAGE_BUFFER_LIMIT = 100;

/**
 * 取得回應中的 ErrMsg 內容。
 * @param {Record<string, any>} event 原始訊息事件。
 * @returns {Record<string, any>} ErrMsg 物件。
 */
function resolveErrMsg(event) {
  const errMsg = event?.payload?.ErrMsg;
  if (errMsg && typeof errMsg === "object") {
    return errMsg;
  }

  return {};
}

/**
 * 解析訊息等級，若未提供則依業務碼推斷。
 * @param {Record<string, any>} event 原始訊息事件。
 * @returns {"info"|"warning"|"success"|"error"} 訊息等級。
 */
function resolveMessageLevel(event) {
  if (typeof event?.level === "string" && event.level.trim() !== "") {
    return event.level;
  }

  const code = Number(event?.code);
  if (Number.isNaN(code) === false && code !== 0 && code !== 99) {
    return "error";
  }

  return "info";
}

/**
 * 依訊息等級與通知屬性決定建議呈現通道。
 * @param {string} level 訊息等級。
 * @param {boolean} notifyOnly 是否僅通知。
 * @returns {"toast"|"dialog"|"banner"} 建議呈現通道。
 */
function resolvePresentationChannel(level, notifyOnly) {
  if (notifyOnly === true) {
    return "toast";
  }

  if (level === "error") {
    return "dialog";
  }

  return "toast";
}

/**
 * 正規化業務碼。
 * @param {Record<string, any>} event 原始訊息事件。
 * @returns {number|null} 業務碼；無法解析時為 null。
 */
function resolveMessageCode(event) {
  const parsedCode = Number(event?.code);
  return Number.isNaN(parsedCode) ? null : parsedCode;
}

/**
 * 取得錯誤代碼。
 * @param {Record<string, any>} event 原始訊息事件。
 * @param {Record<string, any>} errMsg ErrMsg 物件。
 * @returns {string} 錯誤代碼。
 */
function resolveErrorCode(event, errMsg) {
  const code = event?.errorCode ?? errMsg?.msgid;
  if (code === null || code === undefined) {
    return "";
  }

  return String(code);
}

/**
 * 取得系統代碼。
 * @param {Record<string, any>} event 原始訊息事件。
 * @param {Record<string, any>} errMsg ErrMsg 物件。
 * @returns {string} 系統代碼。
 */
function resolveSystemId(event, errMsg) {
  const systemId = event?.systemId ?? errMsg?.sysid;
  if (systemId === null || systemId === undefined) {
    return "";
  }

  return String(systemId);
}

/**
 * 取得參考連結。
 * @param {Record<string, any>} event 原始訊息事件。
 * @param {Record<string, any>} errMsg ErrMsg 物件。
 * @returns {string} URL 字串。
 */
function resolveMessageUrl(event, errMsg) {
  const url = event?.url ?? errMsg?.url;
  if (url === null || url === undefined) {
    return "";
  }

  return String(url);
}

/**
 * 取得詳細訊息。
 * @param {Record<string, any>} event 原始訊息事件。
 * @param {Record<string, any>} errMsg ErrMsg 物件。
 * @returns {string} 詳細訊息。
 */
function resolveDetailMessage(event, errMsg) {
  const detail =
    event?.detail ??
    errMsg?.displayException ??
    errMsg?.exception ??
    event?.payload?.displayException;

  if (detail === null || detail === undefined || String(detail).trim() === "") {
    return "";
  }

  return String(detail);
}

/**
 * 判斷是否需要觸發 rollback。
 * @param {Record<string, any>} event 原始訊息事件。
 * @param {Record<string, any>} errMsg ErrMsg 物件。
 * @returns {boolean} 是否需要 rollback。
 */
function resolveRollbackRequired(event, errMsg) {
  if (event?.rollbackRequired === true) {
    return true;
  }

  const candidates = [
    event?.txHasRollbackPage,
    errMsg?.txHasRollbackPage,
    event?.payload?.txHasRollbackPage,
  ];

  return candidates.some((value) => value === true || value === "Y" || value === "true" || value === 1);
}

/**
 * 取得顯示訊息文字。
 * @param {Record<string, any>} event 原始訊息事件。
 * @param {Record<string, any>} errMsg ErrMsg 物件。
 * @returns {string} 顯示訊息。
 */
function resolveMessageText(event, errMsg) {
  const message = event?.message ?? errMsg?.displayMsgDescs ?? errMsg?.returnMessage;
  if (message === null || message === undefined) {
    return "";
  }

  return String(message);
}

/**
 * 將訊息事件正規化為統一資料格式。
 * @param {Record<string, any>} event 原始訊息事件。
 * @returns {{level:string,message:string,requestId:string,notifyOnly:boolean,channel:string,code:number|null,errorCode:string,systemId:string,url:string,detail:string,rollbackRequired:boolean,payload:any,createdAt:number}} 正規化訊息。
 */
export function normalizeMessage(event) {
  const level = resolveMessageLevel(event);
  const notifyOnly = !!event?.notifyOnly;
  const errMsg = resolveErrMsg(event);

  return {
    level,
    message: resolveMessageText(event, errMsg),
    requestId: event?.requestId || "",
    notifyOnly,
    channel: resolvePresentationChannel(level, notifyOnly),
    code: resolveMessageCode(event),
    errorCode: resolveErrorCode(event, errMsg),
    systemId: resolveSystemId(event, errMsg),
    url: resolveMessageUrl(event, errMsg),
    detail: resolveDetailMessage(event, errMsg),
    rollbackRequired: resolveRollbackRequired(event, errMsg),
    payload: event?.payload ?? null,
    createdAt: Date.now(),
  };
}

/**
 * 管理前端訊息佇列。
 */
export const useMessageStore = defineStore("message-store", {
  state: () => ({
    messages: [],
  }),

  getters: {
    /**
     * 取得最新一筆訊息。
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
     * 推入訊息事件。
     * @param {Record<string, any>} event 訊息事件。
     * @returns {void} 執行結果。
     */
    pushMessage(event) {
      this.messages.push(normalizeMessage(event));

      if (this.messages.length > MESSAGE_BUFFER_LIMIT) {
        this.messages = this.messages.slice(-MESSAGE_BUFFER_LIMIT);
      }
    },

    /**
     * 清空所有訊息。
     * @returns {void} 執行結果。
     */
    clearMessages() {
      this.messages = [];
    },
  },
});

export default useMessageStore;
