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
      <PageToolbar>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Enquiries</h1>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-neutral-100 rounded-lg"
          disabled={isLoading}
        >
          <RotateCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </PageToolbar>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
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
  );
}
