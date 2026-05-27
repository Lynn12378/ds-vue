import { reactive, readonly } from "vue";
import {
  requestHolidayCodes,
  DEFAULT_HOLIDAY_API_PATH,
} from "@/service/holidayService.js";
import {
  getHolidayCodes,
  getHolidayCodeState,
  isHoliday,
  resetHolidayCodes,
  setHolidayCodes,
} from "@/assets/utils/legacy/date.js";

const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const holidayCacheState = reactive({
  loading: false,
  loaded: false,
  apiPath: DEFAULT_HOLIDAY_API_PATH,
  ttlMs: DEFAULT_CACHE_TTL_MS,
  source: getHolidayCodeState().source,
  lastLoadedAt: 0,
  expiresAt: 0,
  lastError: "",
});

let pendingSyncPromise = null;

/**
 * 判斷是否可使用快取資料。
 * @param {boolean} force 是否強制重抓。
 * @returns {boolean} 是否可用快取。
 */
function canUseCache(force) {
  if (force === true) {
    return false;
  }

  if (holidayCacheState.loaded !== true) {
    return false;
  }

  return holidayCacheState.expiresAt > Date.now();
}

/**
 * 組裝同步結果。
 * @param {boolean} cached 是否命中快取。
 * @returns {{cached:boolean,codes:Array<string>,state:Record<string,any>}} 同步結果。
 */
function buildSyncResult(cached) {
  return {
    cached,
    codes: getHolidayCodes(),
    state: {
      ...holidayCacheState,
      source: getHolidayCodeState().source,
    },
  };
}

/**
 * 同步假日資料（支援 TTL 快取）。
 * @param {{force?:boolean,year?:number|string,apiPath?:string,ttlMs?:number,params?:Record<string,any>,config?:import('axios').AxiosRequestConfig}} [options={}] 同步設定。
 * @returns {Promise<{cached:boolean,codes:Array<string>,state:Record<string,any>}>} 同步結果。
 */
export async function syncHolidayCalendar(options = {}) {
  const force = options.force === true;
  const nextApiPath =
    typeof options.apiPath === "string" && options.apiPath.trim() !== ""
      ? options.apiPath
      : holidayCacheState.apiPath;
  const nextTtl = Number(options.ttlMs);
  const ttlMs =
    Number.isInteger(nextTtl) && nextTtl > 0 ? nextTtl : holidayCacheState.ttlMs;

  if (canUseCache(force)) {
    return buildSyncResult(true);
  }

  if (pendingSyncPromise != null) {
    return pendingSyncPromise;
  }

  const params = {
    ...(options.params || {}),
  };

  const parsedYear = Number(options.year);
  if (Number.isInteger(parsedYear) && parsedYear > 0) {
    params.year = parsedYear;
  }

  holidayCacheState.loading = true;
  holidayCacheState.apiPath = nextApiPath;
  holidayCacheState.ttlMs = ttlMs;
  holidayCacheState.lastError = "";

  pendingSyncPromise = requestHolidayCodes(params, nextApiPath, options.config || {})
    .then((codes) => {
      if (Array.isArray(codes) && codes.length > 0) {
        setHolidayCodes(codes, {
          replace: true,
          source: "api",
        });
      }

      holidayCacheState.loaded = true;
      holidayCacheState.source = getHolidayCodeState().source;
      holidayCacheState.lastLoadedAt = Date.now();
      holidayCacheState.expiresAt = holidayCacheState.lastLoadedAt + ttlMs;

      return buildSyncResult(false);
    })
    .catch((error) => {
      holidayCacheState.lastError = error?.message || "holiday-api-sync-failed";
      throw error;
    })
    .finally(() => {
      holidayCacheState.loading = false;
      pendingSyncPromise = null;
    });

  return pendingSyncPromise;
}

/**
 * 強制刷新假日資料。
 * @param {Omit<Parameters<typeof syncHolidayCalendar>[0], 'force'>} [options={}] 同步設定。
 * @returns {Promise<{cached:boolean,codes:Array<string>,state:Record<string,any>}>} 同步結果。
 */
export function refreshHolidayCalendar(options = {}) {
  return syncHolidayCalendar({
    ...options,
    force: true,
  });
}

/**
 * 清除假日快取。
 * @param {{resetToStatic?:boolean}} [options={}] 清除設定。
 * @returns {void} 執行結果。
 */
export function clearHolidayCalendarCache(options = {}) {
  holidayCacheState.loaded = false;
  holidayCacheState.lastLoadedAt = 0;
  holidayCacheState.expiresAt = 0;
  holidayCacheState.lastError = "";

  if (options.resetToStatic === true) {
    resetHolidayCodes();
  }

  holidayCacheState.source = getHolidayCodeState().source;
}

/**
 * 判斷指定日期是否為假日。
 * @param {string|number} day 日期代碼。
 * @returns {boolean} 是否為假日。
 */
export function isHolidayByCalendar(day) {
  return isHoliday(day);
}

/**
 * 取得假日快取狀態與操作。
 * @returns {{state:Readonly<Record<string,any>>,syncHolidayCalendar:typeof syncHolidayCalendar,refreshHolidayCalendar:typeof refreshHolidayCalendar,clearHolidayCalendarCache:typeof clearHolidayCalendarCache,isHolidayByCalendar:typeof isHolidayByCalendar,getHolidayCodes:typeof getHolidayCodes}} holiday composable。
 */
export function useHolidayCalendar() {
  return {
    state: readonly(holidayCacheState),
    syncHolidayCalendar,
    refreshHolidayCalendar,
    clearHolidayCalendarCache,
    isHolidayByCalendar,
    getHolidayCodes,
  };
}

export default useHolidayCalendar;
