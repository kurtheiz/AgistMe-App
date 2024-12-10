export const formatAvailabilityDate = (date: Date | string | null): string => {
    if (!date) {
        return "Now";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let availabilityDate: Date;
    if (typeof date === 'string') {
        // Handle YYYY-MM-DD format
        const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
        availabilityDate = new Date(year, month - 1, day); // month is 0-based in JS Date
    } else {
        availabilityDate = new Date(date);
    }
    
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

export const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) {
        return '';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

export const formatRelativeDate = (date: string | Date | null | undefined): string => {
    if (!date) {
        return '';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    // Reset hours to compare just the dates
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateObj);
    compareDate.setHours(0, 0, 0, 0);

    // Calculate the difference in days
    const diffTime = today.getTime() - compareDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else {
        return dateObj.toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
};

export const formatNotificationDate = (date: string | Date | null | undefined): string => {
    if (!date) {
        return '';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    
    const diffTime = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return dateObj.toLocaleDateString('en-AU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
};
