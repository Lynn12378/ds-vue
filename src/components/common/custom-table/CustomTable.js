import {
  cloneVNode,
  computed,
  defineComponent,
  h,
  isVNode,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useSlots,
  watch,
} from "vue";
import { QCheckbox, QTable } from "quasar";

/**
 * normalizeSlotOutput 功能說明。
 * @param {any} content 參數 content。
 * @returns {any} 執行結果。
 */
function normalizeSlotOutput(content) {
  if (Array.isArray(content) === true) {
    return content.filter((item) => item !== null && item !== void 0);
  }

  if (content === null || content === void 0) {
    return [];
  }

  return [content];
}

export default defineComponent({
  name: "CustomTable",
  inheritAttrs: false,

  props: {
    rows: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    rowKey: {
      type: [String, Function],
      default: "id",
    },
    pagination: {
      type: Object,
      default: void 0,
    },
    selected: {
      type: Array,
      default: void 0,
    },
    selection: {
      type: String,
      default: "none",
    },
    visibleColumns: {
      type: Array,
      default: void 0,
    },
    rowsPerPageOptions: {
      type: Array,
      default: void 0,
    },
    binaryStateSort: {
      type: Boolean,
      default: void 0,
    },
    loading: {
      type: Boolean,
      default: void 0,
    },
    headerRows: {
      type: Array,
      default: () => [],
    },
    groupKeys: {
      type: Array,
      default: () => [],
    },
    stickyColumns: {
      type: Array,
      default: () => [],
    },
  },

  /**
   * 建立表格渲染所需的狀態、計算屬性與 slot 代理行為。
   * @param {object} props 元件屬性。
   * @returns {Function} render 函式。
   */
  setup(props) {
    const attrs = useAttrs();
    const slots = useSlots();
    const tableRef = ref(null);
    const stickyMeta = ref([]);
    let stickyRafId = null;

    const rows = computed(() => (Array.isArray(props.rows) ? props.rows : []));

    const hasCustomHeader = computed(
      () => Array.isArray(props.headerRows) && props.headerRows.length > 0
    );

    const useMergedBody = computed(
      () => Array.isArray(props.groupKeys) && props.groupKeys.length > 0
    );

    const qTableProps = computed(() => {
      const merged = {
        ...attrs,
        rows: props.rows,
        columns: props.columns,
        rowKey: props.rowKey,
        selection: props.selection,
      };

      if (props.pagination !== void 0) {
        merged.pagination = props.pagination;
      }

      if (props.selected !== void 0) {
        merged.selected = props.selected;
      }

      if (props.visibleColumns !== void 0) {
        merged.visibleColumns = props.visibleColumns;
      }

      if (props.rowsPerPageOptions !== void 0) {
        merged.rowsPerPageOptions = props.rowsPerPageOptions;
      }

      if (props.binaryStateSort !== void 0) {
        merged.binaryStateSort = props.binaryStateSort;
      }

      if (props.loading !== void 0) {
        merged.loading = props.loading;
      }

      if (merged.flat === void 0) {
        merged.flat = true;
      }

      if (merged.bordered === void 0) {
        merged.bordered = true;
      }

      if (merged.dense === void 0) {
        merged.dense = true;
      }

      return merged;
    });

    const columnMap = computed(() => {
      const map = new Map();

      props.columns.forEach((col) => {
        if (col?.name !== void 0) {
          map.set(col.name, col);
        }
      });

      return map;
    });

    const normalizedHeaderRows = computed(() =>
      props.headerRows.map((row) =>
        (Array.isArray(row) ? row : []).map((cell) => ({
          label: cell?.label ?? "",
          colspan: Number(cell?.colspan) > 0 ? Number(cell.colspan) : 1,
          rowspan: Number(cell?.rowspan) > 0 ? Number(cell.rowspan) : 1,
          field: typeof cell?.field === "string" ? cell.field : "",
        }))
      )
    );

    const stickyColumnNames = computed(() => {
      const names = [];

      props.columns.forEach((col) => {
        if (
          typeof col?.name === "string" &&
          props.stickyColumns.includes(col.name)
        ) {
          names.push(col.name);
        }
      });

      return names;
    });

    const stickyColumnNameSet = computed(() => new Set(stickyColumnNames.value));

    const stickyMetaMap = computed(() => {
      const map = new Map();

      stickyMeta.value.forEach((meta) => {
        map.set(meta.name, meta);
      });

      return map;
    });

    const forwardedSlotNames = computed(() => {
      const blocked = new Set();

      if (hasCustomHeader.value === true) {
        blocked.add("header");
      }

      if (useMergedBody.value === true) {
        blocked.add("body");
      }

      return Object.keys(slots).filter(
        (slotName) => blocked.has(slotName) === false
      );
    });

    /**
     * resolveRowKeySetting 功能說明。
     * @returns {any} 執行結果。
     */
    function resolveRowKeySetting() {
      return props.rowKey ?? attrs.rowKey ?? attrs["row-key"];
    }

    /**
     * getRowKeyValue 功能說明。
     * @param {any} row 參數 row。
     * @param {any} fallbackIndex 參數 fallbackIndex。
     * @returns {any} 執行結果。
     */
    function getRowKeyValue(row, fallbackIndex) {
      const rowKeySetting = resolveRowKeySetting();

      if (typeof rowKeySetting === "function") {
        return rowKeySetting(row);
      }

      if (typeof rowKeySetting === "string" && rowKeySetting !== "") {
        return row?.[rowKeySetting];
      }

      if (row?.id !== void 0) {
        return row.id;
      }

      return typeof fallbackIndex === "number" ? fallbackIndex : void 0;
    }

    const rowIndexByKeyMap = computed(() => {
      const map = new Map();

      rows.value.forEach((row, index) => {
        const rowKeyValue = getRowKeyValue(row, index);

        if (
          rowKeyValue !== void 0 &&
          rowKeyValue !== null &&
          map.has(String(rowKeyValue)) !== true
        ) {
          map.set(String(rowKeyValue), index);
        }
      });

      return map;
    });

    /**
     * normalizeValueForGroup 功能說明。
     * @param {any} value 參數 value。
     * @returns {any} 執行結果。
     */
    function normalizeValueForGroup(value) {
      if (value === null || value === void 0) {
        return "";
      }

      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      return String(value);
    }

    /**
     * resolveRawCellValue 功能說明。
     * @param {any} col 參數 col。
     * @param {any} row 參數 row。
     * @param {any} fallbackName 參數 fallbackName。
     * @returns {any} 執行結果。
     */
    function resolveRawCellValue(col, row, fallbackName = "") {
      if (typeof col?.field === "function") {
        return col.field(row);
      }

      if (typeof col?.field === "string") {
        return row?.[col.field];
      }

      if (typeof fallbackName === "string" && fallbackName !== "") {
        return row?.[fallbackName];
      }

      return row?.[col?.name];
    }

    /**
     * getDisplayCellValue 功能說明。
     * @param {any} col 參數 col。
     * @param {any} row 參數 row。
     * @returns {any} 執行結果。
     */
    function getDisplayCellValue(col, row) {
      const rawValue = resolveRawCellValue(col, row);

      if (typeof col?.format === "function") {
        return col.format(rawValue, row);
      }

      return rawValue;
    }

    /**
     * isSameGroup 功能說明。
     * @param {any} baseRow 參數 baseRow。
     * @param {any} nextRow 參數 nextRow。
     * @param {any} groupKeys 參數 groupKeys。
     * @returns {boolean} 執行結果。
     */
    function isSameGroup(baseRow, nextRow, groupKeys) {
      return groupKeys.every((key) => {
        const col = columnMap.value.get(key);
        const baseValue = resolveRawCellValue(col, baseRow, key);
        const nextValue = resolveRawCellValue(col, nextRow, key);

        return (
          normalizeValueForGroup(baseValue) === normalizeValueForGroup(nextValue)
        );
      });
    }

    const groupCellStateMap = computed(() => {
      if (useMergedBody.value !== true || rows.value.length === 0) {
        return {};
      }

      const map = {};
      const activeGroupKeys = props.groupKeys.filter(
        (key) => typeof key === "string" && columnMap.value.has(key)
      );

      if (activeGroupKeys.length === 0) {
        return map;
      }

      let start = 0;

      while (start < rows.value.length) {
        let end = start + 1;

        while (
          end < rows.value.length &&
          isSameGroup(rows.value[start], rows.value[end], activeGroupKeys)
        ) {
          end += 1;
        }

        const span = end - start;

        activeGroupKeys.forEach((key) => {
          const firstRowKey = getRowKeyValue(rows.value[start], start);

          map[`index:${start}::${key}`] = {
            skip: false,
            rowspan: span,
          };

          if (firstRowKey !== void 0 && firstRowKey !== null) {
            map[`key:${String(firstRowKey)}::${key}`] = {
              skip: false,
              rowspan: span,
            };
          }

          for (let index = start + 1; index < end; index += 1) {
            const rowKeyValue = getRowKeyValue(rows.value[index], index);

            map[`index:${index}::${key}`] = {
              skip: true,
              rowspan: 0,
            };

            if (rowKeyValue !== void 0 && rowKeyValue !== null) {
              map[`key:${String(rowKeyValue)}::${key}`] = {
                skip: true,
                rowspan: 0,
              };
            }
          }
        });

        start = end;
      }

      return map;
    });

    /**
     * toValidIndex 功能說明。
     * @param {any} value 參數 value。
     * @param {any} maxLength 參數 maxLength。
     * @returns {any} 執行結果。
     */
    function toValidIndex(value, maxLength = Number.POSITIVE_INFINITY) {
      const nextValue = Number(value);

      if (
        Number.isInteger(nextValue) !== true ||
        nextValue < 0 ||
        nextValue >= maxLength
      ) {
        return null;
      }

      return nextValue;
    }

    /**
     * getFirstRowIndex 功能說明。
     * @returns {any} 執行結果。
     */
    function getFirstRowIndex() {
      const pagination = qTableProps.value.pagination;

      if (pagination == null || typeof pagination !== "object") {
        return 0;
      }

      const page = Number(pagination.page);
      const rowsPerPage = Number(pagination.rowsPerPage);

      if (
        Number.isInteger(page) !== true ||
        page <= 1 ||
        Number.isInteger(rowsPerPage) !== true ||
        rowsPerPage <= 0
      ) {
        return 0;
      }

      return (page - 1) * rowsPerPage;
    }

    /**
     * resolveBodyRowIndex 功能說明。
     * @param {any} bodyScope 參數 bodyScope。
     * @returns {any} 執行結果。
     */
    function resolveBodyRowIndex(bodyScope) {
      const rowCount = rows.value.length;
      const row = bodyScope?.row;

      if (row !== void 0) {
        const rowKeyValue = getRowKeyValue(row);

        if (rowKeyValue !== void 0 && rowKeyValue !== null) {
          const mappedIndex = rowIndexByKeyMap.value.get(String(rowKeyValue));

          if (typeof mappedIndex === "number") {
            return mappedIndex;
          }
        }

        const referenceIndex = rows.value.findIndex((item) => item === row);

        if (referenceIndex >= 0) {
          return referenceIndex;
        }
      }

      const rowIndex = toValidIndex(bodyScope?.rowIndex, rowCount);

      if (rowIndex !== null) {
        return rowIndex;
      }

      const pageIndexValue = Number(bodyScope?.pageIndex);
      const globalPageIndex = toValidIndex(
        getFirstRowIndex() + pageIndexValue,
        rowCount
      );

      if (globalPageIndex !== null) {
        return globalPageIndex;
      }

      const pageIndex = toValidIndex(pageIndexValue, rowCount);

      if (pageIndex !== null) {
        return pageIndex;
      }

      return -1;
    }

    /**
     * resolveGroupCellState 功能說明。
     * @param {any} bodyScope 參數 bodyScope。
     * @param {any} colName 參數 colName。
     * @returns {any} 執行結果。
     */
    function resolveGroupCellState(bodyScope, colName) {
      const rowKeyValue = bodyScope?.key;

      if (rowKeyValue !== void 0 && rowKeyValue !== null) {
        const stateByKey =
          groupCellStateMap.value[`key:${String(rowKeyValue)}::${colName}`];

        if (stateByKey !== void 0) {
          return stateByKey;
        }
      }

      const rowIndex = resolveBodyRowIndex(bodyScope);

      if (rowIndex >= 0) {
        return groupCellStateMap.value[`index:${rowIndex}::${colName}`];
      }

      return void 0;
    }

    /**
     * shouldRenderBodyCell 功能說明。
     * @param {any} bodyScope 參數 bodyScope。
     * @param {any} colName 參數 colName。
     * @returns {boolean} 執行結果。
     */
    function shouldRenderBodyCell(bodyScope, colName) {
      const state = resolveGroupCellState(bodyScope, colName);
      return state?.skip !== true;
    }

    /**
     * getBodyCellRowspan 功能說明。
     * @param {any} bodyScope 參數 bodyScope。
     * @param {any} colName 參數 colName。
     * @returns {any} 執行結果。
     */
    function getBodyCellRowspan(bodyScope, colName) {
      const state = resolveGroupCellState(bodyScope, colName);
      return state?.rowspan && state.rowspan > 1 ? state.rowspan : null;
    }

    /**
     * isSortableHeaderCell 功能說明。
     * @param {any} headerScope 參數 headerScope。
     * @param {any} cell 參數 cell。
     * @returns {boolean} 執行結果。
     */
    function isSortableHeaderCell(headerScope, cell) {
      if (cell.field === "") {
        return false;
      }

      const col =
        headerScope?.colsMap?.[cell.field] ?? columnMap.value.get(cell.field);

      return col?.sortable === true;
    }

    /**
     * onHeaderCellClick 功能說明。
     * @param {any} headerScope 參數 headerScope。
     * @param {any} cell 參數 cell。
     * @returns {any} 執行結果。
     */
    function onHeaderCellClick(headerScope, cell) {
      if (isSortableHeaderCell(headerScope, cell) !== true) {
        return;
      }

      if (typeof headerScope.sort === "function") {
        headerScope.sort(cell.field);
      }
    }

    /**
     * isStickyColumn 功能說明。
     * @param {any} name 參數 name。
     * @returns {boolean} 執行結果。
     */
    function isStickyColumn(name) {
      return typeof name === "string" && stickyColumnNameSet.value.has(name);
    }

    /**
     * getStickyStyle 功能說明。
     * @param {any} name 參數 name。
     * @param {any} isHeader 參數 isHeader。
     * @returns {any} 執行結果。
     */
    function getStickyStyle(name, isHeader) {
      const meta = stickyMetaMap.value.get(name);

      if (meta === void 0) {
        return null;
      }

      return {
        position: "sticky",
        left: `${meta.left}px`,
        zIndex: isHeader === true ? 5 + meta.order : 2 + meta.order,
        background:
          isHeader === true
            ? "var(--custom-table-header-bg, #f5f5f5)"
            : "var(--custom-table-cell-bg, #ffffff)",
        boxShadow: "1px 0 0 rgba(0, 0, 0, 0.08)",
      };
    }

    /**
     * getHeaderCellClass 功能說明。
     * @param {any} cell 參數 cell。
     * @param {any} headerScope 參數 headerScope。
     * @returns {any} 執行結果。
     */
    function getHeaderCellClass(cell, headerScope) {
      return {
        "custom-table__head-cell": true,
        "custom-table__head-cell--sortable": isSortableHeaderCell(
          headerScope,
          cell
        ),
        "custom-table__sticky-cell": isStickyColumn(cell.field),
      };
    }

    /**
     * getHeaderCellStyle 功能說明。
     * @param {any} cell 參數 cell。
     * @param {any} headerScope 參數 headerScope。
     * @returns {any} 執行結果。
     */
    function getHeaderCellStyle(cell, headerScope) {
      const baseStyle = {
        background: "var(--custom-table-header-bg, #f5f5f5)",
        fontWeight: 600,
        cursor: isSortableHeaderCell(headerScope, cell) ? "pointer" : "",
      };

      if (isStickyColumn(cell.field) !== true) {
        return baseStyle;
      }

      return {
        ...baseStyle,
        ...getStickyStyle(cell.field, true),
      };
    }

    /**
     * getBodyCellClass 功能說明。
     * @param {any} col 參數 col。
     * @param {any} row 參數 row。
     * @returns {any} 執行結果。
     */
    function getBodyCellClass(col, row) {
      return [
        typeof col.__tdClass === "function" ? col.__tdClass(row) : null,
        isStickyColumn(col.name) ? "custom-table__sticky-cell" : null,
      ];
    }

    /**
     * getBodyCellStyle 功能說明。
     * @param {any} col 參數 col。
     * @param {any} row 參數 row。
     * @returns {any} 執行結果。
     */
    function getBodyCellStyle(col, row) {
      const tdStyle =
        typeof col.__tdStyle === "function" ? col.__tdStyle(row) : null;

      return [tdStyle, getStickyStyle(col.name, false)];
    }

    /**
     * getBodyCellScope 功能說明。
     * @param {any} bodyScope 參數 bodyScope。
     * @param {any} col 參數 col。
     * @returns {any} 執行結果。
     */
    function getBodyCellScope(bodyScope, col) {
      return {
        ...bodyScope,
        col,
        value: getDisplayCellValue(col, bodyScope.row),
        rowspan: getBodyCellRowspan(bodyScope, col.name),
        skip: shouldRenderBodyCell(bodyScope, col.name) === false,
        stickyStyle: getStickyStyle(col.name, false),
      };
    }

    /**
     * patchBodySlotCellNodes 功能說明。
     * @param {any} slotResult 參數 slotResult。
     * @param {any} bodyScope 參數 bodyScope。
     * @param {any} col 參數 col。
     * @param {any} cellScope 參數 cellScope。
     * @returns {any} 執行結果。
     */
    function patchBodySlotCellNodes(slotResult, bodyScope, col, cellScope) {
      const rowspan = cellScope?.rowspan ?? null;
      const defaultClass = getBodyCellClass(col, bodyScope.row);
      const defaultStyle = getBodyCellStyle(col, bodyScope.row);

      return normalizeSlotOutput(slotResult).map((node) => {
        if (isVNode(node) !== true) {
          return node;
        }

        const typeName =
          typeof node.type === "object" && node.type !== null
            ? String(node.type.name || node.type.__name || "")
            : "";
        const isNativeTd =
          typeof node.type === "string" && node.type.toLowerCase() === "td";
        const isQTd = typeName === "QTd";

        if (isNativeTd !== true && isQTd !== true) {
          return node;
        }

        const patchedProps = {
          class: [defaultClass, node.props?.class],
          style: [defaultStyle, node.props?.style],
        };

        if (
          rowspan !== null &&
          node.props?.rowspan === void 0 &&
          node.props?.rowSpan === void 0
        ) {
          patchedProps.rowspan = rowspan;
        }

        return cloneVNode(node, patchedProps, true);
      });
    }

    const hasSelectionColumn = computed(() => {
      const selection = qTableProps.value.selection;
      return selection === "single" || selection === "multiple";
    });

    /**
     * updateRowSelected 功能說明。
     * @param {any} bodyScope 參數 bodyScope。
     * @param {any} selected 參數 selected。
     * @param {any} evt 參數 evt。
     * @returns {any} 執行結果。
     */
    function updateRowSelected(bodyScope, selected, evt) {
      if (
        Object.prototype.hasOwnProperty.call(bodyScope, "selected") === false
      ) {
        return;
      }

      bodyScope.selected = selected;

      if (evt !== void 0) {
        evt.stopPropagation();
      }
    }

    /**
     * renderMergedBodyRow 功能說明。
     * @param {any} bodyScope 參數 bodyScope。
     * @returns {any} 執行結果。
     */
    function renderMergedBodyRow(bodyScope) {
      const rowChildren = [];

      if (hasSelectionColumn.value === true) {
        rowChildren.push(
          h("td", { class: "q-table--col-auto-width" }, [
            h(QCheckbox, {
              dense: true,
              modelValue: bodyScope.selected,
              "onUpdate:modelValue": (val, evt) =>
                updateRowSelected(bodyScope, val, evt),
            }),
          ])
        );
      }

      bodyScope.cols.forEach((col) => {
        if (shouldRenderBodyCell(bodyScope, col.name) !== true) {
          return;
        }

        const cellScope = getBodyCellScope(bodyScope, col);
        const namedSlot = slots[`body-cell-${col.name}`];
        const genericSlot = slots["body-cell"];

        if (typeof namedSlot === "function") {
          rowChildren.push(
            ...patchBodySlotCellNodes(namedSlot(cellScope), bodyScope, col, cellScope)
          );
          return;
        }

        if (typeof genericSlot === "function") {
          rowChildren.push(
            ...patchBodySlotCellNodes(genericSlot(cellScope), bodyScope, col, cellScope)
          );
          return;
        }

        rowChildren.push(
          h(
            "td",
            {
              class: getBodyCellClass(col, bodyScope.row),
              style: getBodyCellStyle(col, bodyScope.row),
              rowspan: getBodyCellRowspan(bodyScope, col.name),
            },
            getDisplayCellValue(col, bodyScope.row)
          )
        );
      });

      return h(
        "tr",
        {
          key: bodyScope.key,
          class: bodyScope.__trClass,
          style: bodyScope.__trStyle,
        },
        rowChildren
      );
    }

    /**
     * renderCustomHeaderRows 功能說明。
     * @param {any} headerScope 參數 headerScope。
     * @returns {any} 執行結果。
     */
    function renderCustomHeaderRows(headerScope) {
      return normalizedHeaderRows.value.map((headerRow, rowIndex) =>
        h(
          "tr",
          {
            key: `custom-header-${rowIndex}`,
          },
          headerRow.map((cell, cellIndex) =>
            h(
              "th",
              {
                key: `custom-header-cell-${rowIndex}-${cellIndex}`,
                colspan: cell.colspan,
                rowspan: cell.rowspan,
                scope: "col",
                class: getHeaderCellClass(cell, headerScope),
                style: getHeaderCellStyle(cell, headerScope),
                onClick: () => onHeaderCellClick(headerScope, cell),
              },
              [h("div", { class: "custom-table__head-cell-inner" }, cell.label)]
            )
          )
        )
      );
    }

    /**
     * getTableRoot 功能說明。
     * @returns {any} 執行結果。
     */
    function getTableRoot() {
      return tableRef.value?.$el ?? null;
    }

    /**
     * clearStickyFromDom 功能說明。
     * @param {any} root 參數 root。
     * @returns {any} 執行結果。
     */
    function clearStickyFromDom(root) {
      if (root == null) {
        return;
      }

      root.querySelectorAll('[data-custom-table-sticky="1"]').forEach((node) => {
        node.style.position = "";
        node.style.left = "";
        node.style.zIndex = "";
        node.style.background = "";
        node.style.boxShadow = "";
        node.removeAttribute("data-custom-table-sticky");
      });
    }

    /**
     * applyStickyToDomNodes 功能說明。
     * @param {any} nodes 參數 nodes。
     * @param {any} meta 參數 meta。
     * @param {any} isHeader 參數 isHeader。
     * @returns {any} 執行結果。
     */
    function applyStickyToDomNodes(nodes, meta, isHeader) {
      nodes.forEach((node) => {
        node.setAttribute("data-custom-table-sticky", "1");
        node.style.position = "sticky";
        node.style.left = `${meta.left}px`;
        node.style.zIndex = String(isHeader === true ? 5 + meta.order : 2 + meta.order);
        node.style.background =
          isHeader === true
            ? "var(--custom-table-header-bg, #f5f5f5)"
            : "var(--custom-table-cell-bg, #ffffff)";
        node.style.boxShadow = "1px 0 0 rgba(0, 0, 0, 0.08)";
      });
    }

    /**
     * syncStickyColumns 功能說明。
     * @returns {any} 執行結果。
     */
    function syncStickyColumns() {
      const root = getTableRoot();

      if (root == null) {
        return;
      }

      clearStickyFromDom(root);

      if (stickyColumnNames.value.length === 0) {
        stickyMeta.value = [];
        return;
      }

      const selectionOffset = hasSelectionColumn.value === true ? 1 : 0;
      const firstBodyRow = root.querySelector("tbody tr");
      const headerLeafRow = root.querySelector("thead tr:last-child");
      let left = 0;
      const nextMeta = [];

      props.columns.forEach((col, index) => {
        if (isStickyColumn(col?.name) !== true) {
          return;
        }

        const visualIndex = index + 1 + selectionOffset;

        const bodyCell =
          firstBodyRow?.querySelector(`td:nth-of-type(${visualIndex})`) ?? null;
        const headerCell =
          headerLeafRow?.querySelector(`th:nth-of-type(${visualIndex})`) ?? null;
        const width = bodyCell?.offsetWidth || headerCell?.offsetWidth || Number(col?.width) || 120;

        nextMeta.push({
          name: col.name,
          visualIndex,
          left,
          order: nextMeta.length,
        });

        left += width;
      });

      stickyMeta.value = nextMeta;

      if (useMergedBody.value !== true) {
        nextMeta.forEach((meta) => {
          const bodyNodes = root.querySelectorAll(
            `tbody tr td:nth-of-type(${meta.visualIndex})`
          );
          applyStickyToDomNodes(bodyNodes, meta, false);
        });
      }

      if (hasCustomHeader.value !== true) {
        nextMeta.forEach((meta) => {
          const headerNodes = root.querySelectorAll(
            `thead tr th:nth-of-type(${meta.visualIndex})`
          );
          applyStickyToDomNodes(headerNodes, meta, true);
        });
      }
    }

    /**
     * scheduleStickySync 功能說明。
     * @returns {any} 執行結果。
     */
    function scheduleStickySync() {
      if (stickyRafId !== null) {
        cancelAnimationFrame(stickyRafId);
        stickyRafId = null;
      }

      nextTick(() => {
        stickyRafId = requestAnimationFrame(() => {
          syncStickyColumns();
          stickyRafId = null;
        });
      });
    }

    watch(
      () => [
        rows.value,
        props.columns,
        props.stickyColumns,
        props.headerRows,
        props.groupKeys,
        qTableProps.value.selection,
      ],
      () => {
        scheduleStickySync();
      },
      { deep: true }
    );

    onMounted(() => {
      scheduleStickySync();
      window.addEventListener("resize", scheduleStickySync);
    });

    onBeforeUnmount(() => {
      if (stickyRafId !== null) {
        cancelAnimationFrame(stickyRafId);
        stickyRafId = null;
      }

      window.removeEventListener("resize", scheduleStickySync);
    });

    /**
     * getRenderSlots 功能說明。
     * @returns {any} 執行結果。
     */
    function getRenderSlots() {
      const renderSlots = {};

      if (hasCustomHeader.value === true) {
        renderSlots.header = (headerScope) => renderCustomHeaderRows(headerScope);
      }

      if (useMergedBody.value === true) {
        renderSlots.body = (bodyScope) => renderMergedBodyRow(bodyScope);
      }

      forwardedSlotNames.value.forEach((slotName) => {
        renderSlots[slotName] = (slotProps) =>
          slots[slotName]?.(slotProps || {});
      });

      return renderSlots;
    }

    return () =>
      h(
        QTable,
        {
          ref: tableRef,
          ...qTableProps.value,
          class: ["custom-table", attrs.class],
          style: attrs.style,
        },
        getRenderSlots()
      );
  },
});
