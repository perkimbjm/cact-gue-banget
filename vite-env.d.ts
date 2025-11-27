/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_TOKEN: string;
  // tambahkan variabel environment lainnya di sini jika diperlukan
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
