# jsp_CM 資源翻新指引 v2

## 目的
本目錄提供 `jsp-renovator` 在翻新單一 JSP 時的**明確規則**：
- 當識別到 `jsp_CM` 既有資源 pattern，應套用哪種翻新動作。
- 哪些行為可 1:1 對應、哪些需包裝保留、哪些需直接移除。
- 若無法直接映射時，應採用的 fallback 方式。

## 非目標（黑盒子邊界）
以下內容視作黑盒，不在本指引描述內部業務轉換：
- 各頁自訂查詢條件、後端業務規則、專屬資料欄位判斷。
- 非 `jsp_CM` 共用資源的頁面私有函式。
- 既有業務流程中的 domain decision（例如核保規則、審核判斷）。

翻新時只需：
- 保留原輸入/輸出契約。
- 將共用資源呼叫改寫為 v2 對應實作。
- 不推論黑盒邏輯。

## 動作分類（必須擇一）
| 分類 | 何時使用 | 強制行為 |
| --- | --- | --- |
| `ONE_TO_ONE_REPLACE` | 已有明確新 API/Composable/Component 可替換 | 直接改寫呼叫，保留 I/O 契約 |
| `WRAP_AND_KEEP_BLACKBOX` | 無法直接 1:1，但可由 facade/adapter 包裝 | 包裝後維持呼叫端資料契約 |
| `DIRECT_REMOVE` | 功能已由全局機制處理或已無必要 | 直接刪除 legacy 呼叫，不保留 no-op 殘骸 |
| `FALLBACK_STUB` | 無明確對應，且移除會影響流程 | 建立最小 stub/facade，標註 TODO 與風險 |

## 套用順序（避免歧義）
1. 先依 `resource-path-index.md` 找到資源文件。
2. 在資源文件內以「識別 pattern」逐條比對，採 **first match wins**。
3. 若命中 `DIRECT_REMOVE`，直接移除，不再進行次級映射。
4. 若所有 pattern 都未命中，使用 `FALLBACK_STUB`。

## 入口文件
- `resource-path-index.md`：`jsp_CM` 資源路徑索引與對應目標模組。
- `quick-reference.md`：翻新前後速查表。
- `resources/*.md`：各資源詳細規則。
- `resources/TableUI/*.md`：`TableUI.js` 子章節（排序、分頁、群組、多層表頭、自動輸入）。

## v2 規則補充
- 若功能已於全局配置中處理（例如頁框、訊息顯示、資安限制、loading），翻新動作為 `DIRECT_REMOVE`。
- 新實作需優先使用現有模組，不重建第二套工具。
- 新增 fallback 時必須清楚標明：
  - 觸發 pattern
  - 保留契約
  - 待補強項目
