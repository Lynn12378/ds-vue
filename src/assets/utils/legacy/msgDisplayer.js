// msgDisplayer.jsp 純邏輯遷移層
// 說明：此檔只處理資料轉換與規則判斷，不處理 frame/DOM/WIUtil 呼叫。

const LEGACY_FIELD_INDEX = {
  returnMessage: 0,
  errorCode: 1,
  systemId: 2,
  type: 3,
  url: 4,
  returnCode: 5,
  exception: 6
}

/**
 * isPlainObject 功能說明。
 * @param {any} value 參數 value。
 * @returns {boolean} 執行結果。
 */
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && Array.isArray(value) === false
}

/**
 * toSafeString 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function toSafeString(value) {
  if (value === null || value === void 0) {
    return ''
  }
  return String(value)
}

/**
 * normalizeLineBreak 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function normalizeLineBreak(value) {
  const text = toSafeString(value)

  // 同時處理 JSP 轉出的 <br> 與原始 CR/LF，統一為 \n 方便後續 UI 顯示。
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
}

/**
 * normalizeReturnCode 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function normalizeReturnCode(value) {
  const text = toSafeString(value).trim()
  return text === '' ? '0' : text
}

/**
 * 將 legacy 訊息格式（2D array/object）轉成標準物件。
 * @returns {any} 執行結果。
 */
export function normalizeLegacyMessageRecord(record) {
  if (Array.isArray(record)) {
    return {
      returnMessage: normalizeLineBreak(record[LEGACY_FIELD_INDEX.returnMessage]),
      errorCode: normalizeLineBreak(record[LEGACY_FIELD_INDEX.errorCode]),
      systemId: toSafeString(record[LEGACY_FIELD_INDEX.systemId]),
      type: toSafeString(record[LEGACY_FIELD_INDEX.type]),
      url: toSafeString(record[LEGACY_FIELD_INDEX.url]),
      returnCode: normalizeReturnCode(record[LEGACY_FIELD_INDEX.returnCode]),
      exception: normalizeLineBreak(record[LEGACY_FIELD_INDEX.exception])
    }
  }

  if (isPlainObject(record)) {
    return {
      returnMessage: normalizeLineBreak(record.returnMessage ?? record.displayMsgDescs),
      errorCode: normalizeLineBreak(record.errorCode ?? record.msgid),
      systemId: toSafeString(record.systemId ?? record.sysid),
      type: toSafeString(record.type),
      url: toSafeString(record.url),
      returnCode: normalizeReturnCode(record.returnCode),
      exception: normalizeLineBreak(record.exception ?? record.displayException)
    }
  }

  return {
    returnMessage: '',
    errorCode: '',
    systemId: '',
    type: '',
    url: '',
    returnCode: '0',
    exception: ''
  }
}

/**
 * 正規化訊息集合：
 * - 支援單筆 array/object
 * - 支援 legacy 2D array
 * - 過濾 null/undefined
 * @returns {any} 執行結果。
 */
export function normalizeLegacyMessages(messages) {
  if (messages === null || messages === void 0) {
    return []
  }

  if (Array.isArray(messages)) {
    if (messages.length === 0) {
      return []
    }

    const looksLikeSingleRow =
      Array.isArray(messages[0]) === false && isPlainObject(messages[0]) === false

    const records = looksLikeSingleRow ? [messages] : messages
    return records
      .filter(item => item !== null && item !== void 0)
      .map(item => normalizeLegacyMessageRecord(item))
  }

  return [normalizeLegacyMessageRecord(messages)]
}

/**
 * 依 legacy 規則組出 alert 文字。
 *
 * 重要業務規則：
 * - returnCode = 0：正常，不 alert
 * - returnCode = 99：訊息保留於下方訊息欄，不 alert
 * @returns {any} 執行結果。
 */
export function buildLegacyAlertMessage(messages) {
  const normalized = normalizeLegacyMessages(messages)
  let alertMsg = ''

  for (let i = 0; i < normalized.length; i += 1) {
    const item = normalized[i]

    if (item.exception === '') {
      if (item.returnCode !== '0' && item.returnCode !== '99') {
        alertMsg += `訊息說明:\n${item.returnMessage}\n`

        if (item.errorCode) {
          alertMsg += '\n錯誤編號：\n'
          alertMsg += item.errorCode
        }
      }
    } else if (item.exception !== '' || item.systemId !== '') {
      alertMsg += `異常原因:${item.exception}\n`
      alertMsg += `\n程式ID:${item.systemId}\n\n`
    }
  }

  return alertMsg
}

/**
 * 產生底部訊息欄 payload（對應 showNotifyMsg 所需欄位）。
 * legacy 僅顯示第一筆訊息，這裡保留同樣規則。
 * @returns {any} 執行結果。
 */
export function buildBottomNotifyPayload(messages) {
  const normalized = normalizeLegacyMessages(messages)
  if (normalized.length === 0) {
    return null
  }

  return {
    returnCode: normalized[0].returnCode,
    returnMessage: normalized[0].returnMessage
  }
}

/**
 * 對應 legacy document.onclick 判斷：
 * 目標 type 為 button / submit 時應清除底部訊息。
 * @returns {boolean} 執行結果。
 */
export function shouldClearBottomMsgByTargetType(targetType) {
  if (typeof targetType !== 'string') {
    return false
  }

  const type = targetType.toLowerCase()
  return type === 'button' || type === 'submit'
}

/**
 * 一次回傳 UI 顯示層所需資料，方便 Vue/Quasar 元件直接使用。
 * @returns {any} 執行結果。
 */
export function buildMsgDisplayerViewModel(messages) {
  const normalizedMessages = normalizeLegacyMessages(messages)

  return {
    messages: normalizedMessages,
    bottomNotifyPayload: buildBottomNotifyPayload(normalizedMessages),
    alertMessage: buildLegacyAlertMessage(normalizedMessages)
  }
}

const msgDisplayerUtil = {
  normalizeLegacyMessageRecord,
  normalizeLegacyMessages,
  buildLegacyAlertMessage,
  buildBottomNotifyPayload,
  shouldClearBottomMsgByTargetType,
  buildMsgDisplayerViewModel
}

export default msgDisplayerUtil