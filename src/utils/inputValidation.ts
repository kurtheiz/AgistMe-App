/**
 * Input validation and formatting utilities
 */

/**
 * Validates if the input is a valid mobile number format (xxxxxxxxxx)
 * @param phoneNumber - The phone number to validate
 * @returns boolean indicating if the number is valid
 */
export const isValidAusMobileNumber = (phoneNumber: string): boolean => {
  // Remove any spaces or non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if the number matches the format xxxxxxxxxx (10 digits)
  const mobileRegex = /^\d{10}$/;
  return mobileRegex.test(cleanNumber);
};

/**
 * Formats a phone number input to mobile format (xxxxxxxxxx)
 * @param input - The raw input string
 * @returns The formatted phone number
 */
export const formatAusMobileNumber = (input: string): string => {
  // Remove all non-digit characters
  const digitsOnly = input.replace(/\D/g, '');
  
  // Return empty string if no digits
  if (digitsOnly.length === 0) return '';
  
  // Take only the first 10 digits
  return digitsOnly.slice(0, 10);
};

/**
 * Handles phone number input change and formats it
 * @param value - The current input value
 * @param onChange - Callback function to update the input value
 */
export const handlePhoneNumberChange = (
  value: string,
  onChange: (value: string) => void
): void => {
  const formattedNumber = formatAusMobileNumber(value);
  onChange(formattedNumber);
};

// Month names for date formatting
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Converts a UTC date string to local timezone and formats it as "d MMM yyyy"
 * @param utcDate - UTC date string (e.g., from API)
 * @returns Formatted date string (e.g., "20 Nov 2024")
 */
export const formatDateFromUTC = (utcDate: string): string => {
  try {
    const date = new Date(utcDate);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const day = date.getDate();
    const month = MONTHS[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Validates if a string is a valid date
 * @param dateString - The date string to validate
 * @returns boolean indicating if the date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Gets the current date in local timezone formatted as "d MMM yyyy"
 * @returns Current date string (e.g., "20 Nov 2024")
 */
export const getCurrentFormattedDate = (): string => {
  const now = new Date();
  const day = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Validates if a date of birth meets the age requirements:
 * - Not in the future
 * - Person is at least 13 years old
 * - Person is not older than 120 years
 * @param dateString - The date string to validate
 * @returns Object containing validation result and error message
 */
export const isValidDateOfBirth = (dateString: string): { isValid: boolean; error?: string } => {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  const now = new Date();
  
  // Check if date is in the future
  if (date > now) {
    return { isValid: false, error: 'Date cannot be in the future' };
  }

  // Calculate age
  const age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  const dayDiff = now.getDate() - date.getDate();
  const finalAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  // Check minimum age (13)
  if (finalAge < 13) {
    return { isValid: false, error: 'Must be at least 13 years old' };
  }

  // Check maximum age (120)
  if (finalAge > 120) {
    return { isValid: false, error: 'Age cannot exceed 120 years' };
  }

  return { isValid: true };
};

/**
 * Gets the maximum allowed date for date of birth (13 years ago from today)
 * @returns Date string in YYYY-MM-DD format
 */
export const getMaxDateOfBirth = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 13);
  return date.toISOString().split('T')[0];
};

/**
 * Gets the minimum allowed date for date of birth (120 years ago from today)
 * @returns Date string in YYYY-MM-DD format
 */
export const getMinDateOfBirth = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 120);
  return date.toISOString().split('T')[0];
};

/**
 * Example usage:
 * // For phone numbers
 * const [phoneNumber, setPhoneNumber] = useState('');
 * 
 * <input
 *   type="text"
 *   value={phoneNumber}
 *   onChange={(e) => handlePhoneNumberChange(e.target.value, setPhoneNumber)}
 *   placeholder="xxxxxxxxxx"
 * />
 * 
 * // For dates
 * const utcDate = "2024-11-20T00:00:00Z";
 * const formattedDate = formatDateFromUTC(utcDate); // "20 Nov 2024"
 */
