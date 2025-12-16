import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Calendar from './Calendar.svelte';
import { bookingState } from '$lib/state/booking.svelte';
import { addMonths, subMonths, format } from 'date-fns';

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


describe('Calendar Component', () => {
    let container: HTMLElement | null = null;
    let component: Record<string, any> | null = null;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        // Reset state
        bookingState.viewDate = new Date();
        bookingState.availability = [];
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

    it('renders current month header', () => {
        component = mount(Calendar, { target: container! });
        const header = container!.querySelector('h2');
        expect(header?.textContent).toBe(format(new Date(), 'MMMM yyyy'));
    });

    it('navigates to next month on click', () => {
        component = mount(Calendar, { target: container! });

        const buttons = container!.querySelectorAll('button');
        const nextBtn = buttons[1];

        nextBtn.click();
        flushSync();

        const expectedDate = addMonths(new Date(), 1);
        const expectedMonthStr = format(expectedDate, 'yyyy-MM');

        expect(gotoMock).toHaveBeenCalled();
        const callArgs = gotoMock.mock.calls[0][0];
        expect(callArgs).toContain(`month=${expectedMonthStr}`);
    });

    it('navigates to prev month on click', () => {
        // Start a month ahead
        const viewDate = addMonths(new Date(), 1);
        bookingState.viewDate = viewDate;

        component = mount(Calendar, { target: container! });

        const buttons = container!.querySelectorAll('button');
        const prevBtn = buttons[0];

        prevBtn.click();
        flushSync();

        const expectedDate = subMonths(viewDate, 1);
        const expectedMonthStr = format(expectedDate, 'yyyy-MM');

        expect(gotoMock).toHaveBeenCalled();
        const callArgs = gotoMock.mock.lastCall![0];
        expect(callArgs).toContain(`month=${expectedMonthStr}`);
    });
});
