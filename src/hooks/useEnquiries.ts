import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enquiriesService } from '../services/enquiries.service';
import { EnquiryRequest, EnquiryStatusUpdate, EnquiriesResponse, EnquiryResponse } from '../types/enquiry';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';
import { useAgistor } from './useAgistor';

export const useUnreadEnquiriesCount = () => {
  const { isSignedIn } = useUser();
  const { isAgistor } = useAgistor();

  const { data } = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => enquiriesService.getEnquiries(),
    select: (data) => data.enquiries?.filter(enquiry => !enquiry.read).length ?? 0,
    enabled: isSignedIn && isAgistor // Only run the query if user is signed in and is an agistor
  });

  return data ?? 0;
};

export const useSubmitEnquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agistmentId, enquiry }: { agistmentId: string; enquiry: EnquiryRequest }) => 
      enquiriesService.submitEnquiry(agistmentId, enquiry),
    onSuccess: () => {
      // Refresh enquiries
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      toast.success('Enquiry sent successfully');
    },
    onError: () => {
      toast.error('Failed to send enquiry. Please try again.');
    }
  });
};

export const useUpdateEnquiryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enquiryId, update }: { enquiryId: string; update: EnquiryStatusUpdate }) =>
      enquiriesService.updateEnquiryStatus(enquiryId, update),
    onMutate: async ({ enquiryId, update }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['enquiries'] });
      await queryClient.cancelQueries({ queryKey: ['agistment-enquiries'] });

      // Snapshot the previous value
      const previousEnquiries = queryClient.getQueryData<EnquiriesResponse>(['enquiries']);

      // Optimistically update the enquiries
      if (previousEnquiries?.enquiries) {
        queryClient.setQueryData(['enquiries'], {
          ...previousEnquiries,
          enquiries: previousEnquiries.enquiries.map(enquiry =>
            enquiry.id === enquiryId ? { ...enquiry, ...update } : enquiry
          )
        });

        // Also update agistment-enquiries if they exist
        const agistmentEnquiriesQueries = queryClient.getQueriesData<EnquiriesResponse>({ 
          queryKey: ['agistment-enquiries'],
          exact: true 
        });
        agistmentEnquiriesQueries.forEach(([queryKey]) => {
          const data = queryClient.getQueryData<EnquiriesResponse>(queryKey);
          if (data?.enquiries) {
            queryClient.setQueryData<EnquiriesResponse>(queryKey, {
              ...data,
              enquiries: data.enquiries.map((enquiry: EnquiryResponse) =>
                enquiry.id === enquiryId ? { ...enquiry, ...update } : enquiry
              )
            });
          }
        });
      }

      return { previousEnquiries };
    },
    onSuccess: (_, { update }) => {
      // Show appropriate success message based on the update
      let message = 'Status updated successfully';
      if (update.read !== undefined) {
        message = update.read ? 'Marked as read' : 'Marked as unread';
      } else if (update.status === 'ACKNOWLEDGED') {
        message = 'Enquiry removed';
      }
      toast.success(message);
    },
    onError: (error, _variables, context) => {
      // Revert back to the previous value if there's an error
      if (context?.previousEnquiries) {
        queryClient.setQueryData(['enquiries'], context.previousEnquiries);
      }
      console.error('Error updating enquiry status:', error);
      toast.error('Failed to update enquiry status. Please try again.');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're up to date
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ 
        queryKey: ['agistment-enquiries']
      });
    }
  });
};
