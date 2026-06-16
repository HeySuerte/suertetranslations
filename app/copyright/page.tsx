import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright",
  description: "Copyright and content removal requests for Suerte Translations.",
  robots: { index: true, follow: false },
};

export default function CopyrightPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-black text-white mb-8">Copyright</h1>

      <div
        className="p-8 rounded-2xl flex flex-col gap-6 text-sm leading-relaxed"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
      >
        <p>
          Suerte Translations hosts fan translations of web novels for non-commercial purposes.
          We respect the rights of original authors, publishers, and licensors.
        </p>

        <p>
          Copyright holders can request content review or removal. We will respond within 72 hours
          and remove content promptly upon verification of a valid claim.
        </p>

        <div className="pt-2">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--accent-light)" }}>
            Contact
          </p>
          <a
            href="mailto:heysuertetranslations@gmail.com"
            className="text-white font-medium hover:underline"
          >
            heysuertetranslations@gmail.com
          </a>
        </div>

        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Please include the title of the work, your relation to the copyright, and any relevant
          licensing information in your message.
        </p>
      </div>
    </div>
  );
}
