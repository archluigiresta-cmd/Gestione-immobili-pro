/**
 * The original `/// <reference types="vite/client" />` was causing a type resolution error.
 * This is often due to a misconfigured tsconfig.json or missing dependencies.
 * As a workaround, we are removing the problematic reference and manually defining
 * the `process.env` properties used in the application. These are injected by Vite's `define` config.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    GOOGLE_CLIENT_ID: string;
  }
}