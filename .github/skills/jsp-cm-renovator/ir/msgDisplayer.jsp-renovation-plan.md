# msgDisplayer.jsp 翻新計畫

## 業務功能清單

1. **後端訊息序列化** — 從 `request` 取得 `ReturnMessage`，將訊息陣列序列化為前端 `msgs[]` JS 變數，每筆訊息包含：
   - `msgs[i][0]` — `displayMsgDescs`（訊息說明）
   - `msgs[i][1]` — `msgid`（錯誤編號）
   - `msgs[i][2]` — `sysid`（程式 ID）
   - `msgs[i][3]` — `type`（訊息類型）
   - `msgs[i][4]` — `url`
   - `msgs[i][5]` — `returnCode`（回傳碼）
   - `msgs[i][6]` — `displayException`（異常原因）

2. **底部訊息欄操作** — `msgDisplayer.getBottomFrame()` 透過 frame 架構取得底部訊息欄，`clearBottomMsg()` 清除底部訊息

3. **訊息顯示（alertMessages）** — 遍歷 `msgs[]`，依 `returnCode` 決定顯示方式：
   - `returnCode = 0`：不顯示
   - `returnCode = 99`：靜默模式，不彈窗
   - 有 `displayException`：顯示異常原因 + 程式 ID
   - 其他：顯示訊息說明 + 錯誤編號

4. **底部訊息欄推送（displayMessage）** — 將第一筆訊息的 `returnCode` + `returnMessage` 推送至底部 frame 的 `showNotifyMsg`；若底部 frame 有 `txHasRollbackPage` flag 則跳過

5. **按鈕點擊自動清除訊息** — `document.onclick` 攔截 `button` / `submit` 點擊，自動呼叫 `clearBottomMsg()`

6. **`getMsgBoard()`** — 相容舊頁面，提供取得底部訊息欄 DOM 的方法

---

## Store 資料型態

> 暫以 `ref()` / `reactive()` 實作，待 Store 架構確認後遷移

| 欄位 | 型態 | 來源 | 說明 |
|---|---|---|---|
| `msgs` | `Array<Object>` | 後端 `ReturnMessage` → `customAxios` 攔截器解析 | 訊息陣列 |
| `notifyMessage` | `Object \| null` | `msgs[0]`（第一筆） | 底部訊息欄顯示內容（`returnCode` + `returnMessage`） |

---

## 翻新計畫

### 建議建立的檔案

#### `src/components/layout/CustomMsgDisplayer.vue`
處理功能：**2、3、4、5、6**
- 接收 `customAxios` 攔截器解析後的 `msgs[]`
- 實作 `alertMessages` 顯示邏輯（含 `returnCode = 99` 靜默模式）
- `notifyMessage` computed ref，供 `BaseLayout` 綁定底部訊息欄
- `document.onclick` 改為 Vue 事件機制，請求前自動清除

#### `customAxios` 攔截器（既有檔案擴充）
處理功能：**1**
- Response 攔截器解析後端 `ReturnMessage`，統一轉換為前端 `msgs[]` 格式
- 請求前自動呼叫 `clearMessages()`

### 待確認項目

| 功能 | 待確認內容 |
|---|---|
| 功能 4（底部訊息欄） | `showNotifyMsg` / `notifyMessage` 的 UI 位置由 `BaseLayout` 負責渲染，樣式待確認 |
| 功能 4（`txHasRollbackPage`） | rollback 頁面機制是否在新架構中仍需保留？ |
| 功能 6（`getMsgBoard`） | 相容舊頁面，新架構下是否仍有頁面主動呼叫？若無則直接移除 |
