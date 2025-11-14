import Link from "next/link";
import { STORE_INFO } from "@/constants/config";

const clauses = [
  {
    title: "1. Scope",
    body: `These Terms and Conditions govern all orders placed via the online shop of ${STORE_INFO.legal.companyName}. They are based on the Austrian Consumer Protection Act (KSchG), the E-Commerce Act (ECG) and the Austrian Civil Code (ABGB).`,
  },
  {
    title: "2. Contract language and conclusion",
    body: "The contract languages are German, Russian and English. Products presented in the shop are non-binding invitations to order. A contract is formed when we confirm your order in writing (e-mail) or dispatch the goods.",
  },
  {
    title: "3. Prices and payment",
    body: "All prices are stated in euros and include statutory Austrian VAT. Payment can be made either via full online payment (Stripe) or cash upon pickup. Part-payment or deposit models are not offered. Online payments are processed immediately, ensuring reservation of the selected bouquet or arrangement.",
  },
  {
    title: "4. Delivery and pickup",
    body: "We currently deliver within Styria, Austria, according to the times listed on the Delivery page. Pickup is available at the showroom in Knittelfeld around the clock by appointment. Risk passes to the customer once the goods are handed over to the customer or their authorised representative.",
  },
  {
    title: "5. Retention of title",
    body: "Goods remain the property of Ballon Boutique until full payment has been received.",
  },
  {
    title: "6. Right of withdrawal",
    body: "Consumers have a right to withdraw within 14 days as described in our Cancellation and Refund Policy. Due to the personalised nature of balloon arrangements, customised orders may be excluded pursuant to Section 18 paragraph 1 lit. c FAGG.",
  },
  {
    title: "7. Warranty and defects",
    body: "The statutory warranty period of two years applies. Please notify us of any defects without undue delay. For natural latex products, minor colour deviations or changes in volume caused by ambient temperature do not constitute defects.",
  },
  {
    title: "8. Liability",
    body: "We are liable for intent and gross negligence in accordance with Austrian law. Liability for slightly negligent damage, consequential damage and loss of profit is excluded, unless mandatory consumer protection provisions provide otherwise.",
  },
  {
    title: "9. Force majeure",
    body: "Events outside our control (e.g. strikes, power outages, extreme weather) may delay delivery. We will inform you immediately and propose alternative dates or a refund.",
  },
  {
    title: "10. Dispute resolution",
    body: "The competent court for disputes with consumers is determined by Section 14 KSchG. Austrian law applies under exclusion of the UN Convention on Contracts for the International Sale of Goods. Consumers can submit complaints via the EU platform for online dispute resolution.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-primary/20 text-deep min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-3xl bg-white/95 p-8 shadow-xl">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.25em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
            Terms and Conditions
          </p>
          <h1 className="text-deep text-3xl font-semibold tracking-tight">
            General Terms and Conditions (AGB)
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(var(--deep-rgb),0.75)]">
            Valid for all distance contracts of {STORE_INFO.legal.companyName}{" "}
            as of 1 November 2025. These conditions complement mandatory
            consumer rights and do not limit statutory protections under
            Austrian law.
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
          <p>
            Clarifications regarding withdrawal, privacy and company details are
            provided separately:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <Link
                href={{ pathname: "/legal/cancellation" }}
                className="underline"
              >
                Cancellation and Refund Policy
              </Link>
            </li>
            <li>
              <Link href={{ pathname: "/legal/privacy" }} className="underline">
                Privacy Policy (GDPR)
              </Link>
            </li>
            <li>
              <Link href={{ pathname: "/legal/imprint" }} className="underline">
                Imprint (Impressum)
              </Link>
            </li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
