
import type { PageLoad } from './$types';
import { parseISO, isValid, startOfMonth, format } from 'date-fns';

export const load: PageLoad = ({ url }) => {
    const monthParam = url.searchParams.get('month');
    const dayParam = url.searchParams.get('day');
    const timeParam = url.searchParams.get('time');

    let viewMonth = new Date();
    if (monthParam) {
        const parsed = parseISO(monthParam + '-01'); // Ensure YYYY-MM becomes YYYY-MM-01
        if (isValid(parsed)) {
            viewMonth = startOfMonth(parsed);
        }
    }

    let selectedDate: Date | null = null;
    if (dayParam) {
        const parsed = parseISO(dayParam);
        // Basic validation: is it a valid date?
        if (isValid(parsed)) {
            selectedDate = parsed;

            // In the future, I would validate this input times to ensure they are valid times for the selected date.
            // and then after available times are fetched, ensure a "time" is valid.
        }
    }

    let selectedTime: string | null = null;
    if (timeParam) {
        // Simple validation, but just pass through for now
        selectedTime = timeParam;
    }

    return {
        viewMonth,
        selectedDate,
        selectedTime
    };
};
