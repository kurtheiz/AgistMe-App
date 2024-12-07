export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return '?';
  
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return `${firstInitial}${lastInitial}` || firstName?.charAt(0).toUpperCase() || '?';
};
