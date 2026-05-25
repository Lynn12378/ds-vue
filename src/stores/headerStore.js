/**
 * headerStore.js
 * 承接 CM/header.jsp 注入的登入者與頁面安全設定
 *
 * 原始 header.jsp 業務規格：
 *
 * [userName]
 *   來源：UserObject.CATHAY_NO，若為空則 fallback 為 empName
 *   由登入 API 回應後透過 init() 寫入
 *
 * [isWaterMark / watermarkText]
 *   是否顯示浮水印由功能權限表 ZZ_Z0Z001.IS_WATERMARK 決定
 *   浮水印文字 = CATHAY_NO（或 empName）+ 登入時間戳（yyyy-MM-dd HH:mm:ss）
 *   原始使用 WatermarkPlus 套件，rotate=17deg, opacity=0.07
 *
 * [isPrintControlled]
 *   功能權限表 ZZ_Z0Z001.PD_CTRL='Y' 時啟用
 *   封鎖 beforeprint、Ctrl+P、Ctrl+A、Ctrl+S、Ctrl+X；Ctrl+C 允許但記錄複製軌跡
 *   軌跡記錄呼叫 /ZZWeb/servlet/HttpDispatcher/ZZM0_0105/ctrlMsavelog
 *
 * [charCountsByte]
 *   中文字節計算基準，從後端 /api/config 或登入回應取得
 *   影響前端欄位最大長度驗證（1/2/3 bytes per 中文字）
 *
 * [loginPlatformInfo / loginSystemInfo]
 *   平台識別參數，透過 utility.keep_eBAF_parameter 隨每次表單送出附加至後端
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHeaderStore = defineStore('header', () => {
  const userName = ref('')
  const isWaterMark = ref(false)
  const watermarkText = ref('')
  const isPrintControlled = ref(false)
  const charCountsByte = ref(2)
  const loginPlatformInfo = ref('')
  const loginSystemInfo = ref('')

  return { userName, isWaterMark, watermarkText, isPrintControlled, charCountsByte, loginPlatformInfo, loginSystemInfo }
})
