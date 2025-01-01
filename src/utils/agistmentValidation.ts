import { AgistmentSearchResponse } from '../types/search';

export const validateBasicInfo = (agistment: AgistmentSearchResponse): boolean => {
  return !(!agistment.basicInfo?.name ||
    agistment.basicInfo.name.length < 3 ||
    agistment.basicInfo.name === 'New Agistment' ||
    !agistment.propertyLocation?.location?.suburb ||
    !agistment.propertyLocation?.location?.state ||
    !agistment.propertyLocation?.location?.region ||
    !agistment.propertyLocation?.location?.postcode);
};

export const validatePaddocks = (agistment: AgistmentSearchResponse): boolean => {
  return !!((agistment.paddocks?.privatePaddocks?.totalPaddocks ?? 0) > 0 ||
    (agistment.paddocks?.sharedPaddocks?.totalPaddocks ?? 0) > 0 ||
    (agistment.paddocks?.groupPaddocks?.totalPaddocks ?? 0) > 0);
};

export const validateCare = (agistment: AgistmentSearchResponse): boolean => {
  return !!(agistment.care?.selfCare?.available ||
    agistment.care?.partCare?.available ||
    agistment.care?.fullCare?.available);
};

export const validatePhotos = (agistment: AgistmentSearchResponse): boolean => {
  return !!(agistment.photoGallery?.photos && agistment.photoGallery.photos.length > 0);
};

export const validateSection = (agistment: AgistmentSearchResponse, section: 'header' | 'paddocks' | 'care' | 'photos'): boolean => {
  switch (section) {
    case 'header':
      return validateBasicInfo(agistment);
    case 'paddocks':
      return validatePaddocks(agistment);
    case 'care':
      return validateCare(agistment);
    case 'photos':
      return validatePhotos(agistment);
    default:
      return true;
  }
};
