import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { QDialog, QCard, QCardSection, QCardActions, QBtn, QToolbar, QToolbarTitle, QSpace } from 'quasar'

/**
 * CustomPopup — 以 Quasar QDialog 為基底的彈窗元件
 *
 * ## 功能對應
 * | popupWin.js                       | CustomPopup                          |
 * |-----------------------------------|--------------------------------------|
 * | `popup(config)`                   | `v-model` + 設定 props               |
 * | `fullPopup(config)`               | `:maximized="true"`                  |
 * | `config.title`                    | `title` prop                         |
 * | `config.closeBtn`                 | `close-btn` prop（預設 true）         |
 * | `config.onClose`                  | `@hide` event                        |
 * | `config.closeConfirm.msg`         | `close-confirm` prop                 |
 * | `config.closeConfirm.assignConfirmType` | `close-confirm-type` prop      |
 * | `popupWin.close()`                | `v-model` 設為 false 或 `dialogRef.hide()` |
 * | `popupWin.back(args...)` / `window.popupWinBack(payload)` | `@back` event |
 * | `config.cb` / `config.onBack`     | `@back` event handler                |
 *
 * ## 子頁面回呼機制（對應 `contentWindow.popupWinBack`）
 * 翻新後子頁面若仍需以 `window.popupWinBack` 回呼，CustomPopup 在 mounted 時
 * 自動將 `window.popupWinBack` 與 `window.popupWinclose` 注入至 window，
 * 關閉後自動清除。子頁面直接呼叫這兩個方法即可觸發父頁面的 `@back` / `@hide`。
 *
 * ## 使用範例
 * ```vue
 * <CustomPopup
 *   v-model="showPopup"
 *   title="查詢視窗"
 *   :close-confirm="'確認關閉？'"
 *   @back="onPopupBack"
 *   @hide="onPopupClose"
 * >
 *   <MyChildComponent />
 * </CustomPopup>
 * ```
 *
 * ## Props
 * | Prop              | 型別    | 預設值 | 說明                                      |
 * |-------------------|---------|--------|-------------------------------------------|
 * | modelValue        | Boolean | —      | v-model，控制顯示/隱藏                     |
 * | title             | String  | ''     | 標題列文字                                |
 * | closeBtn          | Boolean | true   | 是否顯示右上角關閉按鈕                     |
 * | closeConfirm      | String  | ''     | 關閉前的 confirm 訊息，空字串代表不需確認   |
 * | closeConfirmType  | Boolean | true   | true=按「確定」才關閉，false=按「取消」才關閉 |
 * | maximized         | Boolean | false  | 是否全螢幕（對應 fullPopup）               |
 * | persistent        | Boolean | false  | 是否禁止點擊 backdrop 關閉                 |
 *
 * ## Emits
 * | Event | Payload | 說明                                         |
 * |-------|---------|----------------------------------------------|
 * | update:modelValue | Boolean | QDialog 開關狀態                   |
 * | back  | any     | 子頁面呼叫 `window.popupWinBack(payload)` 後觸發 |
 * | hide  | —       | 彈窗完全關閉後觸發（對應 `config.onClose`）    |
 * | show  | —       | 彈窗完全開啟後觸發                             |
 */
export default defineComponent({
  name: 'CustomPopup',

  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    closeBtn: {
      type: Boolean,
      default: true,
    },
    closeConfirm: {
      type: String,
      default: '',
    },
    closeConfirmType: {
      type: Boolean,
      default: true,
    },
    maximized: {
      type: Boolean,
      default: false,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'back', 'hide', 'show'],

  setup(props, { slots, emit, attrs }) {
    const dialogRef = ref(null)

    // ─── 關閉確認邏輯 ────────────────────────────────────────────────

    /**
     * 執行關閉前確認，依 closeConfirmType 決定按哪個按鈕才真正關閉
     * @returns {boolean} true = 允許關閉
     */
    const confirmClose = () => {
      if (!props.closeConfirm) return true
      const confirmed = window.confirm(props.closeConfirm)
      // closeConfirmType: true → 按「確定」(true) 才關閉
      //                   false → 按「取消」(false) 才關閉
      return confirmed === props.closeConfirmType
    }

    /**
     * 關閉彈窗（對應 `popupWin.close()` / `contentWindow.popupWinclose()`）
     */
    const doClose = () => {
      if (!confirmClose()) return
      emit('update:modelValue', false)
    }

    // ─── 子頁面回呼注入（對應 iframe setCloseFunc 機制） ─────────────

    /**
     * 將 `window.popupWinBack` 與 `window.popupWinclose` 注入至全域
     * 子頁面呼叫 `window.popupWinBack(payload)` 後觸發父頁面的 `@back` event
     * 子頁面呼叫 `window.popupWinclose()` 後直接關閉彈窗
     */
    const injectWindowMethods = () => {
      window.popupWinBack = (payload) => {
        emit('back', payload)
        emit('update:modelValue', false)
      }
      window.popupWinclose = () => {
        emit('update:modelValue', false)
      }
      window.isPopupWin = true
    }

    /**
     * 清除全域注入的方法，避免彈窗關閉後殘留
     */
    const clearWindowMethods = () => {
      if (typeof window.popupWinBack === 'function') {
        window.popupWinBack = undefined
      }
      if (typeof window.popupWinclose === 'function') {
        window.popupWinclose = undefined
      }
      window.isPopupWin = false
    }

    // ─── 生命週期與 watch ─────────────────────────────────────────────

    watch(
      () => props.modelValue,
      (val) => {
        if (val) {
          injectWindowMethods()
        } else {
          clearWindowMethods()
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      clearWindowMethods()
    })

    // ─── QDialog 事件處理 ─────────────────────────────────────────────

    const onBeforeHide = () => {
      // QDialog beforeHide — 若有 closeConfirm 在此驗證
      // 注意：QDialog 無法在 beforeHide 中中斷關閉，
      // 需在關閉按鈕的 click handler 中處理
    }

    const onHide = () => {
      emit('hide')
    }

    const onShow = () => {
      emit('show')
    }

    // ─── render ───────────────────────────────────────────────────────

    return () => {
      const hasTitle = !!props.title || props.closeBtn

      return h(
        QDialog,
        {
          ref: dialogRef,
          modelValue: props.modelValue,
          maximized: props.maximized,
          persistent: props.persistent,
          'onUpdate:modelValue': (val) => emit('update:modelValue', val),
          onHide: onHide,
          onShow: onShow,
          ...attrs,
        },
        {
          default: () =>
            h(
              QCard,
              {
                style: props.maximized ? {} : { minWidth: '350px' },
              },
              {
                default: () => [
                  // ─── 標題列 ────────────────────────────────────────
                  hasTitle
                    ? h(
                        QToolbar,
                        { class: 'bg-primary text-white' },
                        {
                          default: () => [
                            h(QToolbarTitle, null, {
                              default: () => props.title,
                            }),
                            h(QSpace),
                            props.closeBtn
                              ? h(QBtn, {
                                  flat: true,
                                  round: true,
                                  dense: true,
                                  icon: 'close',
                                  'aria-label': '關閉',
                                  onClick: doClose,
                                })
                              : null,
                          ],
                        }
                      )
                    : null,

                  // ─── 主要內容（slot） ──────────────────────────────
                  h(
                    QCardSection,
                    { class: 'q-pt-none' },
                    {
                      default: () =>
                        slots.default ? slots.default() : null,
                    }
                  ),

                  // ─── 額外動作列（actions slot） ────────────────────
                  slots.actions
                    ? h(
                        QCardActions,
                        { align: 'right' },
                        { default: () => slots.actions() }
                      )
                    : null,
                ],
              }
            ),
        }
      )
    }
  },
})
