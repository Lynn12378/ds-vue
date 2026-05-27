import { apiGet } from "@/service/httpService.js";

export const DEFAULT_HOLIDAY_API_PATH =
  "/ZZWeb/servlet/HttpDispatcher/Common/queryHolidayCodes";

const HOLIDAY_CODE_FIELD_CANDIDATES = [
  "code",
  "holidayCode",
  "holiday",
  "day",
  "date",
  "holidayDate",
  "workDate",
  "calDate",
];

const HOLIDAY_ARRAY_FIELD_CANDIDATES = [
  "holidayCodes",
  "holidays",
  "list",
  "items",
  "records",
  "rows",
  "data",
  "result",
];

/**
 * 將輸入正規化為可比對的假日代碼。
 * @param {any} value 原始值。
 * @returns {string} 正規化後代碼。
 */
export function normalizeHolidayCode(value) {
  if (value === null || value === void 0) {
    return "";
  }

  const text = String(value).trim();
  if (text === "") {
    return "";
  }

  const digitOnly = text.replace(/[^0-9]/g, "");
  return digitOnly === "" ? text : digitOnly;
}

/**
 * 從單筆資料擷取假日代碼。
 * @param {any} item 假日資料項目。
 * @returns {string} 假日代碼。
 */
function resolveHolidayCodeFromItem(item) {
  if (typeof item === "string" || typeof item === "number") {
    return normalizeHolidayCode(item);
  }

  if (item == null || typeof item !== "object") {
    return "";
  }

  for (const key of HOLIDAY_CODE_FIELD_CANDIDATES) {
    const value = normalizeHolidayCode(item[key]);
    if (value !== "") {
      return value;
    }
  }

  return "";
}

/**
 * 嘗試在任意 payload 中找出假日清單陣列。
 * @param {any} payload API 回應內容。
 * @returns {Array<any>} 假日資料陣列。
 */
function extractHolidayArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload == null || typeof payload !== "object") {
    return [];
  }

  const queue = [payload];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();

    if (current == null || typeof current !== "object") {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    for (const key of HOLIDAY_ARRAY_FIELD_CANDIDATES) {
      if (Array.isArray(current[key])) {
        return current[key];
      }
    }

    Object.values(current).forEach((value) => {
      if (value != null && typeof value === "object") {
        queue.push(value);
      }
    });
  }

  return [];
}

/**
 * 將假日清單去重並回傳標準代碼陣列。
 * @param {Array<any>} list 假日清單。
 * @returns {Array<string>} 假日代碼陣列。
 */
export function normalizeHolidayCodeList(list = []) {
  const uniqueCodes = new Set();

  list.forEach((item) => {
    const code = resolveHolidayCodeFromItem(item);
    if (code !== "") {
      uniqueCodes.add(code);
    }
  });

  return Array.from(uniqueCodes);
}

/**
 * 解析假日 API 回應。
 * @param {any} payload API 回應內容。
 * @returns {Array<string>} 假日代碼陣列。
 */
export function parseHolidayPayload(payload) {
  const holidayArray = extractHolidayArray(payload);
  return normalizeHolidayCodeList(holidayArray);
}

/**
 * 查詢假日代碼清單。
 * @param {Record<string, any>} [params={}] 查詢參數。
 * @param {string} [apiPath=DEFAULT_HOLIDAY_API_PATH] API 路徑。
 * @param {import('axios').AxiosRequestConfig} [config={}] axios 設定。
 * @returns {Promise<Array<string>>} 假日代碼陣列。
 */
export async function requestHolidayCodes(
  params = {},
  apiPath = DEFAULT_HOLIDAY_API_PATH,
  config = {}
) {
  if (typeof apiPath !== "string" || apiPath.trim() === "") {
    return [];
  }

  const payload = await apiGet(apiPath, {
    ...config,
    params,
  });

  return parseHolidayPayload(payload);
}

/**
 * 依年度查詢假日代碼清單。
 * @param {number|string} year 年度。
 * @param {{apiPath?:string,params?:Record<string,any>,config?:import('axios').AxiosRequestConfig}} [options={}] 其他設定。
 * @returns {Promise<Array<string>>} 假日代碼陣列。
 */
export function requestHolidayCodesByYear(year, options = {}) {
  const parsedYear = Number(year);
  const mergedParams = {
    ...(options.params || {}),
  };

  if (Number.isInteger(parsedYear) && parsedYear > 0) {
    mergedParams.year = parsedYear;
  }

  return requestHolidayCodes(
    mergedParams,
    options.apiPath || DEFAULT_HOLIDAY_API_PATH,
    options.config || {}
  );
}

const holidayService = {
  requestHolidayCodes,
  requestHolidayCodesByYear,
  parseHolidayPayload,
  normalizeHolidayCode,
  normalizeHolidayCodeList,
};

export default holidayService;
