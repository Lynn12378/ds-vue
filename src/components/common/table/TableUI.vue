<template>
  <!--
    TableUI.vue
    ============================================================
    對應 TableUI(config) 的 Vue 3 SFC 封裝版本
    使用 q-table 原生 API 最大化還原業務邏輯：

    ✅ 原生使用：
      - selection / v-model:selected           → autoCheckBox checkbox/radio
      - visible-columns                        → hiddenGroup
      - v-model:pagination + @request          → 分頁 + server-side fatch
      - binary-state-sort / column.sort()      → sortDetail 排序
      - :filter + :filter-method               → client-side 搜尋
      - sticky-header / position:sticky CSS    → overDiv 固定表頭
      - :loading                               → AJAX loading 狀態
      - column.format(val, row)                → doSettingRender 顯示格式
      - #top-left / #top-right slots           → tableControl 工具列
      - #body-cell-[name] slot                 → 自訂欄位（驗證錯誤色）
      - :rows-per-page-options                 → pageSize 選項
      - row-class-name                         → error_record class

    ⚠️ 無法用 q-table 原生還原：
      - rowSpan groupKey（q-table 無 rowSpan）
      - fixedColumn 雙 DOM 凍結（改 CSS sticky）
      - autoCheckBox.highlight 跨 rowSpan 整列高亮
  -->
  <div class="table-ui-wrapper">
    <!-- ══ 隱藏欄位復原選單（對應 TableUI hidden_columns_ul） ══ -->
    <div v-if="hiddenCols.length > 0" class="table-ui__hidden-bar q-mb-xs">
      <span class="text-caption text-grey-6 q-mr-sm">已隱藏欄位：</span>
      <q-chip
        v-for="col in hiddenCols"
        :key="col.name"
        dense
        removable
        color="grey-3"
        text-color="grey-8"
        icon="visibility_off"
        class="q-mr-xs"
        @remove="showColumn(col.name)"
      >
        {{ col.label }}
      </q-chip>
    </div>

    <!-- ══ q-table 主體 ══ -->
    <q-table
      ref="qTableRef"
      v-model:selected="innerSelected"
      v-model:pagination="innerPagination"
      :rows="rows"
      :columns="computedColumns"
      :row-key="rowKey"
      :visible-columns="visibleColumnNames"
      :loading="loading"
      :filter="filter"
      :filter-method="filterMethod || defaultFilterMethod"
      :selection="selectionMode"
      :rows-per-page-options="rowsPerPageOptions"
      :binary-state-sort="binaryStateSort"
      :dense="dense"
      :flat="flat"
      :bordered="bordered"
      :separator="separator"
      :wrap-cells="wrapCells"
      :no-data-label="noDataLabel"
      :no-results-label="noResultsLabel"
      :loading-label="loadingLabel"
      :rows-per-page-label="rowsPerPageLabel"
      :selected-rows-label="selectedRowsLabel"
      :virtual-scroll="virtualScroll"
      :virtual-scroll-sticky-size-start="stickyHeaderHeight"
      :table-style="tableStyle || (stickyHeader ? `max-height: ${maxHeight}` : undefined)"
      :table-class="[
        stickyHeader ? 'table-ui--sticky-header' : '',
        tableClass,
      ]"
      class="table-ui"
      :class="{ 'table-ui--error-mode': validateScope !== 'none' }"
      @request="onRequest"
      @row-click="onRowClick"
      @selection="onSelectionChange"
    >
      <!-- ══ 工具列頂部左側（對應 TableUI tableControl / title） ══ -->
      <template #top-left>
        <!-- 標題（對應 TableUI config.title） -->
        <div v-if="title" class="text-h6 table-ui__title">{{ title }}</div>

        <!-- 搜尋框（client-side filter） -->
        <q-input
          v-if="showSearch"
          v-model="filter"
          :debounce="searchDebounce"
          dense
          borderless
          clearable
          placeholder="搜尋..."
          class="table-ui__search"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- 使用者自訂 top-left slot -->
        <slot name="top-left" />
      </template>

      <!-- ══ 工具列頂部右側 ══ -->
      <template #top-right>
        <!-- 欄位顯示/隱藏選擇器（對應 TableUI hiddenGroup UI） -->
        <q-select
          v-if="showColumnPicker"
          v-model="visibleColumnNames"
          :options="toggleableColumns"
          option-value="name"
          option-label="label"
          emit-value
          map-options
          multiple
          dense
          borderless
          options-dense
          display-value=""
          class="table-ui__col-picker q-mr-sm"
        >
          <template #prepend>
            <q-btn
              flat
              dense
              round
              icon="view_column"
              size="sm"
            >
              <q-tooltip>顯示/隱藏欄位</q-tooltip>
            </q-btn>
          </template>
        </q-select>

        <!-- 匯出按鈕 -->
        <q-btn
          v-if="showExport"
          flat
          dense
          round
          icon="download"
          class="q-mr-xs"
          @click="$emit('export-click')"
        >
          <q-tooltip>匯出</q-tooltip>
        </q-btn>

        <!-- 使用者自訂 top-right slot -->
        <slot name="top-right" />
      </template>

      <!-- ══ 表頭 selection 欄位（對應 autoCheckBox header） ══ -->
      <template v-if="selectionMode !== 'none'" #header-selection="scope">
        <q-th v-if="selectionMode === 'multiple'" auto-width>
          <!--
            使用 q-table 原生 scope.selected 概念，
            但加入 disabledAll 判斷（對應 checkAllBox.disabled）
          -->
          <q-checkbox
            v-model="scope.selected"
            :disable="isSelectAllDisabled"
            dense
            @update:model-value="onSelectAll"
          />
        </q-th>
        <q-th v-else auto-width />
      </template>

      <!-- ══ 資料列 selection 欄（對應 autoCheckBox render） ══ -->
      <template v-if="selectionMode !== 'none'" #body-selection="scope">
        <q-td auto-width>
          <!--
            對應 TableUI autoCheckBox render function：
            - hidden(-99)：v-if 不渲染
            - disabled(0/-2)：disable prop
            - checked(1/0)：props.selected
          -->
          <template v-if="!isRowHidden(scope.row)">
            <q-checkbox
              v-if="selectionMode === 'multiple'"
              v-model="scope.selected"
              :disable="isRowDisabled(scope.row)"
              dense
            />
            <q-radio
              v-else
              :model-value="isRowSelected(scope.row)"
              :val="true"
              :disable="isRowDisabled(scope.row)"
              dense
              @update:model-value="onRadioSelect(scope.row)"
            />
          </template>
        </q-td>
      </template>

      <!-- ══ 自訂欄位 cell（驗證錯誤 + format + 使用者 slot） ══ -->
      <!--
        對應 TableUI body cell 渲染邏輯：
        優先順序：使用者 slot > column.format > 預設值
        驗證錯誤：row-class-name（在 q-table 層）

        因 q-table 不支援動態 slot name，
        使用 #body-cell 泛用 slot 接管所有欄位渲染
      -->
      <template #body-cell="props">
        <q-td
          :props="props"
          :class="getCellClass(props.row, props.col)"
          :style="getCellStyle(props.row, props.col)"
        >
          <!-- 使用者可透過 body-cell-[name] 自訂欄位 -->
          <slot
            :name="`body-cell-${props.col.name}`"
            v-bind="props"
          >
            <!-- 預設渲染：format 函式 or 原始值 -->
            <span :title="String(props.value ?? '')">
              {{ props.value ?? whenNull }}
            </span>
          </slot>
        </q-td>
      </template>

      <!-- ══ 合計列 / 小計列（對應 TableUI tfoot） ══ -->
      <template v-if="totalRow || subTotalRows.length" #bottom-row>
        <!-- 小計列（對應 recordsSubTotalCount） -->
        <q-tr
          v-for="(sub, idx) in subTotalRows"
          :key="`sub-${idx}`"
          class="table-ui__subtotal-row"
        >
          <q-td
            v-if="selectionMode !== 'none'"
            auto-width
          />
          <q-td
            v-for="col in computedColumns.filter(c => visibleColumnNames.includes(c.name))"
            :key="col.name"
            :props="{ col }"
          >
            <slot
              :name="`subtotal-cell-${col.name}`"
              :row="sub"
              :col="col"
            >
              {{ sub[col.name] ?? '' }}
            </slot>
          </q-td>
        </q-tr>

        <!-- 合計列（對應 recordsTotalCount） -->
        <q-tr v-if="totalRow" class="table-ui__total-row">
          <q-td
            v-if="selectionMode !== 'none'"
            auto-width
          />
          <q-td
            v-for="(col, idx) in computedColumns.filter(c => visibleColumnNames.includes(c.name))"
            :key="col.name"
          >
            <template v-if="idx === 0">
              <!-- 合計列標題（對應 TableUI total_header） -->
              <strong>{{ totalRowLabel }}</strong>
            </template>
            <template v-else>
              <slot
                :name="`total-cell-${col.name}`"
                :row="totalRow"
                :col="col"
              >
                {{ totalRow[col.name] ?? '' }}
              </slot>
            </template>
          </q-td>
        </q-tr>
      </template>

      <!-- ══ 無資料顯示（對應 TableUI clearRecordsBodies） ══ -->
      <template #no-data="{ message }">
        <slot name="no-data" :message="message">
          <div class="full-width row flex-center q-gutter-sm text-grey-5 q-py-lg">
            <q-icon name="table_rows" size="2em" />
            <span>{{ message }}</span>
          </div>
        </slot>
      </template>

      <!-- ══ loading 狀態 ══ -->
      <template #loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- ══ 分頁控制（對應 TableUI tableControl 換頁按鈕） ══ -->
      <template v-if="showPagination" #pagination="scope">
        <div class="row items-center q-gutter-xs table-ui__pagination">
          <!-- 分頁資訊文字（對應 TableUI recordInfoPattern） -->
          <span class="text-caption text-grey-7">
            {{ formatPaginationLabel(scope) }}
          </span>

          <!-- 每頁筆數（對應 TableUI pageSize select） -->
          <q-select
            v-model="innerPagination.rowsPerPage"
            :options="rowsPerPageOptions.filter(n => n > 0)"
            dense
            borderless
            options-dense
            class="table-ui__page-size"
            style="min-width: 60px"
            @update:model-value="onRowsPerPageChange"
          />

          <q-btn
            flat dense round
            icon="first_page"
            :disable="scope.isFirstPage"
            @click="scope.firstPage"
          />
          <q-btn
            flat dense round
            icon="chevron_left"
            :disable="scope.isFirstPage"
            @click="scope.prevPage"
          />
          <q-btn
            flat dense round
            icon="chevron_right"
            :disable="scope.isLastPage"
            @click="scope.nextPage"
          />
          <q-btn
            flat dense round
            icon="last_page"
            :disable="scope.isLastPage"
            @click="scope.lastPage"
          />
        </div>
      </template>

      <!-- ══ 透傳其餘使用者 slots（排除元件內已定義的 slot） ══
           透傳機制：讓使用者仍可使用 q-table 原生 slots，例如：
             #top、#header、#header-cell-[name] 等
           排除已在此元件處理的 slots，避免覆蓋造成雙重渲染
      -->
      <template
        v-for="(_, slotName) in passthroughSlots"
        :key="slotName"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
/**
 * TableUI.vue
 * ─────────────────────────────────────────────────────────────
 * 以 q-table 原生 API 封裝 TableUI 業務邏輯的單一元件
 *
 * Props 對應 TableUI config：
 *   rows              ← load(records)
 *   columns           ← config.column
 *   selectionMode     ← autoCheckBox.type
 *   selectionConfig   ← autoCheckBox (checkRule / disableRule / visibleRule)
 *   validation        ← validateRecord
 *   fetchConfig       ← isLoadByFatch
 *   rowsPerPage       ← pageSize
 *   totalRow          ← resetTotalCount
 *   subTotalRows      ← resetSubTotalCount
 *
 * Emits 對應 TableUI callback：
 *   @update:selected  ← autoCheckBox.action
 *   @row-click        ← config.rowClick
 *   @page-change      ← config.pageChange
 *   @request          ← server-side fetcher（供外部攔截）
 *   @export-click     ← 匯出按鈕點擊
 */

import {
  ref, computed, watch, nextTick, useSlots,
} from 'vue'

// ── Props ────────────────────────────────────────────────────

const props = defineProps({
  // ── 核心資料 ─────────────────────────────────────────────
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    required: true,
  },
  rowKey: {
    type: String,
    default: 'id',
  },

  // ── 分頁（對應 TableUI pageSize / isLoadByFatch） ─────────
  rowsPerPage: {
    type: Number,
    default: 10,
  },
  rowsPerPageOptions: {
    type: Array,
    // 對應 TableUI pageSize 選項，0 = 全部顯示
    default: () => [5, 10, 20, 50, 100, 0],
  },
  /**
   * server-side 模式：外部提供 pagination.rowsNumber
   * 對應 TableUI isLoadByFatch
   */
  serverSide: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },

  // ── selection（對應 TableUI autoCheckBox） ────────────────
  /**
   * 'multiple' = checkbox（預設），'single' = radio，'none' = 無
   * 對應 TableUI autoCheckBox.type
   */
  selectionMode: {
    type: String,
    default: 'none',
    validator: (v) => ['multiple', 'single', 'none'].includes(v),
  },
  /**
   * 對應 autoCheckBox 的三種規則
   * {
   *   checkRule:   (row) => bool   // 初始勾選
   *   disableRule: (row) => bool   // disabled
   *   visibleRule: (row) => bool   // 是否顯示 checkbox（false = 隱藏）
   * }
   */
  selectionConfig: {
    type: Object,
    default: null,
  },
  /**
   * 外部 v-model:selected 同步
   * 對應 TableUI getCheckedRecords / autoCheckBoxSelectAll
   */
  selected: {
    type: Array,
    default: () => [],
  },

  // ── 驗證（對應 TableUI validateRecord） ───────────────────
  /**
   * {
   *   rule: (row, index) => bool
   * }
   */
  validation: {
    type: Object,
    default: null,
  },
  /**
   * 驗證範圍：'none' | 'all' | 'checked'
   * 對應 TableUI validate_type
   */
  validateScope: {
    type: String,
    default: 'none',
    validator: (v) => ['none', 'all', 'checked'].includes(v),
  },

  // ── 合計 / 小計（對應 TableUI tfoot） ────────────────────
  totalRow: {
    type: Object,
    default: null,
  },
  totalRowLabel: {
    type: String,
    default: '合計',  // 對應 TableUI config.default_total_header
  },
  subTotalRows: {
    type: Array,
    default: () => [],
  },

  // ── 欄位顯隱（對應 TableUI hiddenGroup） ──────────────────
  /**
   * 已隱藏欄位的 name 陣列
   * 對應 TableUI hiddenColumns
   */
  hiddenColumns: {
    type: Array,
    default: () => [],
  },
  showColumnPicker: {
    type: Boolean,
    default: false,
  },

  // ── 搜尋 ──────────────────────────────────────────────────
  showSearch: {
    type: Boolean,
    default: false,
  },
  searchDebounce: {
    type: Number,
    default: 300,
  },
  filterMethod: {
    type: Function,
    default: null,
  },

  // ── 外觀 / 佈局 ───────────────────────────────────────────
  title: {
    type: String,
    default: '',
  },
  /**
   * sticky header（對應 TableUI overDiv 固定表頭）
   * 使用 position:sticky CSS 實現
   */
  stickyHeader: {
    type: Boolean,
    default: true,
  },
  maxHeight: {
    type: String,
    default: '60vh',  // 對應 TableUI overDiv.maxHeight 概念
  },
  stickyHeaderHeight: {
    type: Number,
    default: 48,  // virtual-scroll 時需要指定表頭高度
  },
  dense: {
    type: Boolean,
    default: false,
  },
  flat: {
    type: Boolean,
    default: true,
  },
  bordered: {
    type: Boolean,
    default: true,
  },
  separator: {
    type: String,
    default: 'cell',
  },
  wrapCells: {
    type: Boolean,
    default: false,
  },
  tableClass: {
    type: String,
    default: '',
  },
  tableStyle: {
    type: String,
    default: '',
  },
  virtualScroll: {
    type: Boolean,
    default: false,
  },
  binaryStateSort: {
    type: Boolean,
    default: true,  // 對應 TableUI: 點排序只切換 asc/desc，不回到無排序
  },
  showExport: {
    type: Boolean,
    default: false,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },

  // ── 文字設定（對應 TableUI recordInfoPattern） ────────────
  /**
   * 分頁資訊格式，支援 {page} {totalPages} {rowsNumber}
   * 對應 TableUI recordInfoPattern
   */
  paginationLabel: {
    type: String,
    default: '第 {page} 頁 / 共 {totalPages} 頁，共 {rowsNumber} 筆',
  },
  noDataLabel: {
    type: String,
    default: '無資料',
  },
  noResultsLabel: {
    type: String,
    default: '無符合的資料',
  },
  loadingLabel: {
    type: String,
    default: '讀取中...',
  },
  rowsPerPageLabel: {
    type: String,
    default: '每頁筆數：',
  },
  selectedRowsLabel: {
    type: Function,
    default: (n) => `已選取 ${n} 筆`,
  },
  /**
   * 資料為空時顯示字串（對應 TableUI dataWhenNULL）
   */
  whenNull: {
    type: String,
    default: '',
  },
})

// ── Emits ────────────────────────────────────────────────────

const emit = defineEmits([
  'update:selected',      // v-model:selected（對應 autoCheckBox.action）
  'update:hiddenColumns', // v-model:hiddenColumns
  'row-click',            // 對應 config.rowClick
  'page-change',          // 對應 config.pageChange
  'request',              // server-side：對應 @request（供外部攔截 + 呼叫 API）
  'export-click',         // 匯出按鈕點擊
  'selection-change',     // 勾選狀態變更
])

// ── Refs ─────────────────────────────────────────────────────

const qTableRef = ref(null)

/** 搜尋關鍵字（對應 TableUI filter prop） */
const filter = ref('')

/**
 * 分頁狀態（對應 TableUI pagination）
 * server-side 時 rowsNumber 由外部透過 @request 回填
 */
const innerPagination = ref({
  page:        1,
  rowsPerPage: props.rowsPerPage,
  rowsNumber:  0,    // server-side 必填；client-side 由 q-table 自算
  sortBy:      null,
  descending:  false,
})

/**
 * 已選取的 rows（對應 TableUI autoCheckBox selected state）
 * 使用 q-table 原生 v-model:selected 機制
 */
const innerSelected = ref([...props.selected])

/** 可見欄位 names（對應 TableUI visible-columns） */
const visibleColumnNames = ref(
  props.columns
    .filter((c) => !props.hiddenColumns.includes(c.name))
    .map((c) => c.name)
)

// ── 欄位計算 ─────────────────────────────────────────────────

/**
 * 加入 sticky CSS class 到 required 欄位（對應 TableUI fixedColumn CSS sticky）
 * q-table 原生 visible-columns 控制顯隱，required: true 的欄位永遠顯示
 */
const computedColumns = computed(() =>
  props.columns.map((col) => ({
    ...col,
    // 預設所有欄位可排序（對應 TableUI allSortable: true）
    sortable: col.sortable !== false,
    // required 欄位即使被 visible-columns 過濾也會顯示（對應 fixedColumn）
    required: col.required ?? false,
    // 使用 q-table 原生 format（對應 TableUI doSettingRender）
    format: col.format ?? ((val) => {
      if (val === null || val === undefined || val === '') return props.whenNull
      if (col.dataType === 'number' && typeof val === 'number') {
        return val.toLocaleString('zh-TW')
      }
      return String(val)
    }),
    // 原生 sort function（對應 TableUI sortByNumeric / sortByDate / sortByString）
    sort: col.sort ?? getSortFn(col.sortRule ?? col.dataType),
  }))
)

/** 可切換顯示的欄位（排除 required 欄位） */
const toggleableColumns = computed(() =>
  props.columns.filter((c) => !c.required)
)

/** 已隱藏的欄位清單（供頂部 chip bar 顯示） */
const hiddenCols = computed(() =>
  props.columns.filter((c) => !visibleColumnNames.value.includes(c.name) && !c.required)
)

// ── Selection 計算 ───────────────────────────────────────────

/**
 * 全選 checkbox 是否 disabled
 * 對應 TableUI checkAllBox.disabled 邏輯：
 *   無可勾選項目時 disabled = true
 */
const isSelectAllDisabled = computed(() => {
  if (!props.selectionConfig?.disableRule) return false
  return props.rows.every((row) => props.selectionConfig.disableRule(row))
})

/**
 * 判斷單列是否 disabled（對應 TableUI autoCheckBoxResult 0/-2）
 */
const isRowDisabled = (row) => {
  return props.selectionConfig?.disableRule?.(row) ?? false
}

/**
 * 判斷單列的 checkbox 是否隱藏（對應 TableUI autoCheckBoxResult -99）
 */
const isRowHidden = (row) => {
  if (!props.selectionConfig?.visibleRule) return false
  return !props.selectionConfig.visibleRule(row)
}

/**
 * 判斷 radio 模式下單列是否已選
 */
const isRowSelected = (row) => {
  return innerSelected.value.some((r) => r[props.rowKey] === row[props.rowKey])
}

// ── 初始化 selection（對應 TableUI setSerialNnmber + checkRule）─

const initSelection = () => {
  if (props.selectionMode === 'none' || !props.selectionConfig?.checkRule) return

  const preSelected = props.rows.filter((row) =>
    props.selectionConfig.checkRule(row)
  )
  innerSelected.value = preSelected
  emit('update:selected', preSelected)
}

// ── 驗證 ─────────────────────────────────────────────────────

/**
 * 驗證失敗的 row keys（供 row-class-name 使用）
 * 對應 TableUI _tableuiValidateStatus === false
 */
const errorRowKeys = computed(() => {
  if (props.validateScope === 'none' || !props.validation?.rule) return new Set()

  const failRows = props.rows.filter((row, idx) => {
    const shouldValidate =
      props.validateScope === 'all' ||
      (props.validateScope === 'checked' && isRowSelected(row))
    if (!shouldValidate) return false
    return !props.validation.rule(row, idx + 1)
  })

  return new Set(failRows.map((r) => r[props.rowKey]))
})

// ── 欄位 class / style ────────────────────────────────────────

/**
 * 對應 TableUI: setRecordClass / error_record class
 * 透過 q-td class 實現（因 q-table row-class-name 與 body-cell slot 並用時
 * 需在 q-td 層設定才能正確覆蓋樣式）
 */
const getCellClass = (row, col) => {
  const classes = []
  if (errorRowKeys.value.has(row[props.rowKey])) {
    classes.push('table-ui__cell--error')
  }
  // 原始 column classes（對應 TableUI recordSetting.classes）
  if (col.classes) {
    const dynamic = typeof col.classes === 'function' ? col.classes(row) : col.classes
    if (dynamic) classes.push(dynamic)
  }
  return classes.join(' ')
}

const getCellStyle = (row, col) => {
  if (typeof col.style === 'function') return col.style(row)
  return col.style ?? ''
}

// ── 排序函式工廠（對應 TableUI sortByNumeric/Date/String）───

const getSortFn = (sortRule) => {
  const rule = (sortRule || 'string').toLowerCase()
  switch (rule) {
    case 'number':
      return (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0)
    case 'date':
    case 'datetime':
      return (a, b) => {
        const da = a ? new Date(a).getTime() : 0
        const db = b ? new Date(b).getTime() : 0
        return da - db
      }
    case 'rocdate':
      // ⚠️ 民國日期：yyy → yyy+1911 後比較
      return (a, b) => {
        const toNum = (v) => {
          const s = String(v ?? '').replace(/-/g, '')
          return parseInt(s.substring(0, 3), 10) * 10000 + parseInt(s.substring(3) || '0', 10)
        }
        return toNum(a) - toNum(b)
      }
    default:
      // 中文支援（對應 TableUI sortByStringIncrease 改善版）
      return (a, b) => String(a ?? '').localeCompare(String(b ?? ''), 'zh-Hant', { numeric: true })
  }
}

// ── 預設 client-side 搜尋（對應 TableUI 不支援的 filter）──

/**
 * q-table :filter-method
 * 對應 TableUI 本身無 filter 功能，此為新增的搜尋能力
 */
const defaultFilterMethod = (rows, terms, cols) => {
  if (!terms) return rows
  const lower = String(terms).toLowerCase()
  return rows.filter((row) =>
    cols.some((col) => {
      const val = col.field ? (typeof col.field === 'function' ? col.field(row) : row[col.field]) : row[col.name]
      return String(val ?? '').toLowerCase().includes(lower)
    })
  )
}

// ── 分頁文字格式化（對應 TableUI recordInfoPattern）─────────

const formatPaginationLabel = (scope) => {
  return props.paginationLabel
    .replace('{page}', scope.pagination.page)
    .replace('{totalPages}', scope.pagesNumber)
    .replace('{rowsNumber}', scope.pagination.rowsNumber || props.rows.length)
}

// ── 事件處理 ─────────────────────────────────────────────────

/**
 * q-table @request 處理
 * 對應 TableUI: pageControlFatch_impl 的 ajaxRecords 觸發
 *
 * server-side 模式：直接 emit 給外部處理
 * client-side：q-table 內部自動處理，此 handler 不會觸發
 */
const onRequest = (requestProps) => {
  if (!props.serverSide) return

  // 同步 pagination 狀態
  innerPagination.value = {
    ...innerPagination.value,
    ...requestProps.pagination,
  }

  // emit 給外部，外部呼叫 API 後更新 rows + pagination.rowsNumber
  emit('request', requestProps)
  emit('page-change', requestProps.pagination.page, requestProps.pagination)
}

/**
 * 列點擊（對應 TableUI config.rowClick）
 */
const onRowClick = (evt, row, index) => {
  emit('row-click', evt, row, index)
}

/**
 * selection 變更（對應 TableUI autoCheckBox.action）
 */
const onSelectionChange = ({ rows, added, evt }) => {
  emit('update:selected', innerSelected.value)
  emit('selection-change', {
    selected: innerSelected.value,
    changed: rows,
    added,
  })
}

/**
 * radio 模式選擇（對應 TableUI autoCheckBoxSingle radio 邏輯）
 * ⚠️ q-table selection='single' 已自動處理 radio 單選
 *    此方法僅處理自訂 radio 的邊界情況
 */
const onRadioSelect = (row) => {
  const alreadySelected = innerSelected.value.some(
    (r) => r[props.rowKey] === row[props.rowKey]
  )
  // 再次點擊已選取的 radio → 取消選取（對應 TableUI previousRadio 邏輯）
  innerSelected.value = alreadySelected ? [] : [row]
  emit('update:selected', innerSelected.value)
}

/**
 * 全選（對應 TableUI autoCheckBoxSelectAll）
 * ⚠️ q-table 原生 header-selection scope.selected 已處理大部分情況
 *    但需過濾 disabled rows
 */
const onSelectAll = (val) => {
  if (!val) {
    innerSelected.value = []
  } else {
    innerSelected.value = props.rows.filter((row) => !isRowDisabled(row) && !isRowHidden(row))
  }
  emit('update:selected', innerSelected.value)
}

/**
 * 每頁筆數變更（對應 TableUI pageSize 切換）
 */
const onRowsPerPageChange = () => {
  innerPagination.value.page = 1
}

// ── 欄位顯隱（對應 TableUI hiddenGroup / showColumn）────────

const showColumn = (name) => {
  if (!visibleColumnNames.value.includes(name)) {
    visibleColumnNames.value = [...visibleColumnNames.value, name]
    emit('update:hiddenColumns', hiddenCols.value.map((c) => c.name))
  }
}

// ── watch ──────────────────────────────────────────────────

// 外部 selected 同步（對應 TableUI preCheckedValues）
watch(() => props.selected, (val) => {
  innerSelected.value = [...val]
}, { deep: true })

// 外部 rows 變更時重新初始化 selection
watch(() => props.rows, () => {
  nextTick(initSelection)
}, { immediate: true })

// 欄位顯隱同步到外部
watch(visibleColumnNames, (val) => {
  const newHidden = props.columns
    .filter((c) => !val.includes(c.name) && !c.required)
    .map((c) => c.name)
  emit('update:hiddenColumns', newHidden)
})

// server-side：rows 變更時不重置分頁（由 @request 控制）
watch(() => props.rows, (newRows) => {
  if (!props.serverSide) {
    innerPagination.value.rowsNumber = newRows.length
  }
})

// ── Expose（對應 TableUI 外部操作 API）───────────────────────

/**
 * 對應 TableUI: grid.checkAll()
 */
const checkAll = () => {
  innerSelected.value = props.rows.filter(
    (row) => !isRowDisabled(row) && !isRowHidden(row)
  )
  emit('update:selected', innerSelected.value)
}

/**
 * 對應 TableUI: grid.checkAll(false) / uncheckAll
 */
const uncheckAll = () => {
  innerSelected.value = []
  emit('update:selected', [])
}

/**
 * 對應 TableUI: grid.setAutoCheckBoxByValue(value, checked)
 */
const setCheckedByKey = (keyValue, checked) => {
  const row = props.rows.find((r) => r[props.rowKey] === keyValue)
  if (!row) return
  if (checked) {
    if (!innerSelected.value.some((r) => r[props.rowKey] === keyValue)) {
      innerSelected.value = [...innerSelected.value, row]
    }
  } else {
    innerSelected.value = innerSelected.value.filter((r) => r[props.rowKey] !== keyValue)
  }
  emit('update:selected', innerSelected.value)
}

/**
 * 對應 TableUI: grid.validTable()
 */
const validTable = () => {
  return errorRowKeys.value.size
}

/**
 * 對應 TableUI: grid.getCheckedRecords()
 */
const getCheckedRecords = (template) => {
  const rows = innerSelected.value
  if (!template) return rows
  if (typeof template === 'string') return rows.map((r) => r[template])
  if (Array.isArray(template)) {
    return rows.map((r) => Object.fromEntries(template.map((k) => [k, r[k]])))
  }
  return rows
}

/**
 * 對應 TableUI: grid.scrollTop()
 */
const scrollTop = () => {
  qTableRef.value?.$el?.querySelector('.q-table__middle')?.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 對應 TableUI: grid.scrollBottom()
 */
const scrollBottom = () => {
  const el = qTableRef.value?.$el?.querySelector('.q-table__middle')
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
}

/**
 * 取得 pagination 狀態（對應 TableUI getTableInfo）
 */
const getPagination = () => ({ ...innerPagination.value })

/**
 * 設定 pagination（對應 TableUI setTableInfo）
 */
const setPagination = (info) => {
  Object.assign(innerPagination.value, info)
}

// ── 透傳 slots（排除已定義的，避免雙重渲染）────────────────

/**
 * 元件內已處理的 slot names，不透傳給 q-table
 * 使用者若命名這些 slot 會由元件內部 template 處理
 */
const INTERNAL_SLOTS = new Set([
  'top-left', 'top-right',
  'header-selection', 'body-selection',
  'body-cell',
  'bottom-row',
  'no-data',
  'loading',
  'pagination',
])

/**
 * 透傳給 q-table 的 slots：使用者提供的、但不在 INTERNAL_SLOTS 中的
 * 包含：body-cell-[name]、total-cell-[name]、subtotal-cell-[name]
 *       header-cell-[name]、top、header、bottom 等 q-table 原生 slots
 *
 * ⚠️ body-cell-[name] / total-cell-[name] / subtotal-cell-[name]
 *    是元件自訂的 slot，由元件內部 #body-cell / #bottom-row 轉發
 *    不需要透傳給 q-table（q-table 不認識這些 slot names）
 */
const COMPONENT_CUSTOM_SLOTS = /^(body-cell-|total-cell-|subtotal-cell-)/

const slots = useSlots()

const passthroughSlots = computed(() =>
  Object.fromEntries(
    Object.entries(slots).filter(([name]) =>
      !INTERNAL_SLOTS.has(name) && !COMPONENT_CUSTOM_SLOTS.test(name)
    )
  )
)

defineExpose({
  // selection
  checkAll,
  uncheckAll,
  setCheckedByKey,
  getCheckedRecords,
  innerSelected,
  // 驗證
  validTable,
  errorRowKeys,
  // 捲動
  scrollTop,
  scrollBottom,
  // 分頁
  getPagination,
  setPagination,
  innerPagination,
  // 搜尋
  filter,
  // 欄位
  visibleColumnNames,
  showColumn,
  // q-table ref
  qTableRef,
})
</script>

<style lang="scss" scoped>
.table-ui-wrapper {
  display: flex;
  flex-direction: column;
}

/* ── sticky header（對應 TableUI overDiv 固定表頭） ── */
.table-ui--sticky-header {

  /* q-table__top + q-table__bottom 不捲動 */
  :deep(thead tr th) {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #fff;
  }

  /* dark mode */
  .q-dark & :deep(thead tr th) {
    background: var(--q-dark);
  }
}

/* ── 欄位固定（對應 TableUI fixedColumn CSS sticky 版本）── */
:deep(.sticky-col) {
  position: sticky;
  left: 0;
  z-index: 1;
  background: inherit;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -4px;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to right, rgba(0,0,0,.08), transparent);
    pointer-events: none;
  }
}

/* ── 驗證錯誤（對應 TableUI error_record） ── */
:deep(.table-ui__cell--error) {
  background-color: rgba(244, 67, 54, 0.06) !important;
  color: #c62828;

  .table-ui--error-mode & {
    /* 只在啟用驗證時顯示紅色 */
  }
}

/* ── 合計列（對應 TableUI tfoot .totalCountRecord） ── */
:deep(.table-ui__total-row) {
  background: #fafafa;
  font-weight: 600;
  border-top: 2px solid #e0e0e0;

  td {
    color: #333;
  }
}

/* ── 小計列 ── */
:deep(.table-ui__subtotal-row) {
  background: #f5f5f5;
  font-weight: 500;

  td {
    color: #555;
    font-style: italic;
  }
}

/* ── 隱藏欄位 chip bar ── */
.table-ui__hidden-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 4px 8px;
  background: #fffde7;
  border-radius: 4px;
  border: 1px solid #f9a825;
}

/* ── 工具列 ── */
.table-ui__title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
}

.table-ui__search {
  min-width: 200px;
}

.table-ui__col-picker {
  min-width: 40px;
}

/* ── 分頁列 ── */
.table-ui__pagination {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.table-ui__page-size {
  :deep(.q-field__native) {
    padding: 0;
    font-size: 0.85rem;
  }
}
</style>
