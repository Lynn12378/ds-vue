import * as XLSX from 'xlsx'

/**
 * resolveCellValue 功能說明。
 * @param {any} column 參數 column。
 * @param {any} row 參數 row。
 * @returns {any} 執行結果。
 */
function resolveCellValue(column, row) {
  if (typeof column?.field === 'function') {
    return column.field(row)
  }

  if (typeof column?.field === 'string' && column.field !== '') {
    return row?.[column.field]
  }

  if (typeof column?.name === 'string' && column.name !== '') {
    return row?.[column.name]
  }

  return ''
}

/**
 * exportToXls 功能說明。
 * @param {any} fileName 參數 fileName。
 * @param {any} columns 參數 columns。
 * @param {any} rows 參數 rows。
 * @returns {any} 執行結果。
 */
export function exportToXls(fileName, columns, rows) {
  const safeColumns = Array.isArray(columns) ? columns : []
  const safeRows = Array.isArray(rows) ? rows : []

  const headerRow = safeColumns.map(column => column?.label ?? column?.name ?? '')

  const dataRows = safeRows.map(row =>
    safeColumns.map(column => {
      const value = resolveCellValue(column, row)
      return value === null || value === void 0 ? '' : value
    })
  )

  const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows])
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  const outputName = `${String(fileName || 'export')}.xlsx`
  XLSX.writeFile(workbook, outputName)
}

export default exportToXls
