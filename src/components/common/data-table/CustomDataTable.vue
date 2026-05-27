<template>
  <CustomTable
    :rows="normalizedRows"
    :columns="normalizedColumns"
    :row-key="rowKey"
    :header-rows="normalizedHeaderRows"
    :group-keys="normalizedGroupKeys"
    :sticky-columns="normalizedStickyColumns"
    :pagination="pagination"
    :selected="normalizedSelectedRows"
    :selection="selection"
    :rows-per-page-options="normalizedRowsPerPageOptions"
    :visible-columns="resolvedVisibleColumns"
    :binary-state-sort="binaryStateSort"
    :loading="loading"
    @row-click="emitRowClick"
    @update:pagination="emitPaginationUpdate"
    @update:selected="emitSelectedUpdate"
  >
    <template
      v-for="slotName in forwardedSlotNames"
      :key="`forward-slot-${slotName}`"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps || {}"
      />
    </template>
  </CustomTable>
</template>

<script setup>
import { computed, useSlots } from "vue";
import CustomTable from "@/components/common/custom-table/CustomTable.js";

const props = defineProps({
  rowKey: {
    type: String,
    default: "id",
  },
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  headerRows: {
    type: Array,
    default: () => [],
  },
  groupKeys: {
    type: Array,
    default: () => [],
  },
  stickyColumns: {
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
      sortBy: "",
      descending: false,
    }),
  },
  selected: {
    type: Array,
    default: () => [],
  },
  selection: {
    type: String,
    default: "none",
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 20, 0],
  },
  visibleColumns: {
    type: Array,
    default: () => [],
  },
  binaryStateSort: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["row-click", "update:pagination", "update:selected"]);
const slots = useSlots();

/**
 * 正規化資料列，確保一定是陣列。
 * @returns {Array<any>} table 資料列。
 */
function getNormalizedRows() {
  return Array.isArray(props.rows) ? props.rows : [];
}

/**
 * 正規化欄位設定，確保一定是陣列。
 * @returns {Array<any>} table 欄位定義。
 */
function getNormalizedColumns() {
  return Array.isArray(props.columns) ? props.columns : [];
}

/**
 * 正規化多列 header 設定。
 * @returns {Array<any>} headerRows 設定。
 */
function getNormalizedHeaderRows() {
  return Array.isArray(props.headerRows) ? props.headerRows : [];
}

/**
 * 正規化群組欄位設定。
 * @returns {Array<string>} group key 清單。
 */
function getNormalizedGroupKeys() {
  return Array.isArray(props.groupKeys) ? props.groupKeys : [];
}

/**
 * 正規化固定欄位設定。
 * @returns {Array<string>} sticky 欄位清單。
 */
function getNormalizedStickyColumns() {
  return Array.isArray(props.stickyColumns) ? props.stickyColumns : [];
}

/**
 * 正規化每頁筆數選項。
 * @returns {Array<number>} 每頁筆數選項。
 */
function getNormalizedRowsPerPageOptions() {
  if (Array.isArray(props.rowsPerPageOptions) === false) {
    return [5, 10, 20, 0];
  }

  return props.rowsPerPageOptions;
}

/**
 * 正規化勾選列資料。
 * @returns {Array<any>} 勾選列陣列。
 */
function getNormalizedSelectedRows() {
  return Array.isArray(props.selected) ? props.selected : [];
}

/**
 * 取得可視欄位設定；空陣列時交由 QTable 顯示全部欄位。
 * @returns {Array<string>|undefined} 可視欄位名稱陣列。
 */
function getVisibleColumns() {
  if (Array.isArray(props.visibleColumns) === false || props.visibleColumns.length === 0) {
    return undefined;
  }

  return props.visibleColumns;
}

/**
 * 取得需轉發給 QTable 的 slot 名稱。
 * @returns {Array<string>} slot 名稱清單。
 */
function getForwardedSlotNames() {
  return Object.keys(slots);
}

const normalizedRows = computed(getNormalizedRows);
const normalizedColumns = computed(getNormalizedColumns);
const normalizedHeaderRows = computed(getNormalizedHeaderRows);
const normalizedGroupKeys = computed(getNormalizedGroupKeys);
const normalizedStickyColumns = computed(getNormalizedStickyColumns);
const normalizedRowsPerPageOptions = computed(getNormalizedRowsPerPageOptions);
const normalizedSelectedRows = computed(getNormalizedSelectedRows);
const resolvedVisibleColumns = computed(getVisibleColumns);
const forwardedSlotNames = computed(getForwardedSlotNames);

/**
 * 將 QTable 點擊列事件轉發給父層。
 * @param {Event} event 來源事件。
 * @param {object} row 被點擊的資料列。
 * @param {number} index 被點擊的索引。
 * @returns {void} 執行結果。
 */
function emitRowClick(event, row, index) {
  emit("row-click", { event, row, index });
}

/**
 * 轉發分頁與排序變更事件。
 * @param {{page:number,rowsPerPage:number,sortBy:string,descending:boolean}} nextPagination 新分頁設定。
 * @returns {void} 執行結果。
 */
function emitPaginationUpdate(nextPagination) {
  emit("update:pagination", nextPagination);
}

/**
 * 轉發勾選列更新事件。
 * @param {Array<any>} rows 勾選列資料。
 * @returns {void} 執行結果。
 */
function emitSelectedUpdate(rows) {
  emit("update:selected", rows);
}
</script>
