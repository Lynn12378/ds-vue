import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from 'pinia'
import quasar from "@/assets/libs/QuasarPlugin.js"; 
import "@/assets/libs/yup/yup-methods.js";
import "@/assets/libs/yup/yup-locale.js";

import "@/assets/sass/main.sass";
import "@/assets/sass/hanlink.sass";
import "@/assets/sass/legacy.sass";

const app = createApp(App);

const pinia = createPinia()
app.use(pinia)
app.use(quasar); 
app.use(router);

app.mount("#app");