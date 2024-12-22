import { useAuth } from '@clerk/clerk-react';
import { Loader2, RotateCw, ChevronLeft } from 'lucide-react';
import { PageToolbar } from '../../components/PageToolbar';
import { useNavigate } from 'react-router-dom';
import { EnquiryCard } from './EnquiryCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { enquiriesService } from '../../services/enquiries.service';

export default function EnquiriesPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoading, data } = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => enquiriesService.getEnquiries()
  });
  const enquiries = data?.enquiries || [];

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 px-4">
        <h1 className="text-2xl font-semibold mb-4">Please sign in to view your enquiries</h1>
        <button
          onClick={() => navigate('/sign-in')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageToolbar
        titleElement={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <span className="breadcrumb-parent">Dashboard</span>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">Enquiries</span>
                </div>
              </div>
            </div>
          </div>
        }
        actions={[
          <button
            key="refresh"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['enquiries'] })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            <RotateCw className="w-4 h-4" />
            Refresh
          </button>
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-sm text-neutral-600 mb-4">
          Enquiries will be automatically removed after 30 days
        </div>

        {!isLoading && enquiries.length > 0 && (
          <div className="mb-4 text-sm text-neutral-600">
            {enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
          </div>
        ) : (
          <div className="grid gap-4">
            {enquiries.map((enquiry) => (
              <EnquiryCard key={enquiry.id} enquiry={enquiry} />
            ))}
            {enquiries.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                No enquiries found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
