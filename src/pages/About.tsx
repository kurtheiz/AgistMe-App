import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          About Agist Me
        </h1>
        <p className="text-sm text-neutral-500 mb-8">Connecting Horse Owners with Quality Agistment</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Our Mission</h2>
          <p className="text-gray-600 mb-4">
            Agist Me is dedicated to simplifying the process of finding and managing horse agistment in Australia. 
            We connect horse owners with quality agistment providers, making it easier to find the perfect home for your horse.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">What We Offer</h2>
          <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
            <li>Comprehensive agistment listings across Australia</li>
            <li>Easy-to-use search functionality with detailed filters</li>
            <li>Direct communication with agistment providers</li>
            <li>Secure platform for managing your listings and enquiries</li>
            <li>AI-powered listing creation from text descriptions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">For Horse Owners</h2>
          <p className="text-gray-600 mb-4">
            Find the perfect agistment for your horse with our comprehensive search features. Browse through detailed listings, 
            save your favorites, and connect directly with property owners.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">For Agistment Providers</h2>
          <p className="text-gray-600 mb-4">
            List your property and reach potential clients easily. Our platform helps you manage your listings 
            and communicate with interested horse owners efficiently.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Trust & Safety</h2>
          <p className="text-gray-600 mb-4">
            We prioritize the safety and security of our users. Our platform includes verified user profiles, 
            secure messaging, and comprehensive listing guidelines to ensure a trustworthy environment.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Legal Information</h2>
          <p className="text-gray-600 mb-4">
            Agist Me is operated by heizlogic. For more information about how we protect your data and your rights, 
            please review our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">Terms of Use</Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contact Us</h2>
          <p className="text-gray-600">
            For enquiries about Agist Me, please contact us at{' '}
            <a href="mailto:info@agist.me" className="text-blue-600 hover:underline">
              info@agist.me
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
