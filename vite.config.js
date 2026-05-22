import { defineConfig, loadEnv } from "vite";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin"; 
import vue from "@vitejs/plugin-vue";
import path from "path";

export default ({ mode }) => {
  const _env = loadEnv(mode, process.cwd());
  const basePath = _env.VITE_NODE_ENV === "development" ? "/" :  "DSWeb";// "/專案 URL/";
  //指定 tag 屬性套用 basePath 清單
  const customTagsList = { a: ["href"] }; 
  return defineConfig({
    plugins: [
      vue({ 
        template: { 
          transformAssetUrls: { 
            base: basePath, 
            includeAbsolute: !transformAssetUrls.includeAbsolute, 
            tags: { ...transformAssetUrls.tags, ...customTagsList }, 
          }, 
        }, 
      }), 
      quasar({ 
        sassVariables: "@/assets/sass/quasar-variables.sass", 
      }), 
    ],
    base: basePath,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};