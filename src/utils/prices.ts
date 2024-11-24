/**
 * Calculates the monthly price from a weekly price
 * Assumes 52 weeks per year divided by 12 months (4.333... weeks per month)
 */
export const calculateMonthlyPrice = (weeklyPrice: number): number => {
    const weeksPerMonth = 52 / 12; // approximately 4.333 weeks per month
    return Math.round(weeklyPrice * weeksPerMonth);
};
