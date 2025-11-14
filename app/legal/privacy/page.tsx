import Link from "next/link";
import { STORE_INFO } from "@/constants/config";

const dataProcessors = [
  {
    name: "Vercel Inc.",
    purpose: "Hosting and delivery of the website",
    location: "United States",
    safeguards:
      "Standard Contractual Clauses (SCCs) and data processing agreement",
  },
  {
    name: "Convex, Inc.",
    purpose: "Database and real-time application services",
    location: "United States",
    safeguards: "Standard Contractual Clauses (SCCs) and access controls",
  },
  {
    name: "ImageKit.io",
    purpose: "Media optimisation and CDN",
    location: "EU/India",
    safeguards:
      "Data processing agreement, SCCs, regional caching within the EU",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-primary/20 text-deep min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-3xl bg-white/95 p-8 shadow-xl">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.25em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
            Privacy policy (GDPR)
          </p>
          <h1 className="text-deep text-3xl font-semibold tracking-tight">
            How {STORE_INFO.legal.companyName} processes your personal data
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(var(--deep-rgb),0.75)]">
            This privacy notice explains which personal data we process when you
            visit our website, place an order, or use our services. We comply
            with the General Data Protection Regulation (GDPR) and the Austrian
            Data Protection Act (DSG).
          </p>
        </header>

        <section className="space-y-6 text-sm text-[rgba(var(--deep-rgb),0.8)]">
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Controller
            </h2>
            <p>
              {STORE_INFO.legal.companyName} is the controller responsible for
              processing your personal data.
            </p>
            <p className="mt-2">
              {STORE_INFO.address.street}
              <br />
              {STORE_INFO.address.postalCode} {STORE_INFO.address.city}
              <br />
              {STORE_INFO.address.country}
              <br />
              Email: {STORE_INFO.contact.email}
              <br />
              Phone:{" "}
              {STORE_INFO.contact.phoneDisplay ?? STORE_INFO.contact.phone}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Categories of data and purposes
            </h2>
            <ul className="mt-2 space-y-2">
              <li>
                <strong>Customer data:</strong> Name, contact details, delivery
                address, billing information for contract performance and
                customer service.
              </li>
              <li>
                <strong>Order information:</strong> Products, quantities, event
                details required to fulfil your order and provide customer
                support.
              </li>
              <li>
                <strong>Payment data:</strong> Payment status, transaction
                identifiers processed securely by our payment providers; we do
                not store full card numbers.
              </li>
              <li>
                <strong>Website usage:</strong> Technical logs and aggregated
                analytics to ensure platform stability and improve our services.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Legal bases (Article 6 GDPR)
            </h2>
            <ul className="mt-2 space-y-2">
              <li>
                Performance of a contract when processing your orders and
                delivering products.
              </li>
              <li>
                Compliance with legal obligations such as accounting and tax
                requirements.
              </li>
              <li>
                Legitimate interests to secure our platform, prevent fraud, and
                offer improved customer experiences.
              </li>
              <li>
                Consent for optional marketing communications, which you can
                withdraw at any time.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Retention periods
            </h2>
            <p>
              We store personal data only for as long as necessary to fulfil the
              purposes above. Order and invoice data are retained for seven
              years in line with Austrian commercial and tax law.
              Account-related data will be anonymised or deleted when no longer
              needed or when you request deletion and no legal obligations
              preclude it.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Processors and international transfers
            </h2>
            <p>
              We work with carefully selected processors that assist with
              hosting, infrastructure, and customer support. Where personal data
              is transferred outside the European Economic Area, we rely on
              appropriate safeguards such as EU Standard Contractual Clauses.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-[rgba(var(--deep-rgb),0.12)] text-left text-xs">
                <thead className="bg-primary/10 tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Processor</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Safeguards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(var(--deep-rgb),0.08)] bg-white text-[rgba(var(--deep-rgb),0.85)]">
                  {dataProcessors.map((processor) => (
                    <tr key={processor.name}>
                      <td className="px-4 py-3 font-medium">
                        {processor.name}
                      </td>
                      <td className="px-4 py-3">{processor.purpose}</td>
                      <td className="px-4 py-3">{processor.location}</td>
                      <td className="px-4 py-3">{processor.safeguards}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Your rights
            </h2>
            <p>
              Under Articles 15-21 GDPR you have the right to access,
              rectification, erasure, restriction of processing, data
              portability, and to object. You may withdraw consent at any time
              without affecting the lawfulness of processing before withdrawal.
              Contact us using the details above to exercise your rights.
            </p>
            <p className="mt-2">
              If you believe we have processed your data unlawfully, you may
              lodge a complaint with the Austrian Data Protection Authority:
              Datenschutzbehörde, Barichgasse 40-42, 1030 Vienna,
              <Link
                href="https://www.dsb.gv.at"
                className="hover:text-secondary ml-1 underline"
              >
                dsb.gv.at
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Cookies and analytics
            </h2>
            <p>
              We use essential cookies required for the operation of our shop
              and optional analytics to understand how visitors interact with
              our pages. Cookies that are not strictly necessary are only set
              after you provide consent via our cookie banner, where you can
              adjust settings at any time.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Updates
            </h2>
            <p>
              We may update this privacy notice to reflect changes in our
              services or legal requirements. The effective date is shown below.
              Significant changes will be communicated via the website or by
              email if appropriate.
            </p>
            <p className="mt-2 text-xs tracking-[0.22em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Last updated: January 2025
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
