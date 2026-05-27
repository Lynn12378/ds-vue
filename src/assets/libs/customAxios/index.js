import axios from "axios";

const customAxios = axios.create({
  baseURL: import.meta.env.VITE_API_HOST, // 從環境變數讀取 API 基礎 URL
  timeout: 5000, // 設定請求超時時間（可選）
  headers: {
    "Content-Type": "application/json", // 設定請求頭（可選）
  },
});

// 可以在這裡添加攔截器，例如請求攔截器或響應攔截器
customAxios.interceptors.request.use(
  (config) => {
    // 在發送請求之前可以修改 config，例如添加認證 token
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

customAxios.interceptors.response.use(
  (response) => {
    // 在接收響應後可以處理數據，例如統一處理錯誤
    return response;
  },
  (error) => {
    // 可以在這裡統一處理錯誤，例如顯示錯誤提示
    return Promise.reject(error);
  }
);

export default customAxios;