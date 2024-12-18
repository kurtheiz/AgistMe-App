import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enquiriesService } from '../services/enquiries.service';
import { EnquiryRequest, EnquiryStatusUpdate } from '../types/enquiry';
import toast from 'react-hot-toast';
import { useEnquiriesStore } from '../stores/enquiries.store';
import { useEffect } from 'react';

export const useEnquiries = () => {
  const { setEnquiries } = useEnquiriesStore();

  const query = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => enquiriesService.getEnquiries(),
    refetchInterval: 1000 * 60 * 15, // 15 minutes
    refetchIntervalInBackground: true
  });

  // Sync query data with store
  useEffect(() => {
    if (query.data) {
      setEnquiries(query.data.enquiries);
    }
  }, [query.data, setEnquiries]);

  return query;
};

export const useAgistmentEnquiries = (agistmentId: string) => {
  const { setEnquiries } = useEnquiriesStore();

  const query = useQuery({
    queryKey: ['agistment-enquiries', agistmentId],
    queryFn: () => enquiriesService.getAgistmentEnquiries(agistmentId),
    enabled: !!agistmentId
  });

  // Sync query data with store
  useEffect(() => {
    if (query.data) {
      setEnquiries(query.data.enquiries);
    }
  }, [query.data, setEnquiries]);

  return query;
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
  const { enquiries, setEnquiries } = useEnquiriesStore();

  return useMutation({
    mutationFn: (enquiryId: string) => enquiriesService.markEnquiryAsRead(enquiryId),
    onSuccess: (_, enquiryId) => {
      // Update both enquiries and agistment-enquiries queries
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'agistment-enquiries'
      });

      // Update the store immediately
      const updatedEnquiries = enquiries.map(enquiry => 
        enquiry.id === enquiryId ? { ...enquiry, read: true } : enquiry
      );
      setEnquiries(updatedEnquiries);
    }
  });
};

export const useMarkEnquiryAsUnread = () => {
  const queryClient = useQueryClient();
  const { enquiries, setEnquiries } = useEnquiriesStore();

  return useMutation({
    mutationFn: (enquiryId: string) => enquiriesService.markEnquiryAsUnread(enquiryId),
    onSuccess: (_, enquiryId) => {
      // Update both enquiries and agistment-enquiries queries
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'agistment-enquiries'
      });

      // Update the store immediately
      const updatedEnquiries = enquiries.map(enquiry => 
        enquiry.id === enquiryId ? { ...enquiry, read: false } : enquiry
      );
      setEnquiries(updatedEnquiries);
    }
  });
};

export const useUpdateEnquiryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enquiryId, update }: { enquiryId: string; update: EnquiryStatusUpdate }) =>
      enquiriesService.updateEnquiryStatus(enquiryId, update),
    onSuccess: () => {
      // Update both enquiries and agistment-enquiries queries
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'agistment-enquiries'
      });
    }
  });
};
