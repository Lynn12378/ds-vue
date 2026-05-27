import dateUtils, { dateJs } from "@/assets/utils/legacy/date.js";
import { initPopupWinFacade } from "@/service/popupWinFacade.js";

const LEGACY_DATE_API_NAMES = [
  "isHoliday",
  "isDate",
  "isADdate",
  "isROCdate",
  "toY2K",
  "toROC",
  "addDate",
  "diffDay",
  "diffDayROC",
  "diffDayY2K",
  "getToday",
  "getY2KToday",
  "getTime",
];

/**
 * 將 legacy date API 掛到全域物件（僅在未被覆蓋時才寫入）。
 * @param {Window} targetWindow 目標 window。
 * @returns {Array<string>} 實際掛載的 API 名稱。
 */
function exposeLegacyDateApis(targetWindow) {
  const mountedApiNames = [];

  if (targetWindow.dateJs == null) {
    targetWindow.dateJs = dateJs;
    mountedApiNames.push("dateJs");
  }

  LEGACY_DATE_API_NAMES.forEach((apiName) => {
    if (typeof targetWindow[apiName] === "function") {
      return;
    }

    const api = dateUtils[apiName];
    if (typeof api === "function") {
      targetWindow[apiName] = api;
      mountedApiNames.push(apiName);
    }
  });

  return mountedApiNames;
}

/**
 * 初始化 legacy facade：
 * - popupWin facade（舊 popup API）
 * - dateJs / isHoliday 等舊日期 API
 * @param {{exposePopupWin?:boolean,exposeDateApis?:boolean,targetWindow?:Window}} [options={}] 初始化選項。
 * @returns {{popupWin:any|null,mountedDateApiNames:Array<string>}} 初始化結果。
 */
export function initLegacyFacade(options = {}) {
  const exposePopupWin = options.exposePopupWin !== false;
  const exposeDateApis = options.exposeDateApis !== false;
  const targetWindow = options.targetWindow || (typeof window !== "undefined" ? window : null);

  let popupWinFacade = null;
  let mountedDateApiNames = [];

  if (exposePopupWin === true) {
    popupWinFacade = initPopupWinFacade();
  }

  if (targetWindow != null && exposeDateApis === true) {
    mountedDateApiNames = exposeLegacyDateApis(targetWindow);
  }

  return {
    popupWin: popupWinFacade,
    mountedDateApiNames,
  };
}

export default initLegacyFacade;
