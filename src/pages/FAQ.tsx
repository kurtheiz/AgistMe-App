import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageToolbar } from '../components/PageToolbar';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "What is agistment?",
    answer: "Agistment is an arrangement where a property owner allows someone else's horses or livestock to graze on their land for a fee. This includes access to pasture, water, and sometimes additional facilities like stables or yards."
  },
  {
    question: "How does AgistMe work?",
    answer: "AgistMe connects property owners with horse owners looking for agistment. Property owners can list their available spaces, complete with details and photos, while horse owners can search and inquire about suitable properties in their area."
  },
  {
    question: "What's included in a typical agistment?",
    answer: (
      <div>
        <p>A typical agistment arrangement may include:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Access to pasture and grazing land</li>
          <li>Water supply</li>
          <li>Basic boundary fencing</li>
          <li>Vehicle access to the property</li>
          <li>Some properties may also offer additional facilities like stables, yards, or arenas</li>
        </ul>
      </div>
    )
  },
  {
    question: "What are the different listing types?",
    answer: (
      <div>
        <p>AgistMe offers three listing types:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Basic:</strong> Free listing with essential features</li>
          <li><strong>Professional:</strong> Additional features like waiting lists and inspection scheduling</li>
          <li><strong>Premium:</strong> Full access to all features including paddock management, agistee management, and financial tools</li>
        </ul>
      </div>
    )
  },
  {
    question: "How do I list my property?",
    answer: "To list your property, simply click the 'List Agistment' button, create an account if you haven't already, and follow the step-by-step process to add your property details, photos, and available facilities."
  },
  {
    question: "Is there a cost to list my property?",
    answer: "Basic listings are free. Professional and Premium listings have a monthly subscription fee that gives you access to advanced features to help manage your agistment business more effectively."
  },
  {
    question: "How do payments work?",
    answer: "AgistMe is a platform for connecting property owners and horse owners. While we provide tools for managing payments in our Premium plan, the actual payment arrangements are made directly between the property owner and the agistee."
  },
  {
    question: "What safety measures are in place?",
    answer: "We encourage both property owners and horse owners to conduct proper inspections, maintain clear communication, and document any agreements. We recommend having proper insurance coverage and written agreements in place."
  }
];

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

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
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find answers to common questions about Agist Me and agistment services
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                onClick={() => toggleItem(index)}
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <div className="text-gray-600 dark:text-gray-300 prose dark:prose-invert">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
