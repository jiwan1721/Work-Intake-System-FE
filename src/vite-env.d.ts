/// <reference types="vite/client" />

/** Typed so `import.meta.env.VITE_*` is a string, not `any`. */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
