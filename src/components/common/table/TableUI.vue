<script setup>
import { computed, ref, useAttrs, watch } from 'vue'
import {
  buildRowKeyGetter,
  cloneRows,
  exportRowsToXls,
  getPageRows,
  pickTemplate,
  selectAllRows,
  setCurrentPageSelection,
  upsertSelectionByKey,
  validateRecords,
} from '@/assets/composables/useTableUIAdapter'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  rowKey: {
    type: [String, Function],
    default: 'id',
  },
  selectionMode: {
    type: String,
    default: 'multiple',
  },
  selected: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
      sortBy: null,
      descending: false,
    }),
  },
  validation: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'update:rows',
  'update:pagination',
  'update:selected',
  'selection-change',
  'export-click',
  'request',
  'row-click',
])

const attrs = useAttrs()
const qTableRef = ref(null)
const innerRows = ref([])
const deletedRows = ref([])
const totalCountRows = ref(null)
const subTotalCountRows = ref(null)
const innerPagination = ref({ ...props.pagination })
const selectedRows = ref(cloneRows(props.selected))
const errorRowKeys = ref(new Set())
const isVisible = ref(true)
const isNew = true
const rowKeyGetter = computed(() => buildRowKeyGetter(props.rowKey))
const compatWarnings = new Set()

// Legacy behavior notes:
// 1) DOM-driven APIs (getThisRecordTD/getAutoInput/autoInput*) are now data-model based or no-op.
// 2) rowSpan/fixedColumns/fetch window cache are not restored in q-table architecture.
// 3) XLS export uses client download, not legacy /ZRWeb/xls postback.

function warnCompat(api, message) {
  const key = `${api}:${message}`
  if (compatWarnings.has(key)) {
    return
  }
  compatWarnings.add(key)
  // Keep one-time warnings only for compatibility gaps.
  console.warn(`[TableUI compat] ${api}: ${message}`)
}

function withSerialNumbers(records) {
  const list = cloneRows(records)
  let maxSerial = 0
  list.forEach((row) => {
    const serial = Number(row?._tableuiSerialNumber)
    if (Number.isFinite(serial)) {
      maxSerial = Math.max(maxSerial, serial)
    }
  })

  let nextSerial = maxSerial || 1
  return list.map((row) => {
    if (Number.isFinite(Number(row?._tableuiSerialNumber))) {
      return row
    }
    const mapped = { ...(row || {}) }
    mapped._tableuiSerialNumber = nextSerial
    nextSerial += 1
    return mapped
  })
}

function resolveRows(target) {
  if (Array.isArray(target)) {
    return target
      .map((node) => resolveRows(node))
      .flat()
      .filter(Boolean)
  }

  if (target && typeof target === 'object') {
    return [target]
  }

  if (Number.isFinite(Number(target))) {
    const serial = Number(target)
    return innerRows.value.filter((row) => Number(row?._tableuiSerialNumber) === serial)
  }

  if (typeof target === 'string' || typeof target === 'number') {
    return innerRows.value.filter((row) => String(rowKeyGetter.value(row)) === String(target))
  }

  return []
}

function updateRowsByKey(targetRows, updater) {
  const keySet = new Set(targetRows.map((row) => rowKeyGetter.value(row)))
  innerRows.value = innerRows.value.map((row) => {
    const key = rowKeyGetter.value(row)
    if (!keySet.has(key)) {
      return row
    }
    return updater({ ...(row || {}) })
  })
  emit('update:rows', cloneRows(innerRows.value))
}

innerRows.value = withSerialNumbers(props.rows)

watch(
  () => props.rows,
  (nextRows) => {
    innerRows.value = withSerialNumbers(nextRows)
  },
  { deep: true }
)

watch(
  () => props.selected,
  (nextSelected) => {
    selectedRows.value = cloneRows(nextSelected)
  },
  { deep: true }
)

watch(
  () => props.pagination,
  (nextPagination) => {
    innerPagination.value = { ...nextPagination }
  },
  { deep: true }
)

const qSelectionMode = computed(() => {
  if (props.selectionMode === 'single' || props.selectionMode === 'multiple') {
    return props.selectionMode
  }
  return undefined
})

function load(records) {
  innerRows.value = withSerialNumbers(records)
  deletedRows.value = []
  errorRowKeys.value = new Set()
  selectedRows.value = []
  emit('update:rows', cloneRows(innerRows.value))
  emit('update:selected', [])
}

function loadin(records) {
  load(records)
}

function reload() {
  emit('update:rows', cloneRows(innerRows.value))
}

function reloadin() {
  reload()
}

function clear() {
  innerRows.value = []
  deletedRows.value = []
  totalCountRows.value = null
  subTotalCountRows.value = null
  selectedRows.value = []
  errorRowKeys.value = new Set()
  emit('update:rows', [])
  emit('update:selected', [])
}

function getElement() {
  return qTableRef.value?.$el || null
}

function hasRecords() {
  return innerRows.value.length > 0
}

function addRecords(records, autoCheckStatus = false) {
  const next = Array.isArray(records) ? records : [records]
  if (!next.length) {
    return
  }
  const merged = withSerialNumbers([...innerRows.value, ...next])
  innerRows.value = merged
  emit('update:rows', cloneRows(innerRows.value))

  if (autoCheckStatus) {
    const appended = merged.slice(Math.max(0, merged.length - next.length))
    selectedRows.value = [...selectedRows.value, ...appended]
    emit('update:selected', cloneRows(selectedRows.value))
  }
}

function deleteRecords(records) {
  const targets = resolveRows(records)
  const keySet = new Set(targets.map((row) => rowKeyGetter.value(row)))
  if (!keySet.size) {
    return
  }

  const kept = []
  const removed = []
  innerRows.value.forEach((row) => {
    const key = rowKeyGetter.value(row)
    if (keySet.has(key)) {
      removed.push(row)
    } else {
      kept.push(row)
    }
  })

  innerRows.value = kept
  deletedRows.value = [...deletedRows.value, ...removed]
  selectedRows.value = selectedRows.value.filter((row) => !keySet.has(rowKeyGetter.value(row)))
  emit('update:rows', cloneRows(innerRows.value))
  emit('update:selected', cloneRows(selectedRows.value))
}

function getDeletedRecords(template) {
  return pickTemplate(deletedRows.value, template)
}

function resetTotalCount(totalCount) {
  totalCountRows.value = Array.isArray(totalCount) ? totalCount : (totalCount ? [totalCount] : null)
}

function resetSubTotalCount(subTotalCount) {
  subTotalCountRows.value = Array.isArray(subTotalCount) ? subTotalCount : (subTotalCount ? [subTotalCount] : null)
}

function getTotalCount() {
  return totalCountRows.value
}

function getSubTotalCount() {
  return subTotalCountRows.value
}

function sort(key, isIncrease = true, sortRule = 'string') {
  const direction = isIncrease ? 1 : -1
  const rule = `${sortRule || 'string'}`.toLowerCase()
  const sorted = cloneRows(innerRows.value).sort((a, b) => {
    const left = a?.[key]
    const right = b?.[key]
    if (rule === 'number') {
      return ((Number(left) || 0) - (Number(right) || 0)) * direction
    }
    return String(left ?? '').localeCompare(String(right ?? '')) * direction
  })
  innerRows.value = sorted
  emit('update:rows', cloneRows(innerRows.value))
}

function getSerialNumber(target) {
  const row = resolveRows(target)[0]
  return Number(row?._tableuiSerialNumber)
}

function getSerialNumbers(target) {
  return resolveRows(target)
    .map((row) => Number(row?._tableuiSerialNumber))
    .filter((sn) => Number.isFinite(sn))
}

function getRecordsBySerialNo(serials, template) {
  const list = Array.isArray(serials) ? serials : [serials]
  const matched = innerRows.value.filter((row) => list.includes(Number(row?._tableuiSerialNumber)))
  return pickTemplate(matched, template)
}

function getRecordsByCell(target, template) {
  const rows = resolveRows(target)
  return pickTemplate(rows, template)
}

function getRecordByCell(target, template) {
  const rows = getRecordsByCell(target, template)
  return rows[0] || null
}

function getCheckedErrorRecords(template) {
  const selectedSet = new Set(selectedRows.value.map((row) => rowKeyGetter.value(row)))
  const rows = innerRows.value.filter(
    (row) => selectedSet.has(rowKeyGetter.value(row)) && errorRowKeys.value.has(rowKeyGetter.value(row))
  )
  return pickTemplate(rows, template)
}

function getCheckedCorrectRecords(template) {
  const selectedSet = new Set(selectedRows.value.map((row) => rowKeyGetter.value(row)))
  const rows = innerRows.value.filter(
    (row) => selectedSet.has(rowKeyGetter.value(row)) && !errorRowKeys.value.has(rowKeyGetter.value(row))
  )
  return pickTemplate(rows, template)
}

function setValidRecord(target, validResult = true) {
  return setValidRecordByRecord(resolveRows(target), validResult)
}

function setValidRecordByRecord(rows, validResult = true) {
  const list = resolveRows(rows)
  list.forEach((row) => {
    const key = rowKeyGetter.value(row)
    if (validResult) {
      errorRowKeys.value.delete(key)
    } else {
      errorRowKeys.value.add(key)
    }
  })
  return !!validResult
}

function checkAll(checkStatus = true) {
  selectedRows.value = selectAllRows(innerRows.value, !!checkStatus)
  emit('update:selected', cloneRows(selectedRows.value))
  emit('selection-change', {
    selected: cloneRows(selectedRows.value),
    changed: 'all',
    added: !!checkStatus,
  })
}

function getCheckedRecords(template) {
  return pickTemplate(selectedRows.value, template)
}

function getCheckedRecord(template) {
  return getCheckedRecords(template)
}

function getUncheckedRecords(template) {
  const selectedSet = new Set(selectedRows.value.map((row) => rowKeyGetter.value(row)))
  const unchecked = innerRows.value.filter((row) => !selectedSet.has(rowKeyGetter.value(row)))
  return pickTemplate(unchecked, template)
}

function getAllRecords(template) {
  return pickTemplate(innerRows.value, template)
}

function getCurrentPageRecords(template) {
  const pageRows = getPageRows(innerRows.value, innerPagination.value)
  return pickTemplate(pageRows, template)
}

function setAutoCheckBoxByValue(findValue, checkStatus = true) {
  selectedRows.value = upsertSelectionByKey({
    rows: innerRows.value,
    selected: selectedRows.value,
    rowKey: props.rowKey,
    targetValue: findValue,
    checked: !!checkStatus,
  })
  emit('update:selected', cloneRows(selectedRows.value))
}

function setCurrentPageAutoCheckBox(checkStatus = true) {
  selectedRows.value = setCurrentPageSelection({
    rows: innerRows.value,
    selected: selectedRows.value,
    rowKey: props.rowKey,
    pageRows: getPageRows(innerRows.value, innerPagination.value),
    checked: !!checkStatus,
  })
  emit('update:selected', cloneRows(selectedRows.value))
}

function isAutoCheckBoxSelected(rowOrKey) {
  const key = typeof rowOrKey === 'object'
    ? rowKeyGetter.value(rowOrKey)
    : rowOrKey
  return selectedRows.value.some((row) => rowKeyGetter.value(row) === key)
}

function setThisAutoCheckBox(rowOrKey, checkStatus = true) {
  const key = typeof rowOrKey === 'object' ? rowKeyGetter.value(rowOrKey) : rowOrKey
  setAutoCheckBoxByValue(key, checkStatus)
}

function setAutoCheckBox(findValue, checkStatus = true) {
  setAutoCheckBoxByValue(findValue, checkStatus)
}

function setAnotherCheckBox(findValue, checkStatus = true) {
  setAutoCheckBoxByValue(findValue, checkStatus)
}

function showAutoCheckBox() {
  warnCompat('showAutoCheckBox', 'checkbox visibility is controlled by slots/rules; legacy DOM toggle is not restored.')
}

function hideAutoCheckBox() {
  warnCompat('hideAutoCheckBox', 'checkbox visibility is controlled by slots/rules; legacy DOM toggle is not restored.')
}

function validTable() {
  const validationRule = props.validation?.rule
  const { errorCount, errorRowKeys: nextErrorKeys } = validateRecords({
    rows: innerRows.value,
    rowKey: props.rowKey,
    rule: validationRule,
    checkedOnly: false,
    selected: selectedRows.value,
  })

  errorRowKeys.value = nextErrorKeys
  return errorCount
}

function validCheckedOnTable() {
  const validationRule = props.validation?.rule
  const { errorCount, errorRowKeys: nextErrorKeys } = validateRecords({
    rows: innerRows.value,
    rowKey: props.rowKey,
    rule: validationRule,
    checkedOnly: true,
    selected: selectedRows.value,
  })

  errorRowKeys.value = nextErrorKeys
  return errorCount
}

function resetValidate() {
  errorRowKeys.value = new Set()
}

function getThisRecordTD(target, template) {
  warnCompat('getThisRecordTD', 'returns row data map instead of TD DOM references.')
  return getRecordsByCell(target, template)
}

function setValueToTD(target, targetName, value) {
  const rows = resolveRows(target)
  if (!rows.length || !targetName) {
    return
  }
  updateRowsByKey(rows, (row) => {
    row[targetName] = value
    return row
  })
}

function getAutoInput(target, template) {
  warnCompat('getAutoInput', 'autoInput DOM is not restored; returns data rows by template.')
  return getRecordsByCell(target, template)
}

function disableAutoInput() {
  warnCompat('disableAutoInput', 'autoInput editor system is not restored in q-table mode.')
}

function exchangeAutoInput() {
  warnCompat('exchangeAutoInput', 'autoInput editor system is not restored in q-table mode.')
}

function setValueToAutoInput(target, targetName, value) {
  setValueToTD(target, targetName, value)
}

function isAutoInputHidden() {
  warnCompat('isAutoInputHidden', 'autoInput editor system is not restored; returns false by default.')
  return false
}

function getErrorRecords(template) {
  const rows = innerRows.value.filter((row) => errorRowKeys.value.has(rowKeyGetter.value(row)))
  return pickTemplate(rows, template)
}

function getCorrectRecords(template) {
  const rows = innerRows.value.filter((row) => !errorRowKeys.value.has(rowKeyGetter.value(row)))
  return pickTemplate(rows, template)
}

function onSelectedUpdate(nextSelected) {
  selectedRows.value = cloneRows(nextSelected)
  emit('update:selected', cloneRows(selectedRows.value))
  emit('selection-change', {
    selected: cloneRows(selectedRows.value),
    changed: 'partial',
    added: null,
  })
}

function onPaginationUpdate(nextPagination) {
  innerPagination.value = { ...nextPagination }
  emit('update:pagination', { ...innerPagination.value })
}

function setPagination(nextPagination) {
  innerPagination.value = {
    ...innerPagination.value,
    ...nextPagination,
  }
  emit('update:pagination', { ...innerPagination.value })
}

function getPagination() {
  return { ...innerPagination.value }
}

function getTableInfo() {
  const pageNo = innerPagination.value?.page || 1
  return {
    pageNo,
    fixedColumns: [],
    hiddenColumns: [],
  }
}

function setTableInfo(info = {}) {
  if (Number.isFinite(Number(info.pageNo))) {
    setPagination({ page: Number(info.pageNo) })
  }
}

function scrollTop() {
  const target = qTableRef.value?.$el?.querySelector('.q-table__middle, .q-table__bottom')
  if (!target) {
    return
  }
  target.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollBottom() {
  const target = qTableRef.value?.$el?.querySelector('.q-table__middle, .q-table__bottom')
  if (!target) {
    return
  }
  target.scrollTo({ top: target.scrollHeight, behavior: 'smooth' })
}

function getXlsSettingJSON(sheetName = 'Sheet1') {
  const titleSetting = [
    (props.columns || []).map((col) => ({
      name: col.name,
      label: col.label,
    })),
  ]
  const recordSetting = [
    (props.columns || []).map((col) => ({
      key: col.field || col.name,
      title: col.label || col.name,
    })),
  ]
  return JSON.stringify({
    sheetName,
    titleSetting,
    recordSetting,
    groupKeys: null,
  })
}

function resize() {
  warnCompat('resize', 'legacy overDiv/fixed table resize is not restored in q-table mode.')
}

function resetDiv() {
  resize()
}

function resetDivHeight() {
  resize()
}

function hide() {
  isVisible.value = false
}

function show() {
  isVisible.value = true
}

const pageCtrl = {
  loadin,
  loadAgain: reload,
  clearData: clear,
  getRecordsInfo: getTableInfo,
  setRecordsInfo: setTableInfo,
}

function exportToXLS(fileName = 'table-export', records = [], isCount, bgColorType, sheetName = 'Sheet1') {
  const targetRecords = Array.isArray(records) && records.length ? records : innerRows.value
  exportRowsToXls({
    fileName,
    sheetName,
    columns: props.columns,
    records: targetRecords,
  })
  emit('export-click', {
    mode: 'custom',
    fileName,
    sheetName,
    count: targetRecords.length,
    isCount,
    bgColorType,
  })
}

function exportAllToXLS(fileName = 'table-export', isCount, bgColorType, sheetName = 'Sheet1') {
  const records = innerRows.value
  exportRowsToXls({
    fileName,
    sheetName,
    columns: props.columns,
    records,
  })
  emit('export-click', {
    mode: 'all',
    fileName,
    sheetName,
    count: records.length,
    isCount,
    bgColorType,
  })
}

function exportCheckToXLS(fileName = 'table-export-checked', isCount, bgColorType, sheetName = 'Sheet1') {
  const records = selectedRows.value
  exportRowsToXls({
    fileName,
    sheetName,
    columns: props.columns,
    records,
  })
  emit('export-click', {
    mode: 'checked',
    fileName,
    sheetName,
    count: records.length,
    isCount,
    bgColorType,
  })
}

defineExpose({
  isNew,
  getElement,
  pageCtrl,
  qTableRef,
  resetTotalCount,
  resetSubTotalCount,
  getTotalCount,
  getSubTotalCount,
  sort,
  getSerialNumber,
  getSerialNumbers,
  getRecordsBySerialNo,
  getRecordsByCell,
  getRecordByCell,
  getDataObjs: getRecordsByCell,
  getDataObj: getRecordByCell,
  hasRecords,
  addRecords,
  deleteRecords,
  getDeletedRecords,
  getCheckedErrorRecords,
  getCheckedCorrectRecords,
  setValidRecord,
  setValidRecordByRecord,
  loadin,
  reload,
  reloadin,
  clear,
  load,
  checkAll,
  setCurrentPageAutoCheckBox,
  setThisAutoCheckBox,
  setAutoCheckBox,
  setAnotherCheckBox,
  setAutoCheckBoxByValue,
  isAutoCheckBoxSelected,
  showAutoCheckBox,
  hideAutoCheckBox,
  getThisRecordTD,
  setValueToTD,
  getAutoInput,
  disableAutoInput,
  exchangeAutoInput,
  setValueToAutoInput,
  isAutoInputHidden,
  getCheckedRecord,
  getCheckedRecords,
  getUncheckedRecords,
  getAllRecords,
  getCurrentPageRecords,
  validTable,
  validCheckedOnTable,
  resetValidate,
  getErrorRecords,
  getCorrectRecords,
  getTableInfo,
  setTableInfo,
  getXlsSettingJSON,
  exportToXLS,
  exportAllToXLS,
  exportCheckToXLS,
  resize,
  resetDiv,
  resetDivHeight,
  hide,
  show,
  setPagination,
  getPagination,
  scrollTop,
  scrollBottom,
  errorRowKeys,
})
</script>

<template>
  <q-table
    ref="qTableRef"
    v-show="isVisible"
    v-model:pagination="innerPagination"
    v-model:selected="selectedRows"
    :rows="innerRows"
    :columns="columns"
    :row-key="rowKey"
    :selection="qSelectionMode"
    :loading="loading"
    dense
    bordered
    flat
    v-bind="attrs"
    @update:selected="onSelectedUpdate"
    @update:pagination="onPaginationUpdate"
    @request="(payload) => emit('request', payload)"
    @row-click="(...args) => emit('row-click', ...args)"
  >
    <template
      v-for="(_, slotName) in $slots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </q-table>
</template>
