import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'
import { QDate } from 'quasar'
import useCommon from '@/assets/utils/legacy/legacyCommon.js'

// 民國 1 年對應西元 1912 年，因此西元年 = 民國年 + 1911。
const ROC_YEAR_OFFSET = 1911

// QDate 顯示用的基礎語系文字；ROC 模式下年份會再做額外轉換。
const rocLocaleBase = {
  days: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
  months: [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月'
  ],
  monthsShort: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
}

// 將外部傳入的 v-model 轉成 QDate 可處理的格式。
// ROC 模式下先轉西元，讓內部日期運算維持一致。
/**
 * convertInputValue 功能說明。
 * @param {any} value 參數 value。
 * @param {any} isROC 參數 isROC。
 * @param {any} tranCEorROCDate 參數 tranCEorROCDate。
 * @returns {any} 執行結果。
 */
function convertInputValue(value, isROC, tranCEorROCDate) {
  if (value === null || value === void 0 || value === '') {
    return value
  }

  if (Array.isArray(value) === true) {
    return value.map(entry => convertInputValue(entry, isROC, tranCEorROCDate))
  }

  if (typeof value === 'object') {
    if (value.from !== void 0 && value.to !== void 0) {
      return {
        from: convertInputValue(value.from, isROC, tranCEorROCDate),
        to: convertInputValue(value.to, isROC, tranCEorROCDate)
      }
    }

    return value
  }

  if (typeof value !== 'string') {
    return value
  }

  if (isROC === true) {
    const ceDate = tranCEorROCDate(value, 'ceDate')
    return ceDate === value ? value : ceDate.replace(/-/g, '/')
  }

  return value.replace(/-/g, '/')
}

// 將 QDate 輸出轉回外部使用的格式。
// ROC 模式下會把西元日期轉回民國日期字串。
/**
 * convertOutputValue 功能說明。
 * @param {any} value 參數 value。
 * @param {any} isROC 參數 isROC。
 * @param {any} tranCEorROCDate 參數 tranCEorROCDate。
 * @returns {any} 執行結果。
 */
function convertOutputValue(value, isROC, tranCEorROCDate) {
  if (value === null || value === void 0 || value === '') {
    return value
  }

  if (Array.isArray(value) === true) {
    return value.map(entry => convertOutputValue(entry, isROC, tranCEorROCDate))
  }

  if (typeof value === 'object') {
    if (value.from !== void 0 && value.to !== void 0) {
      return {
        from: convertOutputValue(value.from, isROC, tranCEorROCDate),
        to: convertOutputValue(value.to, isROC, tranCEorROCDate)
      }
    }

    return value
  }

  if (typeof value !== 'string') {
    return value
  }

  const ceDate = value.replace(/\//g, '-')
  return isROC === true ? tranCEorROCDate(ceDate, 'rocDate') : ceDate
}

// 計算 ROC 模式的最小可導覽年月，並保證不會小於西元 1911 年。
/**
 * normalizeROCMinYearMonth 功能說明。
 * @param {any} value 參數 value。
 * @returns {any} 執行結果。
 */
function normalizeROCMinYearMonth(value) {
  const fallback = '1911/01'

  if (typeof value !== 'string') {
    return fallback
  }

  const parts = value.split('/')
  if (parts.length !== 2) {
    return fallback
  }

  const rawYear = parseInt(parts[0], 10)
  let month = parseInt(parts[1], 10)

  if (isNaN(rawYear) === true || isNaN(month) === true) {
    return fallback
  }

  month = Math.max(1, Math.min(12, month))

  let ceYear = rawYear
  // 若呼叫端傳入民國年（例如 115/01），先轉為西元年。
  if (Math.abs(rawYear) <= 999) {
    ceYear += ROC_YEAR_OFFSET
  }

  if (ceYear < ROC_YEAR_OFFSET) {
    ceYear = ROC_YEAR_OFFSET
    month = 1
  }

  return `${ceYear}/${String(month).padStart(2, '0')}`
}

export default defineComponent({
  name: 'CustomDate',
  inheritAttrs: false,

  props: {
    modelValue: {
      required: true,
      validator: val =>
        typeof val === 'string' ||
        Array.isArray(val) === true ||
        Object(val) === val ||
        val === null
    },

    datatype: {
      type: String,
      default: '',
      validator: val => val === '' || val === 'ROC'
    },

    locale: {
      type: Object,
      default: () => ({})
    },

    mask: {
      type: String,
      default: 'YYYY/MM/DD'
    }
  },

  emits: ['update:modelValue', 'rangeStart', 'rangeEnd', 'navigation'],

  /**
   * 建立日期元件的狀態、格式轉換與事件橋接。
   * @param {object} props 元件屬性。
   * @param {{attrs: object, slots: object, emit: Function}} context setup 上下文。
   * @returns {Function} render 函式。
   */
  setup(props, { attrs, slots, emit }) {
    const { tranCEorROCDate } = useCommon()
    const isROC = computed(() => props.datatype === 'ROC')
    const dateRef = ref(null)
    let yearTextObserver = null

    // 在不動到元件狀態的前提下，安全地替換畫面文字。
    const setNodeText = (node, text) => {
      if (node.firstChild !== null && node.childNodes.length === 1 && node.firstChild.nodeType === 3) {
        node.firstChild.nodeValue = text
      } else {
        node.textContent = text
      }
    }

    // 將字串中的西元年替換為民國年（例如 2026 -> 115）。
    const replaceCEYearText = source =>
      source.replace(/\b\d{4}\b/g, yearText => {
        const year = parseInt(yearText, 10)
        return isNaN(year) === false && year >= ROC_YEAR_OFFSET
          ? String(year - ROC_YEAR_OFFSET)
          : yearText
      })

    // QDate 渲染後，修正年份清單與導覽列的年份文字；header 只在可見時才處理。
    const patchROCYearLabels = () => {
      if (isROC.value !== true) {
        return
      }

      const rootEl = dateRef.value?.$el
      if (rootEl == null) {
        return
      }

      rootEl
        .querySelectorAll(
          '.q-date__years-item .q-btn__content, .q-date__navigation .q-btn__content'
        )
        .forEach(node => {
          const text = node.textContent
          if (typeof text !== 'string') {
            return
          }

          const rocYearText = replaceCEYearText(text)
          if (text !== rocYearText) {
            setNodeText(node, rocYearText)
          }
        })

      const headerEl = rootEl.querySelector('.q-date__header')
      if (headerEl == null || headerEl.offsetParent === null) {
        return
      }

      headerEl
        .querySelectorAll('.q-date__header-subtitle, .q-date__header-title-label')
        .forEach(node => {
          const text = node.textContent
          if (typeof text !== 'string') {
            return
          }

          const rocYearText = replaceCEYearText(text)
          if (text !== rocYearText) {
            setNodeText(node, rocYearText)
          }
        })
    }

    // 監聽 QDate DOM 變動，讓切換視圖後的年份文字仍維持民國顯示。
    const connectYearObserver = () => {
      if (isROC.value !== true) {
        return
      }

      const rootEl = dateRef.value?.$el
      if (rootEl == null) {
        return
      }

      if (yearTextObserver !== null) {
        yearTextObserver.disconnect()
      }

      yearTextObserver = new MutationObserver(() => {
        patchROCYearLabels()
      })

      yearTextObserver.observe(rootEl, {
        childList: true,
        subtree: true,
        characterData: true
      })

      patchROCYearLabels()
    }

    // 元件銷毀或模式切換時解除監聽，避免記憶體洩漏。
    const disconnectYearObserver = () => {
      if (yearTextObserver !== null) {
        yearTextObserver.disconnect()
        yearTextObserver = null
      }
    }

    // 合併外部 locale，並在 ROC 模式套用 yearOrigin。
    const mergedLocale = computed(() => ({
      ...rocLocaleBase,
      ...props.locale,
      yearOrigin:
        props.locale?.yearOrigin !== void 0
          ? props.locale.yearOrigin
          : isROC.value === true
            ? 1911
            : 0
    }))

    const innerModelValue = computed(() =>
      convertInputValue(props.modelValue, isROC.value, tranCEorROCDate)
    )

    // ROC 模式強制最小年份下限；一般模式維持原行為。
    const resolvedNavigationMinYearMonth = computed(() => {
      if (isROC.value !== true) {
        return attrs.navigationMinYearMonth
      }

      return normalizeROCMinYearMonth(attrs.navigationMinYearMonth)
    })

    const onUpdateModelValue = (value, reason, details) => {
      const output = convertOutputValue(value, isROC.value, tranCEorROCDate)
      emit('update:modelValue', output, reason, details)
    }

    // datatype 切換時，重新配置年份文字修正流程。
    watch(
      () => isROC.value,
      val => {
        if (val === true) {
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

    // model 更新導致 QDate 重繪後，再次套用年份文字修正。
    watch(
      () => props.modelValue,
      () => {
        nextTick(() => {
          patchROCYearLabels()
        })
      }
    )

    // 首次渲染後初始化監聽。
    onMounted(() => {
      nextTick(() => {
        connectYearObserver()
        patchROCYearLabels()
      })
    })

    // 元件卸載時清理監聽。
    onBeforeUnmount(() => {
      disconnectYearObserver()
    })

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
            if (isROC.value === true && payload?.year !== void 0) {
              emit('navigation', {
                ...payload,
                year: payload.year - 1911
              })
              return
            }

            emit('navigation', payload)
          }
        },
        slots
      )
  }
})
