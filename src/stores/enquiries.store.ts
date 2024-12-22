import { create } from 'zustand';
import { enquiriesService } from '../services/enquiries.service';
import { EnquiriesResponse, EnquiryResponse } from '../types/enquiry';
import { QueryClient } from '@tanstack/react-query';

interface EnquiriesState {
  enquiries: EnquiryResponse[];
  isLoading: boolean;
  setEnquiries: (enquiries: EnquiryResponse[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchEnquiries: (queryClient?: QueryClient) => Promise<EnquiriesResponse>;
  fetchAgistmentEnquiries: (agistmentId: string, queryClient?: QueryClient) => Promise<EnquiriesResponse>;
  markAsRead: (enquiryId: string, queryClient?: QueryClient) => Promise<void>;
  markAsUnread: (enquiryId: string, queryClient?: QueryClient) => Promise<void>;
  acknowledgeEnquiry: (enquiryId: string, queryClient?: QueryClient) => Promise<void>;
}

export const useEnquiriesStore = create<EnquiriesState>((set, get) => ({
  enquiries: [],
  isLoading: false,
  setEnquiries: (enquiries) => set({ enquiries }),
  setIsLoading: (isLoading) => set({ isLoading }),

  fetchEnquiries: async (queryClient?: QueryClient) => {
    const { isLoading } = get();
    if (isLoading) {
      return { enquiries: get().enquiries };
    }

    set({ isLoading: true });
    try {
      const response = await enquiriesService.getEnquiries();
      set({ enquiries: response.enquiries });

      if (queryClient) {
        queryClient.setQueryData(['enquiries'], response);
      }

      return response;
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAgistmentEnquiries: async (agistmentId: string, queryClient?: QueryClient) => {
    const { isLoading } = get();
    if (isLoading) {
      return { enquiries: get().enquiries };
    }

    set({ isLoading: true });
    try {
      const response = await enquiriesService.getAgistmentEnquiries(agistmentId);
      set({ enquiries: response.enquiries });

      if (queryClient) {
        queryClient.setQueryData(['agistment-enquiries', agistmentId], response);
      }

      return response;
    } catch (error) {
      console.error('Error fetching agistment enquiries:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (enquiryId: string, queryClient?: QueryClient) => {
    const { enquiries } = get();
    try {
      await enquiriesService.updateEnquiryStatus(enquiryId, { read: true });

      // Update local state
      const updatedEnquiries = enquiries.map(enquiry =>
        enquiry.id === enquiryId ? { ...enquiry, read: true } : enquiry
      );
      set({ enquiries: updatedEnquiries });

      // Update query cache if queryClient is provided
      if (queryClient) {
        queryClient.setQueryData(['enquiries'], { enquiries: updatedEnquiries });
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'agistment-enquiries'
        });
      }
    } catch (error) {
      console.error('Error marking enquiry as read:', error);
      throw error;
    }
  },

  markAsUnread: async (enquiryId: string, queryClient?: QueryClient) => {
    const { enquiries } = get();
    try {
      await enquiriesService.updateEnquiryStatus(enquiryId, { read: false });

      // Update local state
      const updatedEnquiries = enquiries.map(enquiry =>
        enquiry.id === enquiryId ? { ...enquiry, read: false } : enquiry
      );
      set({ enquiries: updatedEnquiries });

      // Update query cache if queryClient is provided
      if (queryClient) {
        queryClient.setQueryData(['enquiries'], { enquiries: updatedEnquiries });
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'agistment-enquiries'
        });
      }
    } catch (error) {
      console.error('Error marking enquiry as unread:', error);
      throw error;
    }
  },

  acknowledgeEnquiry: async (enquiryId: string, queryClient?: QueryClient) => {
    const { enquiries } = get();
    try {
      await enquiriesService.updateEnquiryStatus(enquiryId, { status: 'ACKNOWLEDGED' });

      // Update local state
      const updatedEnquiries = enquiries.map(enquiry =>
        enquiry.id === enquiryId ? { ...enquiry, status: 'ACKNOWLEDGED' } : enquiry
      );
      set({ enquiries: updatedEnquiries });

      // Update query cache if queryClient is provided
      if (queryClient) {
        queryClient.setQueryData(['enquiries'], { enquiries: updatedEnquiries });
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === 'agistment-enquiries'
        });
      }
    } catch (error) {
      console.error('Error acknowledging enquiry:', error);
      throw error;
    }
  }
}));
