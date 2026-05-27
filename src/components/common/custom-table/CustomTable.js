import { h, computed } from 'vue'
import { QTable } from 'quasar'

/**
 * CustomTable
 *
 * 以 QTable 為底層的薄封裝元件。
 *
 * 合併欄位（groupKey）不實作，避免影響排序正確性。
 * 固定欄位（fixedColumns）不在此實作，由頁面自行以 CSS sticky 處理。
 * 多列 header（headerColumn / split）不實作，造成版面跑版。
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
  },

  setup(props, { attrs, slots }) {

    // ─── QTable props 合併（透傳 attrs + 固定 columns + 套用預設樣式） ──

    const qTableProps = computed(() => {
      const merged = { ...attrs, columns: props.columns }

      if (merged.flat     === undefined) merged.flat     = true
      if (merged.bordered === undefined) merged.bordered = true
      if (merged.dense    === undefined) merged.dense    = true

      return merged
    })

    // ─── Slots 全部轉發給 QTable ──────────────────────────────────────

    const forwardedSlotNames = computed(() => Object.keys(slots))

    // ─── render ───────────────────────────────────────────────────────

    return () => {
      const qtableSlots = {}

      forwardedSlotNames.value.forEach(name => {
        qtableSlots[name] = slotProps => slots[name]?.(slotProps ?? {})
      })

      return h(
        QTable,
        {
          class: 'custom-table',
          ...qTableProps.value,
        },
        qtableSlots
      )
    }
  },
}