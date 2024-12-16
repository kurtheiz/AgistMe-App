import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enquiriesService } from '../services/enquiries.service';
import { EnquiryRequest } from '../types/enquiry';
import toast from 'react-hot-toast';

export const useEnquiries = () => {
  return useQuery({
    queryKey: ['enquiries'],
    queryFn: () => enquiriesService.getEnquiries()
  });
};

export const useAgistmentEnquiries = (agistmentId: string) => {
  return useQuery({
    queryKey: ['agistment-enquiries', agistmentId],
    queryFn: () => enquiriesService.getAgistmentEnquiries(agistmentId),
    enabled: !!agistmentId
  });
};

export const useSubmitEnquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agistmentId, enquiry }: { agistmentId: string; enquiry: EnquiryRequest }) => 
      enquiriesService.submitEnquiry(agistmentId, enquiry),
    onSuccess: (_, { agistmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['agistment-enquiries', agistmentId] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      toast.success('Enquiry sent successfully');
    },
    onError: () => {
      toast.error('Failed to send enquiry. Please try again.');
    }
  });
};

export const useMarkEnquiryAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enquiryId: string) => enquiriesService.markEnquiryAsRead(enquiryId),
    onSuccess: () => {
      // Update both enquiries and agistment-enquiries queries
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'agistment-enquiries'
      });
    }
  });
};
