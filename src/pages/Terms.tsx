import React, { useEffect } from 'react';
import { scrollManager } from '../utils/scrollManager';

const Terms: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
      <p className="text-sm text-neutral-500 mb-8">Last Updated: December 13, 2023</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily access the materials (information or software) on heizlogic's Agist Me website for personal, non-commercial viewing only.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Prohibited Activities</h2>
        <p className="mb-2">The following activities are strictly prohibited:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Data scraping, data mining, or data extraction of any kind</li>
          <li>Using automated systems, robots, spiders, or similar technologies to collect or extract data</li>
          <li>Copying, reproducing, or storing any content from this website without explicit written permission</li>
          <li>Selling, reselling, licensing, sublicensing, or commercializing any website data or content</li>
          <li>Using the website's content or data to create competing products or services</li>
          <li>Attempting to decompile, reverse engineer, or otherwise extract source code</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Data Protection</h2>
        <p className="mb-2">
          All content and data on this website are proprietary to heizlogic and protected by Australian intellectual property laws. 
          Any unauthorized collection, use, or distribution of our data may result in:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Immediate termination of access</li>
          <li>Legal action for damages</li>
          <li>Injunctive relief</li>
          <li>Recovery of legal costs</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Disclaimer</h2>
        <p className="mb-2">
          The materials on this website are provided on an 'as is' basis. heizlogic makes no warranties, 
          expressed or implied, and hereby disclaims and negates all other warranties including, without limitation:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Warranties of merchantability</li>
          <li>Fitness for a particular purpose</li>
          <li>Non-infringement of intellectual property</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Limitations</h2>
        <p className="mb-4">
          In no event shall heizlogic be liable for any damages arising out of the use or inability to use the materials on this website.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
        <p className="mb-4">
          These terms and conditions are governed by and construed in accordance with the laws of Australia 
          and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
      </section>
    </div>
  );
};

export default Terms;
