declare module "virtual:pwa-register" {
  export function registerSW(options?: {
    immediate?: boolean;
    onOfflineReady?: () => void;
    onRegisterError?: (error: unknown) => void;
  }): (reloadPage?: boolean) => Promise<void>;
}