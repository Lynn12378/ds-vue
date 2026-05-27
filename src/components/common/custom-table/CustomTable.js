import { h, ref, computed, watch, nextTick, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import { QTable, QCheckbox } from 'quasar'

/**
 * CustomTable
 *
 * 以 QTable 為底層的薄封裝元件，額外支援：
 *   - headerRows  多列 header（對應 TableUI config.headerColumn / split）
 *
 * 合併欄位（groupKey）不實作，避免影響排序正確性。
 * 固定欄位（fixedColumns）不在此實作，由頁面自行以 CSS sticky 處理。
 *
 * 所有 QTable 原生 props / events / slots 均透過 $attrs 透傳，不需額外宣告。
 * 預設套用 flat + bordered + dense。
 */
export default {
  name: 'CustomTable',

  inheritAttrs: false,

  props: {
    /**
     * 欄位定義陣列，對應 QTable columns prop
     * 必填
     */
    columns: {
      type: Array,
      required: true,
    },

    /**
     * 多列 header 定義（對應 TableUI config.headerColumn / split）
     * 結構：Array<Array<{ label, colspan?, rowspan?, field? }>>
     *   - label    顯示文字
     *   - colspan  合併欄數（預設 1）
     *   - rowspan  合併列數（預設 1）
     *   - field    對應 column.name，用於排序點擊與 sticky 識別（無 field 則該格不可排序）
     */
    headerRows: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { attrs, slots }) {
    const tableRef = ref(null)

    // ─── 基礎計算 ─────────────────────────────────────────────────────

    /**
     * 傳入 QTable 的 props：透傳 attrs + 固定 columns + 套用預設樣式
     */
    const qTableProps = computed(() => {
      const merged = { ...attrs, columns: props.columns }

      // 預設樣式（可由外部覆蓋）
      if (merged.flat    === undefined) merged.flat    = true
      if (merged.bordered === undefined) merged.bordered = true
      if (merged.dense   === undefined) merged.dense   = true

      return merged
    })

    /** 是否啟用多列自訂 header */
    const hasCustomHeader = computed(
      () => Array.isArray(props.headerRows) && props.headerRows.length > 0
    )

    /** column.name → column 定義的快速查詢 Map */
    const columnMap = computed(() => {
      const map = new Map()
      props.columns.forEach(col => {
        if (col?.name != null) map.set(col.name, col)
      })
      return map
    })

    /** 正規化後的多列 header 資料 */
    const normalizedHeaderRows = computed(() =>
      props.headerRows.map(row =>
        (Array.isArray(row) ? row : []).map(cell => ({
          label:   cell?.label   ?? '',
          colspan: Number(cell?.colspan) > 0 ? Number(cell.colspan) : 1,
          rowspan: Number(cell?.rowspan) > 0 ? Number(cell.rowspan) : 1,
          field:   typeof cell?.field === 'string' ? cell.field : '',
        }))
      )
    )

    /** 是否有勾選欄（single / multiple），用於 checkbox 欄位偏移計算 */
    const hasSelectionColumn = computed(() => {
      const sel = attrs.selection
      return sel === 'single' || sel === 'multiple'
    })

    // ─── 自訂 header 渲染 ─────────────────────────────────────────────

    /**
     * 判斷 header cell 是否可排序
     * 有 field 且對應 column 設定 sortable: true 才可排序
     */
    function isSortableCell(headerScope, cell) {
      if (!cell.field) return false
      const col = headerScope?.colsMap?.[cell.field] ?? columnMap.value.get(cell.field)
      return col?.sortable === true
    }

    /**
     * header cell 點擊事件：觸發 QTable 的 sort
     */
    function onHeaderCellClick(headerScope, cell) {
      if (!isSortableCell(headerScope, cell)) return
      if (typeof headerScope.sort === 'function') {
        headerScope.sort(cell.field)
      }
    }

    /**
     * 渲染自訂多列 header
     * 透過 QTable 的 #header slot 注入，回傳多個 <tr>
     */
    function renderCustomHeader(headerScope) {
      return normalizedHeaderRows.value.map((headerRow, rowIndex) =>
        h('tr', { key: `ct-header-${rowIndex}` },
          headerRow.map((cell, cellIndex) =>
            h('th', {
              key:     `ct-header-cell-${rowIndex}-${cellIndex}`,
              colspan: cell.colspan > 1 ? cell.colspan : undefined,
              rowspan: cell.rowspan > 1 ? cell.rowspan : undefined,
              scope:   'col',
              class:   {
                'ct-head-cell':           true,
                'ct-head-cell--sortable': isSortableCell(headerScope, cell),
              },
              onClick: () => onHeaderCellClick(headerScope, cell),
            }, [
              h('div', { class: 'ct-head-cell__inner' }, cell.label),
            ])
          )
        )
      )
    }

    // ─── Slots 轉發 ───────────────────────────────────────────────────

    /**
     * 過濾掉 CustomTable 自行接管的 slot，其餘全部轉發給 QTable
     */
    const forwardedSlotNames = computed(() => {
      const blocked = new Set()
      if (hasCustomHeader.value) blocked.add('header')
      return Object.keys(slots).filter(name => !blocked.has(name))
    })

    // ─── render ───────────────────────────────────────────────────────

    return () => {
      const qtableSlots = {}

      // 多列 header slot
      if (hasCustomHeader.value) {
        qtableSlots.header = headerScope => renderCustomHeader(headerScope)
      }

      // 轉發其他 slots（body、body-cell-*、bottom-row 等）
      forwardedSlotNames.value.forEach(name => {
        qtableSlots[name] = slotProps => slots[name]?.(slotProps ?? {})
      })

      return h(
        QTable,
        {
          ref:   tableRef,
          class: 'custom-table',
          ...qTableProps.value,
        },
        qtableSlots
      )
    }
  },
}
