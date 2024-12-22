import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { enquiriesService } from '../services/enquiries.service';
import { EnquiryRequest, EnquiryStatusUpdate, EnquiriesResponse } from '../types/enquiry';
import toast from 'react-hot-toast';
import { useEnquiriesStore } from '../stores/enquiries.store';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAgistor } from './useAgistor';

export const useEnquiries = () => {
  const { setEnquiries } = useEnquiriesStore();
  const { isSignedIn, isLoaded } = useAuth();
  const { isAgistor } = useAgistor();
  const queryClient = useQueryClient();

  const query = useQuery<EnquiriesResponse>({
    queryKey: ['enquiries'],
    queryFn: async () => {
      const response = await enquiriesService.getEnquiries();
      return response;
    },
    enabled: isLoaded && isSignedIn && isAgistor, // Only run query if user is an agistor
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    initialData: { enquiries: [] } // Provide initial data to prevent undefined
  });

  // Sync query data with store only if we have valid data
  useEffect(() => {
    if (query.data?.enquiries && !query.isError) {
      setEnquiries(query.data.enquiries);
    }
  }, [query.data?.enquiries, query.isError, setEnquiries]);

  // If auth isn't loaded yet, return loading state
  if (!isLoaded) {
    return {
      ...query,
      isLoading: true,
      data: { enquiries: [] }
    };
  }

  // If user isn't signed in or isn't an agistor, return empty state
  if (!isSignedIn || !isAgistor) {
    return {
      ...query,
      isLoading: false,
      data: { enquiries: [] }
    };
  }

  return query;
};

export const useAgistmentEnquiries = (agistmentId: string) => {
  const { setEnquiries } = useEnquiriesStore();
  const queryClient = useQueryClient();

  const query = useQuery<EnquiriesResponse>({
    queryKey: ['agistment-enquiries', agistmentId],
    queryFn: async () => {
      const response = await enquiriesService.getAgistmentEnquiries(agistmentId);
      return response;
    },
    enabled: !!agistmentId,
    initialData: { enquiries: [] }
  });

  // Sync query data with store only if we have valid data
  useEffect(() => {
    if (query.data?.enquiries && !query.isError) {
      setEnquiries(query.data.enquiries);
    }
  }, [query.data?.enquiries, query.isError, setEnquiries]);

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
