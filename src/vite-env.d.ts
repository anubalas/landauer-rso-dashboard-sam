/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPLIANCE_API_URL: string;
  readonly VITE_COMPLIANCE_DYNAMODB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
