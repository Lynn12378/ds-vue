# header.jsp 翻新計畫

## 業務功能清單

1. **字元計算模式** — 從後端 ConfigManager 取得 `ebaf.JSP_CHAR_LENGTH` 設定值，注入 `window.charCountsByte` 供頁面字元長度計算使用
2. **回應時間記錄** — 頁面 load 時呼叫 `utility.keepResponseTimeEndParameters(uuid)`，將請求時間參數附加至後續請求
3. **eBAF 登入參數保留** — 頁面 load 時呼叫 `utility.keep_eBAF_parameter(opt)`，將登入平台資訊（`eBAF_loginPlatformInfo`、`eBAF_loginSystemInfo` 等）附加至後續請求
4. **資安管控（PD_CTRL）** — 依功能代碼查詢後端（`ZZ_Z0Z001.getFuncInfo`），若 `PD_CTRL=Y` 則動態注入事件攔截：禁止列印、複製、剪下、全選、另存
5. **複製行為稽核** — 使用者複製時，擷取複製內容並呼叫後端 `/ZZM0_0105/ctrlMsavelog` 記錄稽核軌跡
6. **EUDC 難字字型載入** — 注入 `@font-face` 載入 EUDC 字型（含外網 CDN URL 判斷）
7. **浮水印（IS_WATERMARK）** — 依功能代碼查詢後端，若 `IS_WATERMARK=Y` 則建立 `WatermarkPlus` 實例，顯示使用者姓名 + 時間戳浮水印

---

## Store 資料型態

> 暫以 `ref()` / `reactive()` 實作，待 Store 架構確認後遷移

| 欄位 | 型態 | 來源 | 說明 |
|---|---|---|---|
| `funcId` | `string` | 路由名稱 / Bean Name 推導 | 當前頁面功能代碼 |
| `pdCtrl` | `boolean` | 後端 `ZZ_Z0Z001.getFuncInfo` → `PD_CTRL` | 是否啟用資安管控 |
| `isWatermark` | `boolean` | 後端 `ZZ_Z0Z001.getFuncInfo` → `IS_WATERMARK` | 是否啟用浮水印 |
| `watermarkText` | `string` | Session `UserObject.CATHAY_NO` / `empName` | 浮水印顯示文字（使用者姓名） |
| `watermarkDatetime` | `string` | 前端產生（`new Date()`） | 浮水印時間戳 |

---

## 翻新計畫

### 建議建立的檔案

#### `src/components/layout/CustomHeader.vue`
處理功能：**4、5、6、7**
- 暫以 `ref()` / `reactive()` 維護 `pdCtrl`、`isWatermark` 狀態
- `onMounted` + `watch(route)` 時查詢功能代碼並套用對應功能
- `useSecurityPolicy`、`useWatermark` composable 組合於此

#### `src/composables/useSecurityPolicy.js`
處理功能：**資安管控（功能 4）+ 複製行為稽核（功能 5）**
- 依傳入的 `pdCtrl` 狀態，動態綁定/解除事件攔截
- 複製時呼叫 `customAxios` 送出稽核記錄

#### `src/composables/useWatermark.js`
處理功能：**浮水印（功能 7）**
- 依傳入的 `isWatermark` 狀態，建立/銷毀 `WatermarkPlus` 實例

#### `src/assets/styles/fonts.css`
處理功能：**EUDC 難字字型載入（功能 6）**
- `@font-face` 移至全域樣式

### 待確認項目

| 功能 | 待確認內容 |
|---|---|
| 功能 1（`charCountsByte`） | 新專案是否仍有頁面依賴此值？若無則直接移除 |
| 功能 2（回應時間記錄） | 是否改由 `customAxios` 攔截器統一處理？ |
| 功能 3（eBAF 參數） | 是否改由 `customAxios` 攔截器統一處理？ |
