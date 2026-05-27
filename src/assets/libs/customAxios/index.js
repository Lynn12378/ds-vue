import axios from "axios";
import { validateResponsePayload } from "@/assets/utils/validator.js";

const SUCCESS_CODE = 0;
const NOTIFY_ONLY_CODE = 99;
const DEFAULT_TIMEOUT = 30000;

let runtimeHooks = {
  getAuthContext: null,
  onMessage: null,
};

/**
 * 建立請求唯一識別碼，便於前後端追蹤。
 * @returns {string} request id。
 */
function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * 設定 customAxios 執行期 hooks。
 * @param {{getAuthContext?:()=>any,onMessage?:(event:Record<string,any>)=>void}} hooks runtime hooks。
 * @returns {void} 執行結果。
 */
export function setCustomAxiosRuntimeHooks(hooks = {}) {
  runtimeHooks = {
    ...runtimeHooks,
    ...hooks,
  };
}

/**
 * customAxios 業務錯誤物件。
 */
export class CustomAxiosBizError extends Error {
  /**
   * @param {string} message 錯誤訊息。
   * @param {{code?:number|null,payload?:any,requestId?:string,notifyOnly?:boolean}} [options={}] 錯誤延伸資訊。
   * @returns {void} 執行結果。
   */
  constructor(message, options = {}) {
    super(message);
    this.name = "CustomAxiosBizError";
    this.code = options.code ?? null;
    this.payload = options.payload;
    this.requestId = options.requestId;
    this.notifyOnly = !!options.notifyOnly;
  }
}

const customAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_HOST,
  timeout: DEFAULT_TIMEOUT,
});

/**
 * 處理 request 攔截：注入 request id 與 Pinia eBAF 上下文。
 * @param {import('axios').AxiosRequestConfig} config 原始請求設定。
 * @returns {import('axios').AxiosRequestConfig} 修改後請求設定。
 */
function handleRequestConfig(config) {
  const nextConfig = { ...config };
  const requestId = createRequestId();

  nextConfig.headers = {
    ...(nextConfig.headers || {}),
    "X-Request-Id": requestId,
  };

  // 重要邏輯：把 Pinia 中的 eBAF 參數集中注入到每次請求，
  // 避免各 API 呼叫點重複處理與遺漏。
  if (typeof runtimeHooks.getAuthContext === "function") {
    const context = runtimeHooks.getAuthContext() || {};
    if (context.platformInfo) {
      nextConfig.headers["X-eBAF-loginPlatformInfo"] = context.platformInfo;
    }
    if (context.systemInfo) {
      nextConfig.headers["X-eBAF-loginSystemInfo"] = context.systemInfo;
    }
    if (context.userFlag) {
      nextConfig.headers["X-eBAF-UserObject-Flag"] = context.userFlag;
    }
    if (context.dispatcher) {
      nextConfig.headers["X-eBAF-platformDispatcher"] = context.dispatcher;
    }
  }

  nextConfig.metadata = {
    ...(nextConfig.metadata || {}),
    requestId,
    startAt: Date.now(),
  };

  return nextConfig;
}

/**
 * 處理 request 錯誤攔截。
 * @param {any} error axios request error。
 * @returns {Promise<never>} rejected promise。
 */
function handleRequestError(error) {
  return Promise.reject(error);
}

/**
 * 處理 response 成功攔截，並依 returnCode 做業務分流。
 * @param {import('axios').AxiosResponse} response axios 回應。
 * @returns {any|Promise<never>} 正常 payload 或拒絕。
 */
function handleResponseSuccess(response) {
  const payload = response?.data ?? {};
  const result = validateResponsePayload(payload);
  const requestId = response?.config?.metadata?.requestId;

  // 重要邏輯：returnCode=99 依確認規則屬於「僅通知，不彈錯誤對話」流程。
  if (result.returnCode === NOTIFY_ONLY_CODE) {
    if (typeof runtimeHooks.onMessage === "function") {
      runtimeHooks.onMessage({
        level: "info",
        notifyOnly: true,
        code: result.returnCode,
        requestId,
        message: result.displayMsgDescs,
        payload,
      });
    }
    return payload;
  }

  if (result.returnCode !== null && result.returnCode !== SUCCESS_CODE) {
    const error = new CustomAxiosBizError(result.displayMsgDescs || "業務處理失敗", {
      code: result.returnCode,
      payload,
      requestId,
      notifyOnly: false,
    });

    if (typeof runtimeHooks.onMessage === "function") {
      runtimeHooks.onMessage({
        level: "error",
        notifyOnly: false,
        code: result.returnCode,
        requestId,
        message: error.message,
        payload,
      });
    }

    return Promise.reject(error);
  }

  return payload;
}

/**
 * 處理 response 失敗攔截，統一丟訊息事件。
 * @param {any} error axios response error。
 * @returns {Promise<never>} rejected promise。
 */
function handleResponseError(error) {
  const requestId = error?.config?.metadata?.requestId;
  const message = error?.message || "網路連線失敗";

  if (typeof runtimeHooks.onMessage === "function") {
    runtimeHooks.onMessage({
      level: "error",
      notifyOnly: false,
      code: null,
      requestId,
      message,
      payload: null,
    });
  }

  return Promise.reject(error);
}

customAxiosClient.interceptors.request.use(handleRequestConfig, handleRequestError);
customAxiosClient.interceptors.response.use(handleResponseSuccess, handleResponseError);

export default customAxiosClient;
