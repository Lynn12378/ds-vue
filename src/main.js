import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from 'pinia'
import quasar from "@/assets/libs/QuasarPlugin.js"; 
import "@/assets/libs/YupZhTw.js";
import "@/assets/libs/CathayValidateRules.js";
import { initLegacyFacade } from '@/service/legacyFacadeService.js'
import { setCustomAxiosRuntimeHooks } from '@/assets/libs/customAxios/index.js'
import { useUiStateStore } from '@/stores/uiStateStore.js'

import "@/assets/sass/main.sass";
import "@/assets/sass/hanlink.sass";
import "@/assets/sass/legacy.sass";

const app = createApp(App);

const pinia = createPinia()
app.use(pinia)

const uiStateStore = useUiStateStore(pinia)

/**
 * 取得目前 Pinia 中保存的 eBAF 上下文資料。
 * @returns {{platformInfo:string,systemInfo:string,userFlag:string,dispatcher:string}} eBAF 上下文。
 */
function getAuthContextFromStore() {
	return uiStateStore.authContext
}

/**
 * 將 customAxios 產生的訊息事件推入 UI 訊息佇列。
 * @param {Record<string, any>} event 訊息事件。
 * @returns {void} 執行結果。
 */
function handleAxiosMessage(event) {
	uiStateStore.pushMessage(event)
}

setCustomAxiosRuntimeHooks({
	getAuthContext: getAuthContextFromStore,
	onMessage: handleAxiosMessage,
})

app.use(quasar); 
app.use(router);

initLegacyFacade()

app.mount("#app");