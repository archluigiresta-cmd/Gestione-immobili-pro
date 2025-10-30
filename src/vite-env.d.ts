// Fix: Removed the reference to "vite/client" to resolve a type definition error.
// The interfaces below provide the necessary types for the `import.meta.env` variables.

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
