# calendar.js 翻新指引

## Core Principles

**REQUIRED**：
- `autoCreateDate('containerId')` 直接移除
- 識別 JSP 同組 id 的 `<input id="FIELD_NAME" ... />` + `<img src="...calendar.gif">` + `getCalendar('FIELD_NAME')` 日期選擇器，翻新為標準 Pattern（見下方）
- **IF** `<input>` 使用 `datatype="ROCDate"` **THEN** `CustomDate` 綁定 `:datatype="'ROC'"`
- **ELSE** 預設使用西元日期，無需額外設定 `datatype`

**FORBIDDEN**：
- 禁止直接使用 `QDate`，一律透過 `CustomDate` 封裝

---

## Rules

### 標準翻新 Pattern

**封裝元件**：`CustomDate`（`@/components/common/custom-date/CustomDate.js`）

原始結構（`input` + `calendar.gif` + `getCalendar`）→ 翻新結構（`q-input` + `q-icon` + `q-popup-proxy` + `CustomDate`）：

```vue
<q-input v-model="FIELD_NAME" outlined dense clearable>
  <template #append>
    <q-icon name="event" class="cursor-pointer">
      <q-popup-proxy>
        <CustomDate
          v-model="FIELD_NAME"
          minimal
          :today-btn="true"
        />
      </q-popup-proxy>
    </q-icon>
  </template>
</q-input>
```

---

### ROC 民國模式

**IF** `<input>` 有 `datatype="ROCDate"` **THEN** 加上 `:datatype="'ROC'"` ：

```vue
<CustomDate
  v-model="FIELD_NAME"
  :datatype="'ROC'"
  minimal
  :today-btn="true"
/>
```

- `v-model` ROC 模式下接受/回傳民國日期字串（`yyyMMdd`）
- `v-model` 西元模式下接受/回傳西元日期字串（`yyyy-MM-dd`）

---

### 不可翻新項目

- 越南語系（`datatype="VNDate"`）直接移除，無對應翻新實作
