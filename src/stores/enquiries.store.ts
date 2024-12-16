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
}

export const useEnquiriesStore = create<EnquiriesState>((set, get) => ({
  enquiries: [],
  isLoading: false,
  setEnquiries: (enquiries) => set({ enquiries }),
  setIsLoading: (isLoading) => set({ isLoading }),

  fetchEnquiries: async (queryClient?: QueryClient) => {
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
    try {
      await enquiriesService.markEnquiryAsRead(enquiryId);
      
      // Update local state
      const updatedEnquiries = get().enquiries.map(enquiry => 
        enquiry.id === enquiryId ? { ...enquiry, read: true } : enquiry
      );
      set({ enquiries: updatedEnquiries });

      // Update query cache if available
      if (queryClient) {
        queryClient.setQueryData(['enquiries'], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            enquiries: oldData.enquiries.map((enquiry: EnquiryResponse) =>
              enquiry.id === enquiryId ? { ...enquiry, read: true } : enquiry
            )
          };
        });
      }
    } catch (error) {
      console.error('Error marking enquiry as read:', error);
      throw error;
    }
  }
}));
