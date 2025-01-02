import React, { useEffect } from 'react';
import { Mail, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageToolbar } from '../components/PageToolbar';

const Contact: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <PageToolbar
        actions={
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1 -ml-4 px-1 sm:px-3 py-2 text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-medium text-sm sm:text-base">Back</span>
                </button>
              </div>
            </div>
          </div>
        }
      />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We're here to help with any questions about Agist Me. Our team is dedicated to providing you with the best support possible.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full">
              <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Email Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                For support enquiries, please email us at:
              </p>
              <a 
                href="mailto:support@agist.me"
                className="text-lg font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                support@agist.me
              </a>
            </div>

            <div className="w-full border-t border-gray-200 dark:border-neutral-700 pt-6 mt-6">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Response Time
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We aim to respond to all enquiries within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
