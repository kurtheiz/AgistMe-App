import React, { useEffect } from 'react';
import { scrollManager } from '../utils/scrollManager';

const Privacy: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-8">Last Updated: December 13, 2023</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            This Privacy Policy explains how heizlogic collects, uses, and protects your personal
            information when you use Agist Me, in accordance with the Australian Privacy Principles (APPs) contained in the
            Privacy Act 1988 (Cth).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="mb-2">We collect the following types of personal information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and contact details</li>
            <li>Email address</li>
            <li>Device information and IP address</li>
            <li>Website usage data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-2">We use your personal information for:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing our services</li>
            <li>Communicating with you</li>
            <li>Improving our website</li>
            <li>Marketing (with consent)</li>
            <li>Legal compliance</li>
            <li>Artificial Intelligence and Machine Learning processing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Processing</h2>
          <h3 className="text-xl font-semibold mb-2">4.1 Data Storage Location</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>All data is stored securely within Australia using Amazon Web Services (AWS) Sydney data centers</li>
            <li>All stored data is encrypted using industry-standard encryption protocols</li>
            <li>Backup systems are also located within Australia</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">4.2 Artificial Intelligence Processing</h3>
          <p className="mb-2">We want to be transparent about our use of AI technologies:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Some data may be temporarily processed through generative AI services</li>
            <li>This processing may involve temporary transmission of data to offshore AI processors</li>
            <li>No permanent storage occurs outside of Australia</li>
            <li>All data transmission is encrypted and secure</li>
            <li>AI processing is conducted in accordance with strict data protection protocols</li>
            <li>AI processing is used to convert text to a listing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Protection and Third-Party Access</h2>
          <h3 className="text-xl font-semibold mb-2">5.1 Data Protection Measures</h3>
          <p className="mb-2">We implement strict measures to prevent unauthorized data collection and usage:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
            <li>Monitoring for suspicious activities</li>
            <li>Detection of automated data collection attempts</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">5.2 Third-Party Access Restrictions</h3>
          <p className="mb-2">We strictly prohibit:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Unauthorized collection or harvesting of user information</li>
            <li>Use of our data by third parties for commercial purposes</li>
            <li>Transfer or sale of user data to third parties</li>
            <li>Creation of derivative databases using our information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Disclosure of Information</h2>
          <p className="mb-2">We may disclose personal information to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Service providers (under strict confidentiality agreements)</li>
            <li>Third parties with your explicit consent</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Access and Correction</h2>
          <p className="mb-4">
            You have the right to access your personal information and request corrections. Contact us at privacy@agist.me to exercise these rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Overseas Disclosure</h2>
          <p className="mb-4">
            If we disclose personal information overseas, we will take reasonable steps to ensure that the overseas recipient complies with the APPs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. User Rights Regarding AI Processing</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Opt-out of AI-enhanced features where possible</li>
            <li>Request information about how your data is processed</li>
            <li>Object to AI processing of your personal information</li>
            <li>Request human review of automated decisions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Technical Protection Measures</h2>
          <p className="mb-2">We employ technical measures to protect against unauthorized data access:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Rate limiting</li>
            <li>IP blocking of suspicious activities</li>
            <li>Monitoring for automated collection attempts</li>
            <li>Browser verification</li>
            <li>API access controls</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Complaints</h2>
          <p className="mb-4">
            If you believe we have breached your privacy rights, please contact us at privacy@agist.me. We will investigate and respond within 30 days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
          <p className="mb-4">For privacy-related inquiries, please contact:</p>
          <div className="mb-4">
            <p>heizlogic</p>
            <p>Email: privacy@agist.me</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
