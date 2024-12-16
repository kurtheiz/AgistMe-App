import { useEnquiries, useMarkEnquiryAsRead } from '../../hooks/useEnquiries';
import { useAuth } from '@clerk/clerk-react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, RotateCw, ChevronLeft } from 'lucide-react';
import { PageToolbar } from '../../components/PageToolbar';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

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

          <div className="bg-white rounded-lg shadow">
            {enquiriesData?.enquiries.length === 0 ? (
              <div className="p-6 text-center text-neutral-600">
                No enquiries found
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {enquiriesData?.enquiries.map((enquiry) => (
                  <div 
                    key={enquiry.id} 
                    className={`p-6 hover:bg-neutral-50 transition-colors ${!enquiry.read ? 'bg-primary-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{enquiry.first_name} {enquiry.last_name}</h3>
                          <span className="text-sm text-neutral-600">• {enquiry.agistment_name}</span>
                          {!enquiry.read && (
                            <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">
                          {enquiry.email} • {enquiry.mobile_phone}
                        </p>
                        <p className="text-sm text-neutral-500 mb-4">
                          Sent {formatDistanceToNow(new Date(enquiry.created_at))} ago
                        </p>
                        <div className="bg-neutral-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Type:</span>
                            <span className="text-sm text-neutral-600">{enquiry.enquiry_type}</span>
                          </div>
                          <p className="text-neutral-700 whitespace-pre-wrap">{enquiry.message}</p>
                        </div>
                      </div>
                      {!enquiry.read && (
                        <button
                          onClick={() => markAsRead(enquiry.id)}
                          className="ml-4 text-sm text-primary-600 hover:text-primary-700"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
