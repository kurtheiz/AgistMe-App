import { create } from 'zustand';
import { ReferenceData } from '../types/reference';

interface ReferenceStore {
  referenceData: ReferenceData | null;
  isLoading: boolean;
  error: string | null;
  setReferenceData: (data: ReferenceData) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReferenceStore = create<ReferenceStore>()((set) => ({
  referenceData: null,
  isLoading: false,
  error: null,
  setReferenceData: (data) => {
    console.log('Setting reference data:', data);
    set({ referenceData: data, error: null });
  },
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));

// Helper functions to read reference data
export const usePricingPlans = () => {
  const { referenceData } = useReferenceStore();
  return referenceData?.pricingPlans || [];
};

export const useRecommendedPlan = () => {
  const plans = usePricingPlans();
  return plans.find(plan => plan.recommended);
};

export const usePlanByName = (name: string) => {
  const plans = usePricingPlans();
  console.log('All plans:', plans);
  console.log('Looking for plan name:', name);
  return plans.find(plan => plan.name.toLowerCase() === name.toLowerCase());
};

export const usePlanPhotoLimit = (planName: string): number => {
  const plan = usePlanByName(planName);
  if (!plan) return 3;
  
  const features = plan.features;
  
  const photoFeature = features.find(feature => feature.key === 'propertyPhotos');
  
  if (photoFeature?.value && typeof photoFeature.value === 'object' && 'limit' in photoFeature.value) {
    const typedValue = photoFeature.value as any;
    return typedValue.included ? typedValue.limit : 3;
  }
  return 3;
};
