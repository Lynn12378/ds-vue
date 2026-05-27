# calendar.js 翻新指引

## Core Principles

**REQUIRED**：

- `autoCreateDate('containerId')` 直接移除

- 識別 JSP 同組 id 的 `<input id="FIELD_NAME" ... />` + `<img src="...calendar.gif">` + `getCalendar('FIELD_NAME')` 日期選擇器，翻新為：

```vue
<q-input v-model="dateROC" outlined dense clearable>
    <template #append>
    <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy>
        <CustomDate
            v-model="dateROC"
            minimal
            :today-btn="true"
        />
        </q-popup-proxy>
    </q-icon>
    </template>
</q-input>
```

- **IF** `<input>` 使用 `datatype="ROCDate"` **THEN** `CustomDate` 綁定 `:datatype="'ROC'"`
- **ELSE** 預設使用西元日期，無需額外設定 `datatype`
