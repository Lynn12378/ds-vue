import { reactive } from 'vue'

let contentAreaSeed = 0

function toArray(value) {
  if (Array.isArray(value)) {
    return value
  }
  if (value == null || value === '') {
    return []
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return [value]
}

function normalizeLoadinConfig(item) {
  if (typeof item === 'string') {
    return { id: item, elem: item }
  }
  if (item && typeof item === 'object') {
    return {
      id: item.id || item.elem,
      elem: item.elem,
      title: item.title,
      component: item.component || null,
      props: item.props || {},
      position: item.position,
    }
  }
  return null
}

function normalizeContentCell(cell) {
  if (!cell || typeof cell !== 'object') {
    return null
  }

  return {
    header: cell.header || '',
    key: cell.key || '',
    type: cell.type || 'text',
    id: cell.id || cell.key || '',
    values: Array.isArray(cell.values) ? cell.values : [],
    attrs: cell.attrs || {},
    events: cell.events || {},
    colSpan: Number(cell.colSpan || 1),
    rowSpan: Number(cell.rowSpan || 1),
  }
}

function normalizeContents(contents) {
  return (Array.isArray(contents) ? contents : [])
    .map(normalizeContentCell)
    .filter(Boolean)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? null))
}

export function usePageUIAdapter() {
  const state = reactive({
    pageMeta: {
      pageNo: '',
      title: '',
      subTitle: '',
      noPageFrame: false,
    },
    fixedNum: 0,
    loadinBlocks: [],
    contentAreas: {},
    buttonAreas: {},
  })

  function createPage(pageNO, title, subTitleText, noPageFrame = false) {
    state.pageMeta.pageNo = pageNO || ''
    state.pageMeta.title = title || ''
    state.pageMeta.subTitle = subTitleText || ''
    state.pageMeta.noPageFrame = noPageFrame === true
    return state.pageMeta
  }

  function createPageWithAllBodySubElement(pageNO, title, subTitleText, fixedNum = 0, noPageFrame = false) {
    createPage(pageNO, title, subTitleText, noPageFrame)
    state.fixedNum = Number(fixedNum || 0)
    return state.pageMeta
  }

  function setSubTitle(subTitleText) {
    state.pageMeta.subTitle = subTitleText || ''
  }

  function loadin(loadinConfigs, fixedNum = 0) {
    const list = toArray(loadinConfigs)
      .map(normalizeLoadinConfig)
      .filter(Boolean)

    state.loadinBlocks = list
    state.fixedNum = Number(fixedNum || 0)

    return list
  }

  function fixedContent(fixedNum = 0) {
    state.fixedNum = Number(fixedNum || 0)
    return state.fixedNum
  }

  function resolveContentId(contentOrId) {
    if (typeof contentOrId === 'string') {
      return contentOrId
    }
    if (contentOrId && typeof contentOrId === 'object') {
      return contentOrId.id || contentOrId.contentId || contentOrId.elem || null
    }
    return null
  }

  function createContent(config, loadinValues = {}, showType = 1) {
    if (!config || typeof config !== 'object') {
      return null
    }

    const contentId = config.id || `contentArea${contentAreaSeed++}`
    const normalized = {
      id: contentId,
      elem: config.elem || '',
      className: config.className || '',
      dataColumns: Number(config.dataColumns || 2),
      noHeader: config.noHeader === true,
      noContent: config.noContent === true,
      headerInTop: config.headerInTop === true,
      contents: normalizeContents(config.contents),
      displayType: Number(showType),
      values: {},
      committedValues: {},
    }

    state.contentAreas[contentId] = normalized

    if (loadinValues && typeof loadinValues === 'object') {
      setContentValues(contentId, loadinValues, true, true)
    }

    return normalized
  }

  function getArea(contentOrId) {
    const id = resolveContentId(contentOrId)
    if (!id) {
      return null
    }
    return state.contentAreas[id] || null
  }

  function setContentsDisplay(contentOrId, displayType) {
    const area = getArea(contentOrId)
    if (!area) {
      return
    }
    area.displayType = Number(displayType)
  }

  function setContentDisplay(contentOrId, displayType) {
    setContentsDisplay(contentOrId, displayType)
  }

  function getContentValue(contentOrId, key, isForDisplay = false) {
    const area = getArea(contentOrId)
    if (!area) {
      return {}
    }

    const source = isForDisplay ? area.committedValues : area.values
    if (!key) {
      return { ...source }
    }

    return { [key]: source[key] ?? '' }
  }

  function setContentValue(contentOrId, value, isAutoCommit = true, clearValueWhenNotInValues = true) {
    const area = getArea(contentOrId)
    if (!area || !value || typeof value !== 'object') {
      return
    }

    Object.entries(value).forEach(([key, v]) => {
      if (v == null && !clearValueWhenNotInValues) {
        return
      }
      area.values[key] = v == null ? '' : v
    })

    if (isAutoCommit !== false) {
      commitContentValue(contentOrId)
    }
  }

  function commitContentValue(contentOrId) {
    const area = getArea(contentOrId)
    if (!area) {
      return
    }
    area.committedValues = clone(area.values) || {}
  }

  function rollbackContentValue(contentOrId) {
    const area = getArea(contentOrId)
    if (!area) {
      return
    }
    area.values = clone(area.committedValues) || {}
  }

  function getContentValues(contentOrId, isAutoCommit = true) {
    const area = getArea(contentOrId)
    if (!area) {
      return {}
    }
    if (isAutoCommit !== false) {
      commitContentValue(contentOrId)
    }
    return { ...area.committedValues }
  }

  function setContentValues(contentOrId, values, isAutoCommit = true, clearValueWhenNotInValues = true) {
    if (!values || typeof values !== 'object') {
      return
    }
    setContentValue(contentOrId, values, isAutoCommit, clearValueWhenNotInValues)
  }

  function commitContentValues(contentOrId) {
    commitContentValue(contentOrId)
  }

  function rollbackContentValues(contentOrId) {
    rollbackContentValue(contentOrId)
  }

  function createButtonArea(contentOrId, buttonConfig = {}) {
    const areaId = resolveContentId(contentOrId) || `buttonArea_${Object.keys(state.buttonAreas).length + 1}`
    const buttons = buttonConfig.buttons || {}

    state.buttonAreas[areaId] = {
      id: areaId,
      buttonOnRight: buttonConfig.buttonOnRight === true,
      changeForOneButton: buttonConfig.changeForOneButton === true,
      items: Object.entries(buttons).map(([key, cfg]) => ({
        key,
        id: cfg.id || key,
        label: cfg.header || key,
        disabled: false,
        attrs: cfg.attrs || {},
        events: cfg.events || {},
      })),
    }

    return state.buttonAreas[areaId]
  }

  function setButtonsEnable(buttonAreaId, enableArray, skipCheck) {
    const area = state.buttonAreas[buttonAreaId]
    if (!area) {
      return
    }

    const enableMap = new Set(toArray(enableArray))
    const skipMap = new Set(toArray(skipCheck))

    area.items = area.items.map((button) => {
      if (skipMap.has(button.id)) {
        return button
      }
      return {
        ...button,
        disabled: !enableMap.has(button.id),
      }
    })
  }

  function resize() {
    // Quasar layout is reactive; keep API for compatibility.
  }

  return {
    state,
    createPage,
    createPageWithAllBodySubElement,
    setSubTitle,
    loadin,
    fixedContent,
    createContent,
    setContentDisplay,
    setContentsDisplay,
    getContentValue,
    setContentValue,
    commitContentValue,
    rollbackContentValue,
    getContentValues,
    setContentValues,
    commitContentValues,
    rollbackContentValues,
    createButtonArea,
    setButtonsEnable,
    resize,
  }
}
