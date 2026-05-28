import { useRouter } from 'vue-router'

/**
 * useWindowOpen
 *
 * 封裝 popupWin.windowOpen 的翻新對應。
 * 以 router.resolve 取得目標頁面 URL，再以 window.open 開啟具名新 tab。
 *
 * 原始行為：
 *   popupWin.windowOpen('/DSA3_0500/prompt', {
 *     parameters: { APPLY_ID: id },
 *     windowName: id
 *   })
 *
 * 翻新後：
 *   const { windowOpen } = useWindowOpen()
 *   windowOpen({ name: 'DSA30500' }, { APPLY_ID: id }, id)
 */
export function useWindowOpen() {
  const router = useRouter()

  /**
   * 開啟具名新 tab
   *
   * @param {import('vue-router').RouteLocationRaw} route   - 目標頁面 route（對應原始 url）
   * @param {Record<string, string>}                query   - query string 參數（對應原始 opts.parameters）
   * @param {string}                                [windowName] - 具名 tab（對應原始 opts.windowName）；
   *                                                               相同名稱不重複開窗
   */
  function windowOpen(route, query = {}, windowName = '_blank') {
    const resolved = router.resolve({ ...route, query })
    window.open(resolved.href, windowName)
  }

  return { windowOpen }
}
