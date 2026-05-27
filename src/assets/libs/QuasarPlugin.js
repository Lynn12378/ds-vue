import { Quasar, Loading, Notify, Dialog } from "quasar";
import quasarLang from "quasar/lang/zh-TW.js";
import "@/assets/sass/quasar/src/css/index.sass";
import "@/assets/sass/quasar/src/css/flex-addon.sass";
import "@quasar/extras/material-icons/material-icons.css";

export default {
  /**
   * 安裝 Quasar 與共用插件設定。
   * @param {import('vue').App} app Vue 應用實例。
   * @param {object} [options={}] 安裝選項。
   * @returns {void} 無回傳值。
   */
  install(app, options = {}) {
    app.use(Quasar, {
      plugins: { Loading, Notify, Dialog },
      lang: quasarLang,
    });
  },
};