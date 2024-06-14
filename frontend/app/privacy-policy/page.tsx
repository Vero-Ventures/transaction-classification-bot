import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="py-12 px-6 text-left ml-40 w-1/2 text-wrap">
      <h1 className="text-6xl font-bold mb-4">Privacy Policy</h1>
      <div className="text-2xl mb-8">
        <p className="mb-4">
          <strong>1. Introduction</strong>
          <br />
          AccuBot respects your privacy and is committed to protecting it
          through our compliance with this policy.
        </p>
        <p className="mb-4">
          <strong>2. Information Collection</strong>
          <br />
          AccuBot does not collect any personally identifiable information. All
          information recorded or transmitted is anonymized and used strictly
          for classification purposes.
        </p>
        <p className="mb-4">
          <strong>3. Use of Information</strong>
          <br />
          The anonymized data is used to improve transaction classification for
          our users. Automated transaction classification may be based on
          previous classifications for a given client, community
          classifications, and classifications using a Google search coupled
          with a large language model (LLM).
        </p>
        <p className="mb-4">
          <strong>4. Data Security</strong>
          <br />
          We implement measures designed to secure anonymized aggregated data
          from accidental loss and unauthorized access, use, alteration, and
          disclosure.
        </p>
        <p className="mb-4">
          <strong>5. Data Sharing</strong>
          <br />
          We do not share your anonymized aggregated data with third parties,
          except as necessary to provide our service or comply with legal
          obligations.
        </p>
        <p className="mb-4">
          <strong>6. Data Retention</strong>
          <br />
          Anonymized data is retained only as long as necessary to fulfill the
          purposes for which it was collected.
        </p>
        <p className="mb-4">
          <strong>7. Changes to This Privacy Policy</strong>
          <br />
          AccuBot may update this policy from time to time. We will notify you
          of any changes by posting the new policy on our website.
        </p>
        <p>
          <strong>8. Contact Us</strong>
          <br />
          If you have any questions about this Privacy Policy, please contact us
          at support@transactionclassifier.com
        </p>
      </div>
      <h1 className="text-6xl font-bold mb-4">Terms of Service (EULA)</h1>
      <div className="text-2xl mb-8">
        <p className="mb-4">
          <strong>1. Acceptance of Terms</strong>
          <br />
          By using AccuBot, you agree to comply with and be bound by these Terms
          of Service. If you do not agree to these terms, please do not use our
          services.
        </p>
        <p className="mb-4">
          <strong>2. License</strong>
          <br />
          AccuBot grants you a non-exclusive, non-transferable, revocable
          license to use the service strictly in accordance with these terms.
        </p>
        <p className="mb-4">
          <strong>3. Use of Service</strong>
          <br />
          AccuBot is intended for use by accountants and bookkeepers to classify
          transactions. You agree to use the service for lawful purposes only.
        </p>
        <p className="mb-4">
          <strong>4. Restrictions</strong>
          <br />
          You agree not to:
          <br />
          - Use the service for any illegal activities.
          <br />
          - Attempt to disrupt or interfere with the service.
          <br />- Reverse engineer or attempt to extract the source code of the
          service.
        </p>
        <p className="mb-4">
          <strong>5. Modifications to the Service</strong>
          <br />
          AccuBot reserves the right to modify or discontinue the service at any
          time without notice.
        </p>
        <p className="mb-4">
          <strong>6. Termination</strong>
          <br />
          We may terminate or suspend your access to the service immediately,
          without prior notice or liability, for any reason whatsoever,
          including without limitation if you breach the Terms.
        </p>
        <p className="mb-4">
          <strong>7. Disclaimer of Warranties</strong>
          <br />
          The service is provided "as is" without warranties of any kind, either
          express or implied.
        </p>
        <p className="mb-4">
          <strong>8. Limitation of Liability</strong>
          <br />
          In no event shall AccuBot be liable for any damages arising out of the
          use or inability to use the service.
        </p>
        <p className="mb-4">
          <strong>9. Governing Law</strong>
          <br />
          These terms shall be governed and construed in accordance with the
          laws of the jurisdiction in which AccuBot operates.
        </p>
        <p>
          <strong>10. Contact Us</strong>
          <br />
          If you have any questions about these Terms, please contact us at
          support@transactionclassifier.com
        </p>
      </div>
      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
        Go Back Home
      </Link>
    </div>
  );
}
