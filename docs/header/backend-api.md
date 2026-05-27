# header/backend-api.md — 後端 API 規格

## 背景

header.jsp 中以下資料來自 Java 後端，Vue 翻新後需由對應後端 API 提供：

| JSP 來源 | 說明 | Vue 翻新後對應 |
|---|---|---|
| `ConfigManager.getProperty("ebaf.JSP_CHAR_LENGTH")` | 中文字元位元組數 | 移至後端統一 config API 或 `src/boot` 初始化 |
| `session.getAttribute("$Data.$coreSys$UserObject")` | 使用者物件（姓名/員工編號） | 認證 API / Pinia `authStore.userId` |
| `new ZZ_Z0Z001().getFuncInfo(funcId)` 回傳的 `PD_CTRL` | 功能代碼是否啟用資安管控 | 見下方 funcInfo API |
| `new ZZ_Z0Z001().getFuncInfo(funcId)` 回傳的 `IS_WATERMARK` | 功能代碼是否啟用浮水印 | 見下方 funcInfo API |
| `requestTimeHandleUUID` | 回應時間追蹤 UUID | `customAxios` 攔截器自動處理 |
| eBAF 認證參數 | `eBAF_loginSystemInfo` 等 | Pinia `authStore` 統一管理 |

---

## funcInfo API 規格

`AppHeader.applyByFuncId(funcId)` 內部呼叫：

```
GET /api/header/funcInfo?funcId={FUNC_ID}
```

**Request**

| 欄位 | 型別 | 說明 |
|---|---|---|
| `funcId` | String | 功能代碼（如 `DSZ01000`） |

**Response**

```json
{
  "pdCtrl": "Y",
  "isWaterMark": "N",
  "userId": "王小明"
}
```

| 欄位 | 型別 | 說明 |
|---|---|---|
| `pdCtrl` | `'Y'` \| `'N'` | 是否啟用資安管控（對應 JSP `PD_CTRL` 欄位） |
| `isWaterMark` | `'Y'` \| `'N'` | 是否啟用浮水印（對應 JSP `IS_WATERMARK` 欄位） |
| `userId` | String | 使用者姓名或員工編號（若 `authStore` 已有則可省略） |

**後端實作建議**：將 `ZZ_Z0Z001().getFuncInfo(funcId)` 的結果包裝為此 API，並從 session 附加 `userId`。
