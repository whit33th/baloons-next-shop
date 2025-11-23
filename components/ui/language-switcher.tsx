"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/routing";
import { removeLocaleFromPathname } from "@/i18n/utils";
import { persistLocalePreference } from "@/lib/localePreference";
import { cn } from "@/lib/utils";
import {
  AustriaFlag,
  GreatBritainFlag,
  RussiaFlag,
  UkraineFlag,
} from "./icons/flags";

// Language data matching the design pattern
const languages = [
  {
    code: "at",
    name: "Austria",
    region: "Austria",
    flag: AustriaFlag,
  },
  {
    code: "en",
    name: "English",
    region: "United Kingdom",
    flag: GreatBritainFlag,
  },
  {
    code: "ua",
    name: "Українська",
    region: "Україна",
    flag: UkraineFlag,
  },
  {
    code: "ru",
    name: "Русский",
    region: "Россия",
    flag: RussiaFlag,
  },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const _router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];
  const CurrentFlag = currentLanguage.flag;

  const switchLocale = (newLocale: string) => {
    startTransition(() => {
      // Save user preference in both cookie and localStorage
      void persistLocalePreference(newLocale);
      // Remove any locale prefix that might be present (for safety)
      const pathnameWithoutLocale = removeLocaleFromPathname(pathname);

      // Preserve search params
      const searchParamsString = searchParams.toString();
      const newUrl = `/${newLocale}${pathnameWithoutLocale}${searchParamsString ? `?${searchParamsString}` : ""}`;
      // Use window.location for full page reload to ensure NextIntlClientProvider context is preserved
      // This is necessary especially for admin pages with server components
      window.location.href = newUrl;
      // router.push(newUrl);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch language"
          disabled={isPending}
          className="text-deep group relative flex h-10 w-10 items-center justify-center rounded-full bg-transparent p-2 outline-black/5 backdrop-blur-xs transition-all hover:bg-black/10 hover:opacity-80 hover:outline"
        >
          <div className="relative h-full w-full">
            <CurrentFlag className="h-full w-full rounded-full" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="border-foreground/15 w-80 border p-0"
        align="end"
        forceMount
      >
        <div className="p-2">
          <div className="space-y-1">
            {languages.map((lang) => {
              const FlagComponent = lang.flag;
              const isSelected = locale === lang.code;
              return (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => switchLocale(lang.code)}
                  disabled={isPending}
                  className={cn(
                    "group cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
                    isSelected
                      ? "bg-[#F5F1ED]"
                      : "bg-transparent hover:bg-[#F5F1ED]",
                  )}
                >
                  <div className="flex w-full items-center gap-3">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        isSelected
                          ? "border-[#D4A574]/30 bg-linear-to-br from-[#D4A574]/10 to-[#E8C4A0]/10"
                          : "border-[#D4A574]/20 bg-linear-to-br from-[#D4A574]/10 to-[#E8C4A0]/10 group-hover:border-[#D4A574]/30",
                      )}
                    >
                      <FlagComponent className="size-5 rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isSelected
                            ? "text-deep group-hover:text-white"
                            : "text-deep group-hover:text-white",
                        )}
                      >
                        {lang.name}
                      </p>
                      <p
                        className={cn(
                          "text-xs transition-colors",
                          isSelected
                            ? "text-[#6B6662] group-hover:text-white"
                            : "text-[#6B6662] group-hover:text-white",
                        )}
                      >
                        {lang.region}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex shrink-0 items-center justify-center">
                        <svg
                          className="h-5 w-5 text-[#D4A574]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-label="Selected language"
                        >
                          <title>Selected</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
