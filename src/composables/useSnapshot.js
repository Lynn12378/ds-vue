import { ref, toRaw } from "vue";

/**
 * 將資料正規化為可 clone 的純資料。
 * @param {any} value 欲正規化資料。
 * @param {WeakSet<object>} [seen] 已處理物件集合。
 * @returns {any} 可序列化資料。
 */
function normalizeCloneValue(value, seen = new WeakSet()) {
  const rawValue = value !== null && typeof value === "object" ? toRaw(value) : value;

  if (rawValue === null || rawValue === undefined) {
    return rawValue;
  }

  if (typeof rawValue === "function") {
    return undefined;
  }

  if (typeof rawValue !== "object") {
    return rawValue;
  }

  if (typeof window !== "undefined" && rawValue === window) {
    return undefined;
  }

  if (rawValue instanceof Date) {
    return new Date(rawValue.getTime());
  }

  if (seen.has(rawValue)) {
    return undefined;
  }
  seen.add(rawValue);

  if (Array.isArray(rawValue)) {
    return rawValue
      .map((item) => normalizeCloneValue(item, seen))
      .filter((item) => item !== undefined);
  }

  const normalizedObject = {};
  Object.keys(rawValue).forEach((key) => {
    const normalizedValue = normalizeCloneValue(rawValue[key], seen);
    if (normalizedValue !== undefined) {
      normalizedObject[key] = normalizedValue;
    }
  });

  return normalizedObject;
}

/**
 * 深拷貝資料，避免快照被外部引用修改。
 * @template T
 * @param {T} value 欲複製資料。
 * @returns {T} 深拷貝後資料。
 */
function cloneValue(value) {
  const normalizedValue = normalizeCloneValue(value) ?? null;

  if (typeof structuredClone === "function") {
    try {
      return structuredClone(normalizedValue);
    } catch (error) {
      // structuredClone 對 Proxy 或特殊物件失敗時，改走 JSON 深拷貝。
    }
  }

  try {
    return JSON.parse(JSON.stringify(normalizedValue));
  } catch (error) {
    return normalizedValue;
  }
}

/**
 * 提供 commit/rollback 快照能力。
 * @returns {{snapshot: import('vue').Ref<any>, commitSnapshot:(payload:any)=>any, rollbackSnapshot:()=>any}} 快照控制器。
 */
export function useSnapshot() {
  const snapshot = ref(null);

  /**
   * 儲存目前資料快照。
   * @param {any} payload 要保存的資料。
   * @returns {any} 儲存後快照內容。
   */
  function commitSnapshot(payload) {
    snapshot.value = cloneValue(payload ?? {});
    return snapshot.value;
  }

  /**
   * 還原最近一次快照。
   * @returns {any|null} 快照資料，若不存在則回傳 null。
   */
  function rollbackSnapshot() {
    if (snapshot.value === null) {
      return null;
    }
    return cloneValue(snapshot.value);
  }

  return {
    snapshot,
    commitSnapshot,
    rollbackSnapshot,
  };
}

export default useSnapshot;
