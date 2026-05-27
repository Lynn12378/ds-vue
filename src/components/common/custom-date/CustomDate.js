import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { QDate } from 'quasar'

// ─── 常數 ────────────────────────────────────────────────────────────────────

/** 民國 1 年對應西元 1912 年，西元年 = 民國年 + 1911 */
const ROC_YEAR_OFFSET = 1911

/**
 * QDate 繁體中文語系基礎設定
 * ROC 模式下年份文字另以 DOM patch 補正
 */
const rocLocaleBase = {
  days: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
  months: [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月',
  ],
  monthsShort: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
}

// ─── 內部工具函式 ────────────────────────────────────────────────────────────

/**
 * 民國日期字串（yyyMMdd 或 yyy/MM/dd 或 yyy-MM-dd）→ 西元日期字串（yyyy/MM/dd）
 * 若已為西元格式則直接回傳原值
 * @param {string} value - 輸入日期字串
 * @returns {string} 西元日期字串（yyyy/MM/dd）或原始值
 */
function rocToAD(value) {
  if (!value) return value

  // 嘗試 yyyMMdd（無分隔）
  const noSep = value.match(/^(\d{2,3})(\d{2})(\d{2})$/)
  if (noSep) {
    const adYear = parseInt(noSep[1], 10) + ROC_YEAR_OFFSET
    return `${adYear}/${noSep[2]}/${noSep[3]}`
  }

  // 嘗試 yyy/MM/dd 或 yyy-MM-dd
  const withSep = value.match(/^(\d{2,3})[\/\-](\d{2})[\/\-](\d{2})$/)
  if (withSep) {
    const adYear = parseInt(withSep[1], 10) + ROC_YEAR_OFFSET
    return `${adYear}/${withSep[2]}/${withSep[3]}`
  }

  // 已為西元格式，統一分隔符號
  return value.replace(/-/g, '/')
}

/**
 * 西元日期字串（yyyy-MM-dd 或 yyyy/MM/dd）→ 民國日期字串（yyyMMdd）
 * @param {string} value - 西元日期字串
 * @returns {string} 民國日期字串（yyyMMdd）
 */
function adToRoc(value) {
  if (!value) return value
  const m = value.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})/)
  if (!m) return value
  const rocYear = parseInt(m[1], 10) - ROC_YEAR_OFFSET
  return `${rocYear}${m[2]}${m[3]}`
}

/**
 * 將外部傳入的 v-model 值轉換為 QDate 可接受的格式（yyyy/MM/dd）
 * ROC 模式下將民國格式轉為西元，一般模式統一分隔符號
 * 支援 string / Array / { from, to } 結構
 * @param {string|Array|Object|null} value - 外部 model 值
 * @param {boolean} isROC - 是否為民國模式
 * @returns {string|Array|Object|null} QDate 接受的格式
 */
function convertInputValue(value, isROC) {
  if (value === null || value === undefined || value === '') return value

  if (Array.isArray(value)) {
    return value.map(entry => convertInputValue(entry, isROC))
  }

  if (typeof value === 'object') {
    if (value.from !== undefined && value.to !== undefined) {
      return {
        from: convertInputValue(value.from, isROC),
        to: convertInputValue(value.to, isROC),
      }
    }
    return value
  }

  if (typeof value !== 'string') return value

  return isROC ? rocToAD(value) : value.replace(/-/g, '/')
}

/**
 * 將 QDate 輸出的值（yyyy/MM/dd）轉回外部期望格式
 * ROC 模式下轉回民國格式（yyyMMdd），一般模式轉為 yyyy-MM-dd
 * 支援 string / Array / { from, to } 結構
 * @param {string|Array|Object|null} value - QDate 輸出值
 * @param {boolean} isROC - 是否為民國模式
 * @returns {string|Array|Object|null} 外部 model 格式
 */
function convertOutputValue(value, isROC) {
  if (value === null || value === undefined || value === '') return value

  if (Array.isArray(value)) {
    return value.map(entry => convertOutputValue(entry, isROC))
  }

  if (typeof value === 'object') {
    if (value.from !== undefined && value.to !== undefined) {
      return {
        from: convertOutputValue(value.from, isROC),
        to: convertOutputValue(value.to, isROC),
      }
    }
    return value
  }

  if (typeof value !== 'string') return value

  const ceDate = value.replace(/\//g, '-')
  return isROC ? adToRoc(ceDate) : ceDate
}

/**
 * 正規化 ROC 模式下 navigationMinYearMonth 的值
 * 接受民國年（如 '115/01'）或西元年（如 '2026/01'），確保不早於 1911/01
 * @param {string|undefined} value - 原始 navigationMinYearMonth
 * @returns {string} 正規化後的 yyyy/MM 格式字串
 */
function normalizeROCMinYearMonth(value) {
  const fallback = '1911/01'
  if (typeof value !== 'string') return fallback

  const parts = value.split('/')
  if (parts.length !== 2) return fallback

  const rawYear = parseInt(parts[0], 10)
  let month = parseInt(parts[1], 10)
  if (isNaN(rawYear) || isNaN(month)) return fallback

  month = Math.max(1, Math.min(12, month))

  // 三位數以下視為民國年
  let ceYear = rawYear <= 999 ? rawYear + ROC_YEAR_OFFSET : rawYear

  if (ceYear < ROC_YEAR_OFFSET) {
    ceYear = ROC_YEAR_OFFSET
    month = 1
  }

  return `${ceYear}/${String(month).padStart(2, '0')}`
}

// ─── 元件定義 ────────────────────────────────────────────────────────────────

/**
 * CustomDate — 以 Quasar QDate 為基底的日期選擇元件
 *
 * 功能：
 * - 支援民國（ROC）模式，透過 `datatype="ROC"` 啟用
 * - v-model 在 ROC 模式下接受/回傳民國日期字串（yyyMMdd）
 * - v-model 在西元模式下接受/回傳西元日期字串（yyyy-MM-dd）
 * - ROC 模式下年份顯示文字以 MutationObserver + DOM patch 補正
 * - 支援所有 QDate 原生 props / events（透過 v-bind="$attrs" 透傳）
 *
 * Props：
 * - `modelValue`（必填）：v-model 綁定值
 * - `datatype`（選填）：`'ROC'` 啟用民國模式，預設西元模式
 * - `locale`（選填）：覆蓋語系設定，結構同 QDate locale prop
 * - `mask`（選填）：日期格式 mask，預設 `'YYYY/MM/DD'`
 *
 * Emits：
 * - `update:modelValue(value, reason, details)`：日期選取後觸發，ROC 模式下 value 已轉回民國格式
 * - `rangeStart(payload)`、`rangeEnd(payload)`：範圍選取
 * - `navigation(payload)`：導覽年月變更；ROC 模式下 `payload.year` 已轉為民國年
 */
export default defineComponent({
  name: 'CustomDate',
  inheritAttrs: false,

  props: {
    modelValue: {
      required: true,
      validator: val =>
        typeof val === 'string' ||
        Array.isArray(val) ||
        Object(val) === val ||
        val === null,
    },
    datatype: {
      type: String,
      default: '',
      validator: val => val === '' || val === 'ROC',
    },
    locale: {
      type: Object,
      default: () => ({}),
    },
    mask: {
      type: String,
      default: 'YYYY/MM/DD',
    },
  },

  emits: ['update:modelValue', 'rangeStart', 'rangeEnd', 'navigation'],

  setup(props, { attrs, slots, emit }) {
    const isROC = computed(() => props.datatype === 'ROC')
    const dateRef = ref(null)
    let yearTextObserver = null

    // ─── DOM patch：將年份顯示文字由西元轉為民國 ───────────────────────

    /**
     * 安全替換節點文字，優先使用 textNode 以避免破壞子元素
     * @param {Node} node
     * @param {string} text
     */
    const setNodeText = (node, text) => {
      if (
        node.firstChild !== null &&
        node.childNodes.length === 1 &&
        node.firstChild.nodeType === 3
      ) {
        node.firstChild.nodeValue = text
      } else {
        node.textContent = text
      }
    }

    /**
     * 將字串中的西元年數字替換為民國年
     * @param {string} source
     * @returns {string}
     */
    const replaceCEYearText = source =>
      source.replace(/\b\d{4}\b/g, yearText => {
        const year = parseInt(yearText, 10)
        return !isNaN(year) && year >= ROC_YEAR_OFFSET
          ? String(year - ROC_YEAR_OFFSET)
          : yearText
      })

    /**
     * 補正 QDate 渲染後的年份文字為民國年
     * 目標節點：年份清單、導覽列、header（僅可見時）
     */
    const patchROCYearLabels = () => {
      if (!isROC.value) return

      const rootEl = dateRef.value?.$el
      if (rootEl == null) return

      rootEl
        .querySelectorAll('.q-date__years-item .q-btn__content, .q-date__navigation .q-btn__content')
        .forEach(node => {
          const text = node.textContent
          if (typeof text !== 'string') return
          const rocText = replaceCEYearText(text)
          if (text !== rocText) setNodeText(node, rocText)
        })

      const headerEl = rootEl.querySelector('.q-date__header')
      if (headerEl == null || headerEl.offsetParent === null) return

      headerEl
        .querySelectorAll('.q-date__header-subtitle, .q-date__header-title-label')
        .forEach(node => {
          const text = node.textContent
          if (typeof text !== 'string') return
          const rocText = replaceCEYearText(text)
          if (text !== rocText) setNodeText(node, rocText)
        })
    }

    /** 啟動 MutationObserver 監聽 QDate DOM 變動，維持民國年顯示 */
    const connectYearObserver = () => {
      if (!isROC.value) return

      const rootEl = dateRef.value?.$el
      if (rootEl == null) return

      if (yearTextObserver !== null) yearTextObserver.disconnect()

      yearTextObserver = new MutationObserver(() => {
        patchROCYearLabels()
      })

      yearTextObserver.observe(rootEl, {
        childList: true,
        subtree: true,
        characterData: true,
      })

      patchROCYearLabels()
    }

    /** 停止 MutationObserver */
    const disconnectYearObserver = () => {
      if (yearTextObserver !== null) {
        yearTextObserver.disconnect()
        yearTextObserver = null
      }
    }

    // ─── 計算屬性 ─────────────────────────────────────────────────────

    /**
     * 合併語系設定
     * ROC 模式強制設定 yearOrigin: 1911，讓 QDate yearInView 從 1911 起算
     */
    const mergedLocale = computed(() => ({
      ...rocLocaleBase,
      ...props.locale,
      yearOrigin:
        props.locale?.yearOrigin !== undefined
          ? props.locale.yearOrigin
          : isROC.value
          ? ROC_YEAR_OFFSET
          : 0,
    }))

    /**
     * 傳入 QDate 的 modelValue（民國 → 西元）
     */
    const innerModelValue = computed(() =>
      convertInputValue(props.modelValue, isROC.value)
    )

    /**
     * ROC 模式強制最小可導覽年月下限（1911/01）
     */
    const resolvedNavigationMinYearMonth = computed(() => {
      if (!isROC.value) return attrs.navigationMinYearMonth
      return normalizeROCMinYearMonth(attrs.navigationMinYearMonth)
    })

    // ─── 事件處理 ─────────────────────────────────────────────────────

    /**
     * QDate 日期選取後，將西元格式轉回外部格式後 emit
     */
    const onUpdateModelValue = (value, reason, details) => {
      const output = convertOutputValue(value, isROC.value)
      emit('update:modelValue', output, reason, details)
    }

    // ─── 生命週期與 watch ──────────────────────────────────────────────

    watch(
      () => isROC.value,
      val => {
        if (val) {
          nextTick(() => {
            connectYearObserver()
            patchROCYearLabels()
          })
        } else {
          disconnectYearObserver()
        }
      },
      { immediate: true }
    )

    watch(
      () => props.modelValue,
      () => {
        nextTick(() => {
          patchROCYearLabels()
        })
      }
    )

    onMounted(() => {
      nextTick(() => {
        connectYearObserver()
        patchROCYearLabels()
      })
    })

    onBeforeUnmount(() => {
      disconnectYearObserver()
    })

    // ─── render ───────────────────────────────────────────────────────

    return () =>
      h(
        QDate,
        {
          ref: dateRef,
          ...attrs,
          modelValue: innerModelValue.value,
          datatype: props.datatype,
          locale: mergedLocale.value,
          mask: props.mask,
          navigationMinYearMonth: resolvedNavigationMinYearMonth.value,
          'onUpdate:modelValue': onUpdateModelValue,
          onRangeStart: payload => emit('rangeStart', payload),
          onRangeEnd: payload => emit('rangeEnd', payload),
          onNavigation: payload => {
            if (isROC.value && payload?.year !== undefined) {
              emit('navigation', {
                ...payload,
                year: payload.year - ROC_YEAR_OFFSET,
              })
              return
            }
            emit('navigation', payload)
          },
        },
        slots
      )
  },
})
