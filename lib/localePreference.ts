type CookieStoreSetOptions = {
  name: string;
  value: string;
  expires?: number | Date;
  path?: string;
};

type WindowWithCookieStore = Window & {
  cookieStore?: {
    set: (options: CookieStoreSetOptions) => Promise<void>;
  };
};

const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function persistLocalePreference(locale: string) {
  if (typeof window === "undefined") {
    return;
  }

  const cookieStoreApi = (window as WindowWithCookieStore).cookieStore;
  const expires = Date.now() + ONE_YEAR_SECONDS * 1000;

  if (cookieStoreApi && typeof cookieStoreApi.set === "function") {
    try {
      await cookieStoreApi.set({
        name: LOCALE_COOKIE,
        value: locale,
        path: "/",
        expires,
      });
      return;
    } catch (error) {
      console.warn("Failed to persist locale via Cookie Store API", error);
    }
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API unavailable, fallback to document.cookie
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}`;
}

