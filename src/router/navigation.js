/**
 * navigation.js
 * 側邊欄導覽樹節點定義
 *
 * 欄位說明：
 *   key      唯一識別碼，對應 router name
 *   label    顯示文字
 *   icon     Material Icons 名稱
 *   to       Vue Router location（葉節點才設定）
 *   children 子節點陣列（有此欄位表示為分類節點）
 */

/** @type {import('quasar').QTreeNode[]} */
export const navNodes = [
  // {
  //   key: 'home',
  //   label: '首頁',
  //   icon: 'home',
  //   to: { name: 'home' },
  // },
]
