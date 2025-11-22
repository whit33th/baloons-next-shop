"use client";

import { useTranslations } from 'next-intl';
import { STORE_INFO } from "@/constants/config";

export default function DeliveryPage() {
  const t = useTranslations('delivery');

  const sections = [
    {
      heading: t('selfPickup'),
      items: [
        `${t('address')}: ${STORE_INFO.address.street}, ${STORE_INFO.address.postalCode} ${STORE_INFO.address.city}`,
        t('openingHours'),
        t('confirmPickup'),
        t('paymentCash'),
      ],
    },
    {
      heading: t('delivery'),
      items: [
        t('availableCities'),
        t('cost'),
        t('deliveryTime'),
      ],
    },
    {
      heading: t('importantInfo'),
      items: [
        t('reservation'),
        t('preparationTime'),
        t('contact'),
      ],
    },
  ];

  return (
    <main className="bg-primary/20 text-deep min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-3xl bg-white/95 p-8 shadow-xl">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.25em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
            {t('delivery')} & {t('selfPickup')}
          </p>
          <h1 className="text-deep text-3xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(var(--deep-rgb),0.75)]">
            {t('subtitle')}
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
                {section.heading}
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-[rgba(var(--deep-rgb),0.85)]">
                {section.items.map((entry, index) => (
                  <li key={index}>{entry}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="space-y-4 text-sm text-[rgba(var(--deep-rgb),0.8)]">
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              {t('orderConfirmation')}
            </h2>
            <p className="mt-2">
              {t('orderConfirmationDescription')}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              {t('paymentMethods')}
            </h2>
            <p>
              {t('paymentMethodsDescription')}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              {t('contactSupport')}
            </h2>
            <p>
              {t('contactSupportDescription')}{" "}
              <a
                href={`https://wa.me/${STORE_INFO.contact.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary underline"
              >
                {STORE_INFO.contact.phoneDisplay ?? STORE_INFO.contact.phone}
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
