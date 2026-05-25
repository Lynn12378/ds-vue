---
description: Vue 規範
---

# Vue Conventions

## 專案目錄

```
src/
├── assets/
│   ├── composables/                  # 共用 composable
│   ├── font/                         # 字型資源
│   ├── libs/                         # 外部函式庫（如 customAxios）
│   │    ├── axios/instance.js        # HTTP 請求封裝
│   │    └── CathayValidateRules.js   # 表單驗證規則
│   ├── sass/                         # SCSS 樣式
│   └── utils/                        # 工具函式（如：格式化）
├── components/                       # 可重用元件
├── router/                           # 路由設定
├── store/                            # Pinia 狀態管理
├── views/                            # 頁面元件
│   ├── {Module}/                     # 模組資料夾（例：A3）
│   │    └── {FileName}.vue           # Vue SFC（例：DSA30900.vue）
│   └── ...
└── App.vue
```

## Core Principles

- **REQUIRED**：
  - 動態樣式統一使用 `:style="{}"`
  - `<style>` 必須加上 `scoped`，避免全域樣式污染
  - 路由元件統一使用 lazy loading
  - 依賴響應式來源的衍生值，使用 `computed` 包裝以確保響應式更新
  - 優先使用 name 跳轉頁面（`router.push{ name: FileName }`）
  - Vue SFC 結構順序 `<script setup>` → `<template>` → `<style scoped>`

- **FORBIDDEN**：
  - 禁止使用 `v-html`（XSS 風險）
  - 禁止動態 `:href` 來自使用者輸入（javascript: 注入風險）
  - 禁止 `import *`（Tree-shaking 失效，影響 bundle 體積）必須具名引用
  - 禁止 inline `style="..."`（防止 CSS 注入）
  - 非必要不使用響應式資料（如：`ref`、`reactive`），避免不必要的性能開銷