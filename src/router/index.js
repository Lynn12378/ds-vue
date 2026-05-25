import { createRouter, createWebHistory } from "vue-router";
import routerMap from "@/router/router.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routerMap.routes,
});

export default router;
