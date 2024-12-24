import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentsService } from '../../services/payments.service';
import { Loader2, ChevronLeft, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dates';
import { formatPrice } from '../../utils/prices';

interface Invoice {
  id: string;
  subscription: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  created_date: string;
  due_date: string | null;
  invoice_pdf: string;
  hosted_invoice_url: string;
  paid: boolean;
}

interface InvoicesHeader {
  agistmentId: string;
  agistmentName: string | null;
  subscription_id: string;
}

interface InvoicesResponse {
  header: InvoicesHeader;
  invoices: Invoice[];
}

export const Invoices = () => {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
  const [header, setHeader] = useState<InvoicesHeader | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!subscriptionId) {
        setError('No subscription ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response: InvoicesResponse = await paymentsService.getSubscriptionInvoices(subscriptionId);
        setHeader(response.header);
        setInvoices(response.invoices);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
        setError('Failed to load invoices. Please try again later.');
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [subscriptionId]);

  return (
    <div className="bg-neutral-50">
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard/billing')}
              className="back-button"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="back-button-text">Back</span>
            </button>
            <span className="breadcrumb-separator">|</span>
            <div className="breadcrumb-container">
              <button
                onClick={() => navigate('/dashboard')}
                className="breadcrumb-link"
              >
                Dashboard
              </button>
              <span className="breadcrumb-chevron">&gt;</span>
              <button
                onClick={() => navigate('/dashboard/billing')}
                className="breadcrumb-link"
              >
                Billing
              </button>
              <span className="breadcrumb-chevron">&gt;</span>
              <span>Invoices</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : !invoices.length ? (
            <div className="text-center py-12">
              <p className="text-neutral-600">No invoices found for this subscription.</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {header?.agistmentName || 'Subscription'} Invoices
                  </h3>
                </div>
                
                {/* Mobile view */}
                <div className="block sm:hidden">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="mb-4 p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-neutral-900">
                          {formatDate(new Date(invoice.created_date))}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.paid 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Amount Due:</span>
                          <span className="font-medium text-right">
                            {formatPrice(invoice.amount_due)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-500">Amount Paid:</span>
                          <span className="font-medium text-right">
                            {formatPrice(invoice.amount_paid)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-sm text-neutral-500">Actions:</span>
                        <div className="flex items-center">
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            View Online
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Amount Due
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Amount Paid
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            {formatDate(new Date(invoice.created_date))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.paid 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-neutral-900">
                            {formatPrice(invoice.amount_due)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-neutral-900">
                            {formatPrice(invoice.amount_paid)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <a
                              href={invoice.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Online
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
