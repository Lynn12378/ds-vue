export function cloneRows(rows) {
  return Array.isArray(rows) ? [...rows] : [];
}

export function buildRowKeyGetter(rowKey) {
  if (typeof rowKey === 'function') {
    return rowKey;
  }
  return (row) => row?.[rowKey];
}

export function selectAllRows(rows, enabled) {
  return enabled ? cloneRows(rows) : [];
}

export function upsertSelectionByKey({ rows, selected, rowKey, targetValue, checked }) {
  const rowKeyGetter = buildRowKeyGetter(rowKey);
  const selectedMap = new Map((selected || []).map((row) => [rowKeyGetter(row), row]));

  rows.forEach((row) => {
    const key = rowKeyGetter(row);
    if (key === targetValue) {
      if (checked) {
        selectedMap.set(key, row);
      } else {
        selectedMap.delete(key);
      }
    }
  });

  return Array.from(selectedMap.values());
}

export function setCurrentPageSelection({ rows, selected, rowKey, pageRows, checked }) {
  const rowKeyGetter = buildRowKeyGetter(rowKey);
  const pageKeys = new Set((pageRows || []).map((row) => rowKeyGetter(row)));
  const selectedMap = new Map((selected || []).map((row) => [rowKeyGetter(row), row]));

  if (!checked) {
    pageKeys.forEach((key) => selectedMap.delete(key));
    return Array.from(selectedMap.values());
  }

  rows.forEach((row) => {
    const key = rowKeyGetter(row);
    if (pageKeys.has(key)) {
      selectedMap.set(key, row);
    }
  });

  return Array.from(selectedMap.values());
}

export function getPageRows(rows, pagination) {
  const list = Array.isArray(rows) ? rows : [];
  const page = Math.max(1, Number(pagination?.page || 1));
  const rowsPerPage = Number(pagination?.rowsPerPage || 0);

  if (!rowsPerPage || rowsPerPage < 1) {
    return list;
  }

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return list.slice(start, end);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeFieldValue(row, field) {
  if (typeof field === 'function') {
    return field(row);
  }
  return row?.[field];
}

export function buildExportRows({ columns, records }) {
  const exportColumns = (Array.isArray(columns) ? columns : []).filter((col) => col && col.name !== 'selection');
  const list = Array.isArray(records) ? records : [];

  const header = `<tr>${exportColumns.map((col) => `<th>${escapeHtml(col.label ?? col.name ?? '')}</th>`).join('')}</tr>`;

  const body = list.map((row) => {
    const cells = exportColumns.map((col) => {
      const raw = normalizeFieldValue(row, col.field ?? col.name);
      const formatted = typeof col.format === 'function' ? col.format(raw, row) : raw;
      return `<td>${escapeHtml(formatted ?? '')}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return { header, body };
}

export function exportRowsToXls({ fileName = 'table-export', sheetName = 'Sheet1', columns, records }) {
  const safeFileName = `${fileName}`.endsWith('.xls') ? `${fileName}` : `${fileName}.xls`;
  const { header, body } = buildExportRows({ columns, records });

  const html = `\n<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">\n<head><meta charset="UTF-8"></head>\n<body><table data-sheet-name="${escapeHtml(sheetName)}">${header}${body}</table></body>\n</html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function pickTemplate(records, template) {
  if (!Array.isArray(records)) {
    return [];
  }

  if (!template) {
    return records;
  }

  const keys = Array.isArray(template) ? template : [template];

  return records.map((row) => {
    const mapped = {};
    keys.forEach((key) => {
      mapped[key] = row?.[key];
    });
    return mapped;
  });
}

export function validateRecords({ rows, rowKey, rule, checkedOnly = false, selected = [] }) {
  if (typeof rule !== 'function') {
    return { errorCount: 0, errorRowKeys: new Set() };
  }

  const rowKeyGetter = buildRowKeyGetter(rowKey);
  const selectedSet = new Set(selected.map((row) => rowKeyGetter(row)));
  const targets = checkedOnly
    ? rows.filter((row) => selectedSet.has(rowKeyGetter(row)))
    : rows;

  const errorRowKeys = new Set();

  targets.forEach((row, index) => {
    const valid = !!rule(row, index);
    if (!valid) {
      errorRowKeys.add(rowKeyGetter(row));
    }
  });

  return {
    errorCount: errorRowKeys.size,
    errorRowKeys,
  };
}
