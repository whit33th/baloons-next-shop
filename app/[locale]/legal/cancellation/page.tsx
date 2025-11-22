import { STORE_INFO } from "@/constants/config";
import { Link } from "@/i18n/routing";

const sampleForm = `To ${STORE_INFO.legal.companyName}, ${STORE_INFO.address.street}, ${STORE_INFO.address.postalCode} ${STORE_INFO.address.city}, ${STORE_INFO.contact.email}

I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*):

Ordered on (*)/received on (*):
Name of consumer(s):
Address of consumer(s):
Signature of consumer(s) (only if this form is notified on paper):
Date:`;

export default function CancellationPolicyPage() {
  return (
    <main className="bg-primary/20 text-deep min-h-screen px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 rounded-3xl bg-white/95 p-8 shadow-xl">
        <header className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.25em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
            Cancellation and refund policy
          </p>
          <h1 className="text-deep text-3xl font-semibold tracking-tight">
            Right of withdrawal for Austrian consumers
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(var(--deep-rgb),0.75)]">
            This policy follows the Fern- und Auswärtsgeschäfte-Gesetz (FAGG)
            and provides details on how you can withdraw from distance selling
            contracts with {STORE_INFO.legal.companyName}.
          </p>
        </header>

        <section className="space-y-4 text-sm text-[rgba(var(--deep-rgb),0.8)]">
          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              14-day withdrawal period
            </h2>
            <p>
              You have the right to withdraw from this contract within 14 days
              without giving any reason. The withdrawal period expires 14 days
              from the day you or a third party other than the carrier indicated
              by you acquires physical possession of the goods.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Exercising your right
            </h2>
            <p>
              To exercise the right of withdrawal, you must inform us via a
              clear statement (e.g. a letter sent by post or email) of your
              decision to withdraw from this contract. You may use the sample
              cancellation form provided below, but it is not obligatory. Please
              include your order number so that we can process your request
              quickly.
            </p>
            <p className="mt-2">
              {STORE_INFO.legal.companyName}
              <br />
              {STORE_INFO.address.street}
              <br />
              {STORE_INFO.address.postalCode} {STORE_INFO.address.city}
              <br />
              {STORE_INFO.contact.email}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Effects of withdrawal
            </h2>
            <p>
              If you withdraw from this contract, we shall reimburse all
              payments received from you, including delivery costs (except for
              additional costs resulting from your choice of a type of delivery
              other than the least expensive standard delivery offered by us),
              without undue delay and at the latest within 14 days from the day
              on which we are informed about your decision to withdraw. We will
              use the same means of payment that you used for the original
              transaction, unless we expressly agree otherwise. You will not
              incur any fees as a result of such reimbursement.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Retention of goods
            </h2>
            <p>
              We may withhold reimbursement until we have received the goods
              back or you have supplied evidence of having sent back the goods,
              whichever is earlier. You must send back or hand over the goods to
              us without undue delay and in any event no later than 14 days from
              the day on which you communicate your withdrawal. You bear the
              direct cost of returning the goods.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Exceptions
            </h2>
            <p>
              The right of withdrawal does not apply to personalised products or
              goods made to customer specifications (Section 18 FAGG). Balloons
              inflated with helium and ready-made decorations are considered
              goods that can deteriorate quickly and are therefore excluded once
              produced according to your order. Services rendered within the
              withdrawal period at your express request are only refundable
              proportionally for the unused portion.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Sample cancellation form
            </h2>
            <p>
              (If you wish to withdraw from the contract, please complete and
              return this form.)
            </p>
            <p className="mt-2 whitespace-pre-line">{sampleForm}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-[0.18em] text-[rgba(var(--deep-rgb),0.6)] uppercase">
              Further information
            </h2>
            <p>
              For additional details please consult our
              <Link
                href={{ pathname: "/legal/terms" }}
                className="hover:text-secondary ml-1 underline"
              >
                Terms and Conditions
              </Link>
              and
              <Link
                href={{ pathname: "/legal/privacy" }}
                className="hover:text-secondary ml-1 underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
