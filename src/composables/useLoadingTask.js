/**
 * 提供 loading 包裹執行器，統一處理開始/結束 loading。
 * @param {{setLoading:(value:boolean)=>void}} store 具備 setLoading 的 store。
 * @returns {{runWithLoading:(task:()=>Promise<any>)=>Promise<any>}} loading 執行器。
 */
export function useLoadingTask(store) {
  /**
   * 以 loading 狀態包裹非同步任務。
   * @template T
   * @param {() => Promise<T>} task 非同步任務。
   * @returns {Promise<T>} 任務結果。
   */
  async function runWithLoading(task) {
    store.setLoading(true);
    try {
      return await task();
    } finally {
      store.setLoading(false);
    }
  }

  return {
    runWithLoading,
  };
}

export default useLoadingTask;
