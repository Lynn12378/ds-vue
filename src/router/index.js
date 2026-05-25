import { createRouter, createWebHistory } from "vue-router";
import routerMap from "@/router/router.js";

const routes = routerMap.routes;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
