import { AgistmentResponse } from '../types/agistment';

/**
 * Formats a number as Australian currency without decimal places
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Formats a price with 2 decimal places and dollar sign
 */
export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Calculates the monthly price from a weekly price
 * Assumes 52 weeks per year divided by 12 months (4.333... weeks per month)
 */
export const calculateMonthlyPrice = (weeklyPrice: number | null | undefined): string => {
    if (!weeklyPrice) return '0';
    const weeksPerMonth = 52 / 12; // approximately 4.333 weeks per month
    return formatCurrency(Math.round(weeklyPrice * weeksPerMonth));
};

export class PriceUtils {
  static getPriceDisplay(
    agistment: AgistmentResponse,
    searchCriteria?: { paddockTypes?: ('Private' | 'Shared' | 'Group')[] }
  ): { price: string; subtext: string; minPrice: number; maxPrice: number } {
    // Get paddock types to check - either from search criteria or all types
    const typesToCheck = searchCriteria?.paddockTypes?.length 
      ? searchCriteria.paddockTypes 
      : ['Private', 'Shared', 'Group']

    // Count how many paddock types have spots available
    const availablePaddockCount = !searchCriteria?.paddockTypes?.length ? 
      (['Private', 'Shared', 'Group'] as const)
        .filter(type => {
          const paddocks = type === 'Private' ? agistment.paddocks?.privatePaddocks :
                         type === 'Shared' ? agistment.paddocks?.sharedPaddocks :
                         agistment.paddocks?.groupPaddocks;
          return paddocks && paddocks.totalPaddocks > 0;
        }).length : 0;

    // Get valid prices ONLY for the selected paddock types
    const validPrices = typesToCheck
      .flatMap(type => {
        // Only check the specific paddock type requested
        let paddocks;
        if (type === 'Private') {
          paddocks = agistment.paddocks?.privatePaddocks;
        } else if (type === 'Shared') {
          paddocks = agistment.paddocks?.sharedPaddocks;
        } else if (type === 'Group') {
          paddocks = agistment.paddocks?.groupPaddocks;
        }
        
        // Only return price if paddocks exist and have spots available
        if (paddocks && paddocks.totalPaddocks > 0 && paddocks.weeklyPrice > 0) {
          return [paddocks.weeklyPrice];
        }
        return [];
      })
      .sort((a, b) => a - b);

    const subtext = 'per week'

    if (validPrices.length === 0) {
      return { 
        price: 'Contact for price', 
        subtext: '',
        minPrice: -1,
        maxPrice: -1
      };
    }

    // If search criteria exists and only one paddock type, show exact price
    if (searchCriteria?.paddockTypes?.length === 1) {
      return { 
        price: `$${formatCurrency(validPrices[0])}`,
        subtext,
        minPrice: validPrices[0],
        maxPrice: validPrices[0]
      };
    }

    // Only one valid price - if no search criteria and only one paddock type has spots, don't show "From"
    if (!searchCriteria?.paddockTypes?.length && availablePaddockCount === 1) {
      return { 
        price: `$${formatCurrency(validPrices[0])}`,
        subtext,
        minPrice: validPrices[0],
        maxPrice: validPrices[0]
      };
    }

    // Multiple valid prices (only if not single paddock type search)
    if (validPrices.length > 1) {
      return { 
        price: `$${formatCurrency(Math.min(...validPrices))} - $${formatCurrency(Math.max(...validPrices))}`,
        subtext,
        minPrice: Math.min(...validPrices),
        maxPrice: Math.max(...validPrices)
      };
    }

    // Default case - show "From" price
    return { 
      price: `From $${formatCurrency(validPrices[0])}`,
      subtext,
      minPrice: validPrices[0],
      maxPrice: validPrices[0]
    };
  }
}
