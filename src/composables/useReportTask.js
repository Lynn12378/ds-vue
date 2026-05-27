import {
  buildReportParameterEntries,
  extractLegacyErrorMessage,
  resolveReportWebName,
} from "@/assets/utils/common.js";
import {
  requestCreateCsvFile,
  requestCreateXlsFile,
  requestReportPrecheck,
} from "@/service/reportService.js";

const DEFAULT_REPORT_SERVLET = "AppletServlet";

/**
 * 將任意值轉成可寫入 hidden input 的字串。
 * @param {any} value 欲轉換值。
 * @returns {string} 字串化結果。
 */
function stringifyHiddenInputValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }

  return String(value);
}

/**
 * 解析報表 action URL。
 * @param {{actionUrl?:string,webName?:string,servletName?:string}} [options={}] 報表設定。
 * @returns {string} action URL。
 */
function resolveReportActionUrl(options = {}) {
  if (typeof options.actionUrl === "string" && options.actionUrl.trim() !== "") {
    return options.actionUrl;
  }

  const locationHref = typeof window !== "undefined" ? window.location.href : "";
  const resolvedWebName =
    typeof options.webName === "string" && options.webName.trim() !== ""
      ? options.webName
      : resolveReportWebName(locationHref).webName;
  const servletName =
    typeof options.servletName === "string" && options.servletName.trim() !== ""
      ? options.servletName
      : DEFAULT_REPORT_SERVLET;

  return `/${resolvedWebName}/${servletName}`;
}

/**
 * 解析送單視窗名稱。
 * @param {{targetWindowName?:string,taskType?:string}} [options={}] 報表設定。
 * @returns {string} 視窗名稱。
 */
function resolveTargetWindowName(options = {}) {
  if (typeof options.targetWindowName === "string" && options.targetWindowName.trim() !== "") {
    return options.targetWindowName;
  }

  const taskType = options.taskType || "report";
  return `v2_${taskType}_window`;
}

/**
 * 建立 window.open 屬性字串。
 * @param {Record<string, any>} [attributes={}] 視窗屬性。
 * @returns {string} 屬性字串。
 */
function buildWindowAttributes(attributes = {}) {
  const output = {
    toolbar: "no",
    menubar: "no",
    status: "no",
    resizable: "yes",
    scrollbars: "yes",
    width: 1024,
    height: 768,
    ...attributes,
  };

  return Object.entries(output)
    .map(([key, value]) => `${key}=${value}`)
    .join(",");
}

/**
 * 將 entry 陣列寫入 form hidden inputs。
 * @param {HTMLFormElement} formElement form 元素。
 * @param {Array<{name:string,value:any}>} entries hidden 參數清單。
 * @returns {void} 執行結果。
 */
function appendFormEntries(formElement, entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];

  for (let index = 0; index < safeEntries.length; index += 1) {
    const entry = safeEntries[index] || {};
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = entry.name || "";
    input.value = stringifyHiddenInputValue(entry.value);
    formElement.appendChild(input);
  }
}

/**
 * 以動態 form 送出報表請求。
 * @param {string} actionUrl 送單 URL。
 * @param {Array<{name:string,value:any}>} entries hidden 參數清單。
 * @param {{method?:"post"|"get",openInNewWindow?:boolean,targetWindowName?:string,windowAttributes?:Record<string,any>}} [options={}] 送單設定。
 * @returns {void} 執行結果。
 */
function submitReportForm(actionUrl, entries, options = {}) {
  if (typeof document === "undefined") {
    throw new Error("目前環境不支援 form submit");
  }

  const method = options.method === "get" ? "get" : "post";
  const openInNewWindow = options.openInNewWindow !== false;
  const targetWindowName = resolveTargetWindowName(options);

  if (openInNewWindow === true && typeof window !== "undefined") {
    window.open("", targetWindowName, buildWindowAttributes(options.windowAttributes), true);
  }

  const formElement = document.createElement("form");
  formElement.method = method;
  formElement.action = actionUrl;
  formElement.target = openInNewWindow === true ? targetWindowName : "_self";
  formElement.style.display = "none";

  appendFormEntries(formElement, entries);

  document.body.appendChild(formElement);
  formElement.submit();
  document.body.removeChild(formElement);
}

/**
 * 將報表參數正規化為 hidden 參數清單。
 * @param {Record<string, any>} [options={}] 報表設定。
 * @returns {Array<{name:string,value:any}>} hidden 參數清單。
 */
function resolveReportEntries(options = {}) {
  if (Array.isArray(options.parameterEntries)) {
    return options.parameterEntries;
  }

  return buildReportParameterEntries(options);
}

/**
 * 解析錯誤訊息。
 * @param {any} error 例外物件。
 * @returns {string} 錯誤訊息。
 */
function resolveTaskErrorMessage(error) {
  const payload = error?.response?.data ?? error?.payload ?? null;
  const legacyMessage = extractLegacyErrorMessage(payload);
  if (legacyMessage) {
    return legacyMessage;
  }

  return error?.message || "報表任務執行失敗";
}

/**
 * 建立報表任務流程控制器。
 * @param {{runWithLoading?:(task:()=>Promise<any>)=>Promise<any>,patchReportState?:(patch:Record<string,any>)=>void,pushMessage?:(event:Record<string,any>)=>void}} [options={}] 可選設定。
 * @returns {{executePrintReport:(options?:Record<string,any>)=>Promise<any>,executeDownloadReport:(options?:Record<string,any>)=>Promise<any>,executeCreateCsvFile:(options?:Record<string,any>)=>Promise<any>,executeCreateXlsFile:(options?:Record<string,any>)=>Promise<any>}} 報表任務方法。
 */
export function useReportTask(options = {}) {
  const runWithLoading =
    typeof options.runWithLoading === "function"
      ? options.runWithLoading
      : async (task) => task();
  const patchReportState =
    typeof options.patchReportState === "function"
      ? options.patchReportState
      : () => {};
  const pushMessage =
    typeof options.pushMessage === "function" ? options.pushMessage : () => {};

  /**
   * 更新報表狀態。
   * @param {Record<string, any>} patch 狀態 patch。
   * @returns {void} 執行結果。
   */
  function updateReportState(patch = {}) {
    patchReportState({
      ...patch,
      lastExecutedAt: Date.now(),
    });
  }

  /**
   * 需要時執行前置檢核 API。
   * @param {Record<string, any>} reportOptions 報表設定。
   * @returns {Promise<any>} 執行結果。
   */
  async function runPrecheckIfNeeded(reportOptions) {
    if (reportOptions.skipPrecheck === true) {
      return;
    }

    if (typeof reportOptions.precheckApiPath !== "string" || reportOptions.precheckApiPath.trim() === "") {
      return;
    }

    await requestReportPrecheck(
      reportOptions.precheckApiPath,
      reportOptions.precheckPayload || {},
      reportOptions.precheckAxiosConfig || {}
    );
  }

  /**
   * 執行列印報表流程。
   * @param {Record<string, any>} [reportOptions={}] 報表設定。
   * @returns {Promise<{actionUrl:string,entries:Array<any>}>} 執行結果。
   */
  async function executePrintReport(reportOptions = {}) {
    return runWithLoading(async () => {
      const actionUrl = resolveReportActionUrl(reportOptions);
      const entries = resolveReportEntries(reportOptions);

      updateReportState({
        status: "pending",
        taskType: "print",
        actionUrl,
        errorMessage: "",
        payload: { entries },
      });

      try {
        await runPrecheckIfNeeded(reportOptions);

        submitReportForm(actionUrl, entries, {
          method: "post",
          openInNewWindow: reportOptions.isOpenNewBrowse !== false,
          targetWindowName: reportOptions.targetWindowName,
          windowAttributes: reportOptions.windowAttributes,
          taskType: "print",
        });

        updateReportState({
          status: "success",
          taskType: "print",
          actionUrl,
          errorMessage: "",
          payload: { entries },
        });

        pushMessage({
          level: "success",
          notifyOnly: true,
          code: 0,
          message: "報表列印作業已送出",
        });

        return { actionUrl, entries };
      } catch (error) {
        const message = resolveTaskErrorMessage(error);

        updateReportState({
          status: "fail",
          taskType: "print",
          actionUrl,
          errorMessage: message,
          payload: { entries },
        });

        pushMessage({
          level: "error",
          notifyOnly: false,
          code: -1,
          message,
          detail: error?.stack || "",
        });

        throw error;
      }
    });
  }

  /**
   * 執行下載報表流程。
   * @param {Record<string, any>} [reportOptions={}] 報表設定。
   * @returns {Promise<{actionUrl:string,entries:Array<any>}>} 執行結果。
   */
  async function executeDownloadReport(reportOptions = {}) {
    return runWithLoading(async () => {
      const actionUrl = resolveReportActionUrl(reportOptions);
      const entries = resolveReportEntries(reportOptions);

      updateReportState({
        status: "pending",
        taskType: "download",
        actionUrl,
        errorMessage: "",
        payload: { entries },
      });

      try {
        await runPrecheckIfNeeded(reportOptions);

        submitReportForm(actionUrl, entries, {
          method: "post",
          openInNewWindow: reportOptions.isOpenNewBrowse === true,
          targetWindowName: reportOptions.targetWindowName,
          windowAttributes: reportOptions.windowAttributes,
          taskType: "download",
        });

        updateReportState({
          status: "success",
          taskType: "download",
          actionUrl,
          errorMessage: "",
          payload: { entries },
        });

        pushMessage({
          level: "success",
          notifyOnly: true,
          code: 0,
          message: "報表下載作業已送出",
        });

        return { actionUrl, entries };
      } catch (error) {
        const message = resolveTaskErrorMessage(error);

        updateReportState({
          status: "fail",
          taskType: "download",
          actionUrl,
          errorMessage: message,
          payload: { entries },
        });

        pushMessage({
          level: "error",
          notifyOnly: false,
          code: -1,
          message,
          detail: error?.stack || "",
        });

        throw error;
      }
    });
  }

  /**
   * 建立 CSV 產檔任務。
   * @param {{payload?:Record<string,any>,apiPath?:string,mock?:boolean,mockResponse?:Record<string,any>,axiosConfig?:Record<string,any>}} [taskOptions={}] 任務設定。
   * @returns {Promise<any>} 任務建立結果。
   */
  async function executeCreateCsvFile(taskOptions = {}) {
    return runWithLoading(async () => {
      updateReportState({
        status: "pending",
        taskType: "create-csv",
        actionUrl: taskOptions.apiPath || "",
        errorMessage: "",
        payload: taskOptions.payload || {},
      });

      try {
        const response =
          taskOptions.mock === true
            ? {
                returnCode: 0,
                taskId: `mock-csv-${Date.now()}`,
                ...(taskOptions.mockResponse || {}),
              }
            : await requestCreateCsvFile(
                taskOptions.payload || {},
                taskOptions.apiPath,
                taskOptions.axiosConfig || {}
              );

        updateReportState({
          status: "success",
          taskType: "create-csv",
          actionUrl: taskOptions.apiPath || "",
          errorMessage: "",
          payload: response,
        });

        pushMessage({
          level: "success",
          notifyOnly: true,
          code: 0,
          message: "CSV 產檔任務已建立",
        });

        return response;
      } catch (error) {
        const message = resolveTaskErrorMessage(error);

        updateReportState({
          status: "fail",
          taskType: "create-csv",
          actionUrl: taskOptions.apiPath || "",
          errorMessage: message,
          payload: taskOptions.payload || {},
        });

        pushMessage({
          level: "error",
          notifyOnly: false,
          code: -1,
          message,
          detail: error?.stack || "",
        });

        throw error;
      }
    });
  }

  /**
   * 建立 XLS 產檔任務。
   * @param {{payload?:Record<string,any>,apiPath?:string,mock?:boolean,mockResponse?:Record<string,any>,axiosConfig?:Record<string,any>}} [taskOptions={}] 任務設定。
   * @returns {Promise<any>} 任務建立結果。
   */
  async function executeCreateXlsFile(taskOptions = {}) {
    return runWithLoading(async () => {
      updateReportState({
        status: "pending",
        taskType: "create-xls",
        actionUrl: taskOptions.apiPath || "",
        errorMessage: "",
        payload: taskOptions.payload || {},
      });

      try {
        const response =
          taskOptions.mock === true
            ? {
                returnCode: 0,
                taskId: `mock-xls-${Date.now()}`,
                ...(taskOptions.mockResponse || {}),
              }
            : await requestCreateXlsFile(
                taskOptions.payload || {},
                taskOptions.apiPath,
                taskOptions.axiosConfig || {}
              );

        updateReportState({
          status: "success",
          taskType: "create-xls",
          actionUrl: taskOptions.apiPath || "",
          errorMessage: "",
          payload: response,
        });

        pushMessage({
          level: "success",
          notifyOnly: true,
          code: 0,
          message: "XLS 產檔任務已建立",
        });

        return response;
      } catch (error) {
        const message = resolveTaskErrorMessage(error);

        updateReportState({
          status: "fail",
          taskType: "create-xls",
          actionUrl: taskOptions.apiPath || "",
          errorMessage: message,
          payload: taskOptions.payload || {},
        });

        pushMessage({
          level: "error",
          notifyOnly: false,
          code: -1,
          message,
          detail: error?.stack || "",
        });

        throw error;
      }
    });
  }

  return {
    executePrintReport,
    executeDownloadReport,
    executeCreateCsvFile,
    executeCreateXlsFile,
  };
}

export default useReportTask;
