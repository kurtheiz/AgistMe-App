import { useEnquiries } from '../../hooks/useEnquiries';
import { useAuth } from '@clerk/clerk-react';
import { Loader2, RotateCw, ChevronLeft } from 'lucide-react';
import { PageToolbar } from '../../components/PageToolbar';
import { useNavigate } from 'react-router-dom';
import { EnquiryCard } from './EnquiryCard';

export default function EnquiriesPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { data: enquiriesResponse, isLoading, refetch } = useEnquiries();
  const enquiries = enquiriesResponse?.enquiries || [];

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
            onClick={() => refetch()}
            disabled={isLoading}
            className={`button-toolbar ${isLoading && 'opacity-50 cursor-not-allowed hover:bg-white'}`}
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        }
      />
      <div className="flex-grow w-full">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-neutral-600">
                {enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'}
              </div>
              {!enquiries || enquiries.length === 0 ? (
                <div className="text-center text-neutral-500">
                  No enquiries found
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {enquiries.map((enquiry) => (
                    <EnquiryCard
                      key={enquiry.id}
                      enquiry={enquiry}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
