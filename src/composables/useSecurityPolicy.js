import { onBeforeUnmount, unref, watch } from "vue";
import { logCopyAction } from "@/service/securityLogService.js";

const WATERMARK_ELEMENT_ID = "v2-security-watermark-overlay";

/**
 * 將輸入策略轉為完整資安設定。
 * @param {Record<string, any>} [policy={}] 策略設定。
 * @returns {{disablePrint:boolean,disableCopy:boolean,disableContextMenu:boolean,disableSave:boolean,disableSelectAll:boolean,enableWatermark:boolean,watermarkText:string,logCopyEvent:boolean,funcId:string}} 正規化策略。
 */
function normalizePolicy(policy = {}) {
  return {
    disablePrint: !!policy.disablePrint,
    disableCopy: !!policy.disableCopy,
    disableContextMenu: !!policy.disableContextMenu,
    disableSave: !!policy.disableSave,
    disableSelectAll: !!policy.disableSelectAll,
    enableWatermark: !!policy.enableWatermark,
    watermarkText: typeof policy.watermarkText === "string" ? policy.watermarkText : "",
    logCopyEvent: policy.logCopyEvent !== false,
    funcId: typeof policy.funcId === "string" ? policy.funcId : "",
  };
}

/**
 * 建立浮水印背景圖。
 * @param {string} text 浮水印文字。
 * @returns {string} data URL。
 */
function buildWatermarkDataUrl(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 220;

  const context = canvas.getContext("2d");
  if (context == null) {
    return "";
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(180, 110);
  context.rotate((-20 * Math.PI) / 180);
  context.textAlign = "center";
  context.font = "16px sans-serif";
  context.fillStyle = "rgba(90, 90, 90, 0.28)";
  context.fillText(text, 0, 0);

  return canvas.toDataURL("image/png");
}

/**
 * 取得或建立浮水印 DOM 元素。
 * @returns {HTMLDivElement} 浮水印元素。
 */
function getOrCreateWatermarkElement() {
  let element = document.getElementById(WATERMARK_ELEMENT_ID);

  if (element == null) {
    element = document.createElement("div");
    element.id = WATERMARK_ELEMENT_ID;
    element.style.position = "fixed";
    element.style.inset = "0";
    element.style.pointerEvents = "none";
    element.style.zIndex = "9999";
    element.style.backgroundRepeat = "repeat";
    element.style.backgroundPosition = "0 0";
    element.style.opacity = "1";
    document.body.appendChild(element);
  }

  return element;
}

/**
 * 移除浮水印元素。
 * @returns {any} 執行結果。
 */
function removeWatermarkElement() {
  const element = document.getElementById(WATERMARK_ELEMENT_ID);
  if (element != null) {
    element.remove();
  }
}

/**
 * 判斷鍵盤事件是否命中受控快捷鍵。
 * @param {KeyboardEvent} event 鍵盤事件。
 * @param {{disablePrint:boolean,disableCopy:boolean,disableSave:boolean,disableSelectAll:boolean}} policy 資安策略。
 * @returns {string|null} 命中原因代碼。
 */
function resolveBlockedShortcutReason(event, policy) {
  const key = String(event.key || "").toLowerCase();
  const metaPressed = event.ctrlKey === true || event.metaKey === true;

  if (metaPressed !== true) {
    return null;
  }

  if (policy.disablePrint === true && key === "p") {
    return "print";
  }

  if (policy.disableSave === true && key === "s") {
    return "save";
  }

  if (policy.disableCopy === true && (key === "c" || key === "x")) {
    return key === "x" ? "cut" : "copy";
  }

  if (policy.disableSelectAll === true && key === "a") {
    return "select-all";
  }

  return null;
}

/**
 * 建立 copy log payload。
 * @param {string} eventType 事件型別。
 * @param {{funcId:string}} policy 資安策略。
 * @returns {Record<string, any>} log payload。
 */
function buildCopyLogPayload(eventType, policy) {
  return {
    eventType,
    funcId: policy.funcId,
    pageUrl: typeof window !== "undefined" ? window.location.pathname : "",
    createdAt: new Date().toISOString(),
  };
}

/**
 * 建立資安策略控制器。
 * @param {{policy?:any,onBlocked?:(detail:Record<string,any>)=>void,onCopyLogged?:(detail:Record<string,any>)=>void}} [options={}] 可選設定。
 * @returns {{startSecurityPolicy:()=>void,stopSecurityPolicy:()=>void,applySecurityPolicy:(policy?:Record<string,any>)=>void}} 控制方法。
 */
export function useSecurityPolicy(options = {}) {
  const policySource = options.policy;
  const onBlocked = typeof options.onBlocked === "function" ? options.onBlocked : () => {};
  const onCopyLogged =
    typeof options.onCopyLogged === "function" ? options.onCopyLogged : () => {};

  let currentPolicy = normalizePolicy(unref(policySource) || {});
  let isStarted = false;
  let originalWindowPrint = null;

  /**
   * 寫入 copy 行為日誌。
   * @param {string} eventType 事件型別。
   * @returns {Promise<any>} 執行結果。
   */
  async function writeCopyLog(eventType) {
    if (currentPolicy.logCopyEvent !== true) {
      return;
    }

    const payload = buildCopyLogPayload(eventType, currentPolicy);

    try {
      await logCopyAction(payload);
      onCopyLogged(payload);
    } catch (error) {
      onBlocked({
        eventType: "copy-log",
        reason: "copy-log-failed",
        error,
      });
    }
  }

  /**
   * 更新浮水印顯示。
   * @returns {void} 執行結果。
   */
  function syncWatermark() {
    if (typeof document === "undefined") {
      return;
    }

    if (currentPolicy.enableWatermark !== true) {
      removeWatermarkElement();
      return;
    }

    const text =
      currentPolicy.watermarkText.trim() !== ""
        ? currentPolicy.watermarkText
        : "Confidential";
    const dataUrl = buildWatermarkDataUrl(text);
    const element = getOrCreateWatermarkElement();

    element.style.backgroundImage = dataUrl ? `url('${dataUrl}')` : "none";
  }

  /**
   * 套用 print 攔截策略。
   * @returns {void} 執行結果。
   */
  function syncPrintGuard() {
    if (typeof window === "undefined") {
      return;
    }

    if (originalWindowPrint == null) {
      originalWindowPrint = window.print.bind(window);
    }

    if (currentPolicy.disablePrint === true) {
      window.print = () => {
        onBlocked({
          eventType: "print",
          reason: "print-disabled",
        });
      };
      return;
    }

    if (originalWindowPrint != null) {
      window.print = originalWindowPrint;
    }
  }

  /**
   * 處理 keydown 攔截。
   * @param {KeyboardEvent} event 鍵盤事件。
   * @returns {void} 執行結果。
   */
  function handleKeydown(event) {
    const reason = resolveBlockedShortcutReason(event, currentPolicy);
    if (reason == null) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onBlocked({
      eventType: "keydown",
      reason,
      key: event.key,
    });

    if (reason === "copy" || reason === "cut") {
      void writeCopyLog(`shortcut-${reason}`);
    }
  }

  /**
   * 處理右鍵選單攔截。
   * @param {MouseEvent} event 滑鼠事件。
   * @returns {void} 執行結果。
   */
  function handleContextMenu(event) {
    if (currentPolicy.disableContextMenu !== true) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    onBlocked({
      eventType: "contextmenu",
      reason: "contextmenu-disabled",
    });
  }

  /**
   * 處理 copy 事件。
   * @param {ClipboardEvent} event 剪貼簿事件。
   * @returns {void} 執行結果。
   */
  function handleCopy(event) {
    if (currentPolicy.disableCopy === true) {
      event.preventDefault();
      event.stopPropagation();

      onBlocked({
        eventType: "copy",
        reason: "copy-disabled",
      });
    }

    void writeCopyLog("copy");
  }

  /**
   * 處理 cut 事件。
   * @param {ClipboardEvent} event 剪貼簿事件。
   * @returns {void} 執行結果。
   */
  function handleCut(event) {
    if (currentPolicy.disableCopy === true) {
      event.preventDefault();
      event.stopPropagation();

      onBlocked({
        eventType: "cut",
        reason: "cut-disabled",
      });
    }

    void writeCopyLog("cut");
  }

  /**
   * 註冊資安監聽。
   * @returns {void} 執行結果。
   */
  function registerListeners() {
    if (isStarted === true || typeof document === "undefined") {
      return;
    }

    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    isStarted = true;
  }

  /**
   * 移除資安監聽。
   * @returns {void} 執行結果。
   */
  function unregisterListeners() {
    if (isStarted !== true || typeof document === "undefined") {
      return;
    }

    document.removeEventListener("keydown", handleKeydown, true);
    document.removeEventListener("contextmenu", handleContextMenu, true);
    document.removeEventListener("copy", handleCopy, true);
    document.removeEventListener("cut", handleCut, true);
    isStarted = false;
  }

  /**
   * 套用資安策略。
   * @param {Record<string, any>} [policy] 新策略。
   * @returns {void} 執行結果。
   */
  function applySecurityPolicy(policy) {
    if (policy !== undefined) {
      currentPolicy = normalizePolicy(policy);
    }

    syncPrintGuard();
    syncWatermark();
  }

  /**
   * 啟動資安策略。
   * @returns {void} 執行結果。
   */
  function startSecurityPolicy() {
    registerListeners();
    applySecurityPolicy();
  }

  /**
   * 停用資安策略並清理資源。
   * @returns {void} 執行結果。
   */
  function stopSecurityPolicy() {
    unregisterListeners();
    removeWatermarkElement();

    if (typeof window !== "undefined" && originalWindowPrint != null) {
      window.print = originalWindowPrint;
    }
  }

  if (policySource !== undefined) {
    watch(
      () => unref(policySource),
      (nextPolicy) => {
        currentPolicy = normalizePolicy(nextPolicy || {});
        applySecurityPolicy();
      },
      {
        deep: true,
        immediate: true,
      }
    );
  }

  onBeforeUnmount(() => {
    stopSecurityPolicy();
  });

  return {
    startSecurityPolicy,
    stopSecurityPolicy,
    applySecurityPolicy,
  };
}

export default useSecurityPolicy;
