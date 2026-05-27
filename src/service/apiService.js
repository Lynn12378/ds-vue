import {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/service/httpService.js";
import {
  fetchPageSupportByFuncId,
  checkPageSupportAvailable,
} from "@/service/pageSupportService.js";
import { logCopyAction } from "@/service/securityLogService.js";
import {
  postReportTask,
  requestReportPrecheck,
  requestCreateCsvFile,
  requestCreateXlsFile,
} from "@/service/reportService.js";
import {
  requestHolidayCodes,
  requestHolidayCodesByYear,
} from "@/service/holidayService.js";

export {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  fetchPageSupportByFuncId,
  checkPageSupportAvailable,
  logCopyAction,
  postReportTask,
  requestReportPrecheck,
  requestCreateCsvFile,
  requestCreateXlsFile,
  requestHolidayCodes,
  requestHolidayCodesByYear,
};

const apiService = {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  fetchPageSupportByFuncId,
  checkPageSupportAvailable,
  logCopyAction,
  postReportTask,
  requestReportPrecheck,
  requestCreateCsvFile,
  requestCreateXlsFile,
  requestHolidayCodes,
  requestHolidayCodesByYear,
};

export default apiService;
