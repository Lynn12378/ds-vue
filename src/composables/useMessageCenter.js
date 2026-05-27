/**
 * 提供訊息中心操作封裝。
 * @param {{pushMessage:(event:any)=>void, clearMessages:()=>void}} store 訊息相關 store。
 * @returns {{pushMessage:(event:any)=>void, clearMessages:()=>void}} 訊息操作方法。
 */
export function useMessageCenter(store) {
  /**
   * 推入一筆訊息。
   * @param {Record<string, any>} event 訊息事件。
   * @returns {void} 執行結果。
   */
  function pushMessage(event) {
    store.pushMessage(event);
  }

  /**
   * 清空訊息佇列。
   * @returns {void} 執行結果。
   */
  function clearMessages() {
    store.clearMessages();
  }

  return {
    pushMessage,
    clearMessages,
  };
}

export default useMessageCenter;
