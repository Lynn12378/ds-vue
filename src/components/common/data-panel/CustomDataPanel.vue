<template>
  <q-card flat bordered class="custom-v2-card">
    <q-card-section class="row items-center justify-between">
      <div class="text-subtitle1">{{ title }}</div>
      <q-btn
        dense
        flat
        icon="refresh"
        :loading="loading"
        @click="handleRefresh"
      />
    </q-card-section>

    <q-separator />

    <CustomMessageBanner :messages="messages" />

    <q-card-section>
      <slot name="form">
        <CustomSearchForm
          :keyword="keyword"
          :loading="loading"
          @update:keyword="handleKeywordUpdate"
          @submit="handleSubmit"
          @reset="handleReset"
        />
      </slot>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pa-none">
      <slot name="table">
        <CustomDataTable
          :rows="normalizedRows"
          :columns="normalizedColumns"
          :header-rows="headerRows"
          :group-keys="groupKeys"
          :sticky-columns="stickyColumns"
          :row-key="rowKey"
          :pagination="pagination"
          :selected="normalizedSelectedRows"
          :selection="selection"
          :visible-columns="visibleColumns"
          :rows-per-page-options="rowsPerPageOptions"
          :binary-state-sort="binaryStateSort"
          :loading="loading"
          @row-click="handleRowClick"
          @update:pagination="handlePaginationUpdate"
          @update:selected="handleSelectedRowsUpdate"
        >
          <template
            v-for="slotName in forwardedTableSlotNames"
            :key="`forward-slot-${slotName}`"
            #[slotName]="slotProps"
          >
            <slot
              :name="slotName"
              v-bind="slotProps || {}"
            />
          </template>
        </CustomDataTable>
      </slot>
    </q-card-section>
  </q-card>

  <CustomConfirmDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :message="dialogMessage"
    @confirm="handleDialogConfirm"
    @cancel="handleDialogCancel"
  />
</template>

<script setup>
import { useQuasar } from "quasar";
import { computed, ref, useSlots, watch } from "vue";
import CustomMessageBanner from "@/components/common/message-banner/CustomMessageBanner.vue";
import CustomSearchForm from "@/components/common/search-form/CustomSearchForm.vue";
import CustomDataTable from "@/components/common/data-table/CustomDataTable.vue";
import CustomConfirmDialog from "@/components/common/confirm-dialog/CustomConfirmDialog.vue";

const $q = useQuasar();
const slots = useSlots();
const handledMessageKeys = ref(new Set());

const props = defineProps({
  title: {
    type: String,
    default: "Custom Component",
  },
  loading: {
    type: Boolean,
    default: false,
  },
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
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      rowsPerPage: 10,
      sortBy: "",
      descending: false,
    }),
  },
  selectedRows: {
    type: Array,
    default: () => [],
  },
  selection: {
    type: String,
    default: "none",
  },
  visibleColumns: {
    type: Array,
    default: () => [],
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 20, 0],
  },
  binaryStateSort: {
    type: Boolean,
    default: true,
  },
  messages: {
    type: Array,
    default: () => [],
  },
  keyword: {
    type: String,
    default: "",
  },
  dialogModelValue: {
    type: Boolean,
    default: false,
  },
  dialogTitle: {
    type: String,
    default: "提示",
  },
  dialogMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "refresh",
  "submit",
  "reset",
  "row-click",
  "update:keyword",
  "update:pagination",
  "update:selectedRows",
  "update:dialogModelValue",
  "dialog-confirm",
  "dialog-cancel",
  "rollback-required",
]);

/**
 * 取得 dialog 顯示狀態。
 * @returns {boolean} 是否顯示 dialog。
 */
function getDialogVisibility() {
  return props.dialogModelValue;
}

const dialogVisible = computed({
  get: getDialogVisibility,
  set: handleDialogVisibility,
});

/**
 * 正規化資料列，確保一定回傳陣列。
 * @returns {Array<any>} 表格資料列。
 */
function getNormalizedRows() {
  return Array.isArray(props.rows) ? props.rows : [];
}

/**
 * 正規化欄位定義，確保一定回傳陣列。
 * @returns {Array<any>} 欄位定義。
 */
function getNormalizedColumns() {
  return Array.isArray(props.columns) ? props.columns : [];
}

/**
 * 正規化勾選列資料。
 * @returns {Array<any>} 勾選列陣列。
 */
function getNormalizedSelectedRows() {
  return Array.isArray(props.selectedRows) ? props.selectedRows : [];
}

/**
 * 取得需要轉發給 CustomDataTable 的 slot 名稱。
 * @returns {Array<string>} slot 名稱清單。
 */
function getForwardedTableSlotNames() {
  const blockedSlotNames = new Set(["form", "table"]);
  return Object.keys(slots).filter((slotName) => blockedSlotNames.has(slotName) === false);
}

const normalizedRows = computed(getNormalizedRows);
const normalizedColumns = computed(getNormalizedColumns);
const normalizedSelectedRows = computed(getNormalizedSelectedRows);
const forwardedTableSlotNames = computed(getForwardedTableSlotNames);

/**
 * 建立訊息唯一識別鍵，避免重複顯示 toast/dialog。
 * @param {Record<string, any>} item 訊息物件。
 * @param {number} index 訊息索引。
 * @returns {string} 唯一識別鍵。
 */
function buildMessageKey(item, index) {
  if (item?.createdAt) {
    return `${item.createdAt}-${item.requestId || ""}-${item.message || ""}`;
  }

  return `${index}-${item?.requestId || ""}-${item?.message || ""}`;
}

/**
 * 將訊息等級映射到 Quasar notify 類型。
 * @param {string} level 訊息等級。
 * @returns {"negative"|"warning"|"positive"|"info"} notify 類型。
 */
function resolveNotifyType(level) {
  if (level === "error") {
    return "negative";
  }

  if (level === "warning") {
    return "warning";
  }

  if (level === "success") {
    return "positive";
  }

  return "info";
}

/**
 * 判斷訊息是否應使用 dialog 呈現。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {boolean} 是否顯示 dialog。
 */
function shouldUseDialogChannel(item) {
  if (item?.channel === "dialog") {
    return true;
  }

  return item?.notifyOnly !== true && item?.level === "error";
}

/**
 * 判斷訊息是否需要觸發 rollback。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {boolean} 是否需要 rollback。
 */
function shouldTriggerRollback(item) {
  return item?.rollbackRequired === true;
}

/**
 * 建立錯誤訊息的詳細文字。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {string} 詳細訊息字串。
 */
function buildDialogDetailText(item) {
  const lines = [];

  if (item?.message) {
    lines.push(item.message);
  }

  if (item?.errorCode) {
    lines.push(`錯誤代碼：${item.errorCode}`);
  }

  if (item?.systemId) {
    lines.push(`系統代碼：${item.systemId}`);
  }

  if (item?.url) {
    lines.push(`參考連結：${item.url}`);
  }

  if (item?.detail) {
    lines.push(`詳情：${item.detail}`);
  }

  return lines.join("\n");
}

/**
 * 顯示 toast 訊息。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {any} 執行結果。
 */
function showToastMessage(item) {
  $q.notify({
    type: resolveNotifyType(item?.level),
    message: item?.message || "系統訊息",
    position: "top-right",
    timeout: 2500,
  });
}

/**
 * 顯示錯誤 dialog 訊息。
 * @param {Record<string, any>} item 訊息物件。
 * @returns {any} 執行結果。
 */
function showDialogMessage(item) {
  $q.dialog({
    title: "錯誤訊息",
    message: buildDialogDetailText(item) || "系統發生錯誤",
    ok: {
      label: "關閉",
      color: "primary",
    },
  });
}

/**
 * 處理新進訊息的 UI 呈現（toast/dialog）。
 * @param {Array<any>} nextMessages 最新訊息陣列。
 * @returns {void} 執行結果。
 */
function handleMessagesChange(nextMessages) {
  if (Array.isArray(nextMessages) === false || nextMessages.length === 0) {
    handledMessageKeys.value = new Set();
    return;
  }

  nextMessages.forEach((item, index) => {
    const key = buildMessageKey(item, index);
    if (handledMessageKeys.value.has(key) === true) {
      return;
    }

    if (shouldUseDialogChannel(item) === true) {
      showDialogMessage(item);
    } else if (item?.channel !== "banner") {
      showToastMessage(item);
    }

    if (shouldTriggerRollback(item) === true) {
      emit("rollback-required", item);
    }

    handledMessageKeys.value.add(key);
  });
}

watch(
  () => props.messages,
  handleMessagesChange,
  {
    deep: true,
    immediate: true,
  }
);

/**
 * 轉發 refresh 事件。
 * @returns {void} 執行結果。
 */
function handleRefresh() {
  emit("refresh");
}

/**
 * 轉發 submit 事件。
 * @returns {void} 執行結果。
 */
function handleSubmit() {
  emit("submit");
}

/**
 * 轉發 reset 事件。
 * @returns {void} 執行結果。
 */
function handleReset() {
  emit("reset");
}

/**
 * 回傳父層 keyword 更新事件。
 * @param {string} value 搜尋關鍵字。
 * @returns {void} 執行結果。
 */
function handleKeywordUpdate(value) {
  emit("update:keyword", value);
}

/**
 * 轉發分頁/排序更新事件。
 * @param {{page:number,rowsPerPage:number,sortBy:string,descending:boolean}} nextPagination 新分頁資料。
 * @returns {void} 執行結果。
 */
function handlePaginationUpdate(nextPagination) {
  emit("update:pagination", nextPagination);
}

/**
 * 轉發勾選列更新事件。
 * @param {Array<any>} rows 勾選列資料。
 * @returns {void} 執行結果。
 */
function handleSelectedRowsUpdate(rows) {
  emit("update:selectedRows", rows);
}

/**
 * 轉發表格列點擊事件。
 * @param {{event: Event, row: object, index: number}} payload 點擊事件資料。
 * @returns {void} 執行結果。
 */
function handleRowClick(payload) {
  emit("row-click", payload);
}

/**
 * 同步 dialog 顯示狀態到父層。
 * @param {boolean} value 是否顯示 dialog。
 * @returns {void} 執行結果。
 */
function handleDialogVisibility(value) {
  emit("update:dialogModelValue", value);
}

/**
 * 轉發 dialog 確認事件。
 * @returns {void} 執行結果。
 */
function handleDialogConfirm() {
  emit("dialog-confirm");
}

/**
 * 轉發 dialog 取消事件。
 * @returns {void} 執行結果。
 */
function handleDialogCancel() {
  emit("dialog-cancel");
}

</script>

<style scoped>
.custom-v2-card {
  width: 100%;
}
</style>
