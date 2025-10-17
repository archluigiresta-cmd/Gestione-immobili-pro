// FIX: Removed reference to "vite/client" as it cannot be resolved in the current TypeScript configuration.
// The project does not appear to use Vite-specific client-side APIs that require these types.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    GOOGLE_CLIENT_ID: string;
  }
}
