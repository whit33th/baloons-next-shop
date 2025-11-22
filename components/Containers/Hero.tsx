import { getTranslations } from "next-intl/server";

export const Hero = async () => {
  const t = await getTranslations("home");

  return (
    <section className="container mx-auto px-4 py-12 text-center md:py-16">
      <h1 className="text-foreground mb-3 font-serif text-3xl font-normal tracking-tight text-balance md:text-4xl lg:text-5xl">
        {t("heroTitle")}
      </h1>
      <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-base leading-relaxed text-pretty md:text-lg">
        {t("heroSubtitle")}
      </p>
      <div className="mx-auto flex max-w-md items-center justify-center gap-2">
        <div className="via-border h-px flex-1 bg-linear-to-r from-transparent to-transparent" />
        <div className="flex gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[hsl(25,45%,65%)]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[hsl(25,35%,70%)]" />
          <div className="h-1.5 w-1.5 rounded-full bg-[hsl(25,25%,75%)]" />
        </div>
        <div className="via-border h-px flex-1 bg-linear-to-r from-transparent to-transparent" />
      </div>
    </section>
  );
};
