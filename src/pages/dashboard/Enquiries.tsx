import { useEnquiries, useMarkEnquiryAsRead } from '../../hooks/useEnquiries';
import { useAuth } from '@clerk/clerk-react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, RotateCw, ChevronLeft } from 'lucide-react';
import { PageToolbar } from '../../components/PageToolbar';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { EnquiryCard } from './EnquiryCard';

export default function EnquiriesPage() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { data: enquiriesData, isLoading, isFetching } = useEnquiries();
  const { mutate: markAsRead } = useMarkEnquiryAsRead();
  const queryClient = useQueryClient();

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 px-4">
        <h1 className="text-2xl font-semibold mb-4">Please sign in to view your enquiries</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      <PageToolbar
        titleElement={
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(-1)}
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
                  <span>Enquiries</span>
                </div>
              </div>
            </div>
          </div>
        }
        actions={
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['enquiries'] })}
            disabled={isFetching}
            className={`button-toolbar ${isFetching && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
          >
            <RotateCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />
      <div className="flex-grow w-full md:max-w-7xl md:mx-auto">
        <div className="pb-8 pt-4 md:px-4">
          <div className="mb-4 text-sm text-neutral-600 px-4">
            {enquiriesData?.enquiries.length} {enquiriesData?.enquiries.length === 1 ? 'enquiry' : 'enquiries'}
          </div>

          <div className="space-y-4 px-4">
            {enquiriesData?.enquiries.length === 0 ? (
              <div className="p-6 text-center text-neutral-600 bg-white rounded-lg shadow-md">
                No enquiries found
              </div>
            ) : (
              <div className="space-y-4">
                {enquiriesData?.enquiries.map((enquiry) => (
                  <EnquiryCard
                    key={enquiry.id}
                    enquiry={enquiry}
                    onClick={() => markAsRead(enquiry.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
