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
      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
        Go Back Home
      </Link>
    </div>
  );
}
