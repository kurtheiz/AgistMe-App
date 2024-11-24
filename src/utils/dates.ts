export const formatAvailabilityDate = (date: Date | null): string => {
    if (!date) {
        return "Now";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const availabilityDate = new Date(date);
    availabilityDate.setHours(0, 0, 0, 0);

    if (availabilityDate <= today) {
        return "Now";
    }

    return availabilityDate.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};
