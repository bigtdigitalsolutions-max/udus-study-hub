export async function registerPublishedAppWorker() {
  if (typeof window === "undefined") return;

  const host = window.location.hostname;
  const isLovablePreview =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");

  let insideFrame = false;
  try {
    insideFrame = window.self !== window.top;
  } catch {
    insideFrame = true;
  }

  const shouldRegister =
    import.meta.env.PROD &&
    !insideFrame &&
    !isLovablePreview &&
    !new URLSearchParams(window.location.search).has("sw=off");

  if (!shouldRegister) {
    const registrations = await navigator.serviceWorker?.getRegistrations();
    await Promise.all(
      (registrations ?? [])
        .filter((registration) => registration.scope.endsWith("/"))
        .map((registration) => registration.unregister()),
    );
    return;
  }

  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}