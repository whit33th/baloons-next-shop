"use client";

import { STORE_INFO } from "@/constants/config";

const sections = [
  {
    heading: "Self-Pickup",
    items: [
      `Address: ${STORE_INFO.address.street}, ${STORE_INFO.address.postalCode} ${STORE_INFO.address.city}`,
      "Opening hours: 7 days a week, 24 hours a day, no breaks or holidays",
      "Please confirm the date and time of pickup in advance",
      "Payment: Cash only on-site (when choosing cash payment option)",
    ],
  },
  {
    heading: "Delivery",
    items: [
      "Available to nearby cities from 16:00 to 21:00",
      "Cost: +€16 to order total",
      "Delivery time: Between 16:00 and 21:00",
    ],
  },
  {
    heading: "Important Information",
    items: [
      "Reservation and cancellation: Order is confirmed after payment or WhatsApp confirmation. Cancellation possible up to 48 hours before pickup",
      "Preparation time: 72 hours (3 days)",
      "Contact: WhatsApp only",
    ],
  },
];

export default function DeliveryPage() {
  return (
    <main className="bg-primary/20 text-deep min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-3xl bg-white/95 p-8 shadow-xl">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.25em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
            Delivery & Pickup
          </p>
          <h1 className="text-deep text-3xl font-semibold tracking-tight">
            Delivery and Pickup Options
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(var(--deep-rgb),0.75)]">
            We offer convenient delivery and self-pickup options for your
            orders. Choose what works best for you.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
                {section.heading}
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-[rgba(var(--deep-rgb),0.85)]">
                {section.items.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="space-y-4 text-sm text-[rgba(var(--deep-rgb),0.8)]">
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Order Confirmation
            </h2>
            <p className="mt-2">
              Your order is confirmed after payment or WhatsApp confirmation.
              Once confirmed, we start preparing your order which typically
              takes 3 days (72 hours). We will contact you to confirm the exact
              pickup or delivery time.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Payment Methods
            </h2>
            <p>
              For self-pickup with cash payment, you settle the amount on-site.
              For online payments, your order is secured immediately. Delivery
              costs are added to your order total.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Contact & Support
            </h2>
            <p>
              For any questions regarding delivery or pickup, please contact us
              via WhatsApp at{" "}
              <a
                href={`https://wa.me/${STORE_INFO.contact.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary underline"
              >
                {STORE_INFO.contact.phoneDisplay ?? STORE_INFO.contact.phone}
              </a>
              . We are here to help and will respond promptly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
