/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the deployed Distributor Rankings companion site, used
   *  to build a distributor's "Copy ranking link" button. Optional. */
  readonly VITE_RANKINGS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
