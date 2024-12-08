import { AgistmentCare } from '../types/agistment';

export const buildCareOptionsString = (care: AgistmentCare): string => {
  const availableOptions: string[] = [];

  if (care.selfCare.available) {
    availableOptions.push('Self');
  }
  if (care.partCare.available) {
    availableOptions.push('Part');
  }
  if (care.fullCare.available) {
    availableOptions.push('Full');
  }

  return availableOptions.length > 0 ? availableOptions.join('/') : 'No care options';
};
