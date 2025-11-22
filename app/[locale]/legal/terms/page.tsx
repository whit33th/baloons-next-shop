import { getTranslations, setRequestLocale } from "next-intl/server";
import { STORE_INFO } from "@/constants/config";
import { Link } from "@/i18n/routing";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "legal.terms" });

  const clauses = [
    {
      title: t("clause1.title"),
      body: t("clause1.body", { companyName: STORE_INFO.legal.companyName }),
    },
    {
      title: t("clause2.title"),
      body: t("clause2.body"),
    },
    {
      title: t("clause3.title"),
      body: t("clause3.body"),
    },
    {
      title: t("clause4.title"),
      body: t("clause4.body"),
    },
    {
      title: t("clause5.title"),
      body: t("clause5.body"),
    },
    {
      title: t("clause6.title"),
      body: t("clause6.body"),
    },
    {
      title: t("clause7.title"),
      body: t("clause7.body"),
    },
    {
      title: t("clause8.title"),
      body: t("clause8.body"),
    },
    {
      title: t("clause9.title"),
      body: t("clause9.body"),
    },
    {
      title: t("clause10.title"),
      body: t("clause10.body"),
    },
  ];
  return (
    <main className="bg-primary/20 text-deep min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-3xl bg-white/95 p-8 shadow-xl">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.25em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
            {t("header.subtitle")}
          </p>
          <h1 className="text-deep text-3xl font-semibold tracking-tight">
            {t("header.title")}
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(var(--deep-rgb),0.75)]">
            {t("header.description", {
              companyName: STORE_INFO.legal.companyName,
            })}
          </p>
        </header>

        <section className="space-y-6 text-sm text-[rgba(var(--deep-rgb),0.8)]">
          {clauses.map((clause) => (
            <article key={clause.title} className="space-y-2">
              <h2 className="text-deep text-base font-semibold tracking-tight">
                {clause.title}
              </h2>
              <p>{clause.body}</p>
            </article>
          ))}
        </section>

        <footer className="bg-primary/15 rounded-2xl p-4 text-xs text-[rgba(var(--deep-rgb),0.7)]">
          <p>{t("footer.description")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <Link href="/legal/cancellation" className="underline">
                {t("footer.cancellation")}
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="underline">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/legal/imprint" className="underline">
                {t("footer.imprint")}
              </Link>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
