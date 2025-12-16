import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import TimeSlotPicker from './TimeSlotPicker.svelte';
import { bookingState } from '$lib/state/booking.svelte';
import { format, addHours, parseISO } from 'date-fns';

// Mock navigation
const gotoMock = vi.fn();
vi.mock('$app/navigation', () => ({
    goto: (url: string, opts: any) => gotoMock(url, opts)
}));

vi.mock('$app/stores', () => ({
    page: {
        subscribe: (fn: any) => {
            fn({ url: new URL('http://localhost/') });
            return () => { };
        }
    }
}));

describe('TimeSlotPicker Component', () => {
    let container: HTMLElement | null = null;
    let component: Record<string, any> | null = null;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        bookingState.loading = false;
        bookingState.error = null;
        bookingState.availability = [];
        gotoMock.mockReset();
    });

    afterEach(() => {
        if (component) {
            unmount(component);
        }
        if (container) {
            container.remove();
        }
        container = null;
        component = null;
    });

    it('shows error message', () => {
        bookingState.error = "Failed to load";
        component = mount(TimeSlotPicker, { target: container! });
        expect(container!.textContent).toContain('Failed to load');
    });

    it('shows no slots message', () => {
        bookingState.availability = [];
        component = mount(TimeSlotPicker, { target: container! });
        expect(container!.textContent).toContain('No slots available for this day');
    });

    it('renders list of slots', () => {
        const future = addHours(new Date(), 24);
        const start = format(future, "yyyy-MM-dd'T'HH:00:00");
        const end = format(future, "yyyy-MM-dd'T'HH:30:00");

        bookingState.availability = [
            { start, end }
        ];

        component = mount(TimeSlotPicker, { target: container! });

        const timeStr = format(parseISO(start), 'h:mm a');
        expect(container!.textContent).toContain(timeStr);
    });

    it('handles slot selection', () => {
        const future = addHours(new Date(), 24);
        const start = format(future, "yyyy-MM-dd'T'HH:00:00");
        const end = format(future, "yyyy-MM-dd'T'HH:30:00");

        bookingState.availability = [
            { start, end }
        ];

        component = mount(TimeSlotPicker, { target: container! });

        const timeStr = format(parseISO(start), 'h:mm a');

        // Find button containing the time
        const buttons = Array.from(container!.querySelectorAll('button'));
        const slotBtn = buttons.find(b => b.textContent?.includes(timeStr));

        expect(slotBtn).toBeDefined();
        slotBtn!.click();
        flushSync();

        expect(gotoMock).toHaveBeenCalled();
        const expectedTime = format(parseISO(start), 'HH:mm');
        const encodedTime = encodeURIComponent(expectedTime);
        expect(gotoMock.mock.calls[0][0]).toContain(`time=${encodedTime}`);
    });
});
