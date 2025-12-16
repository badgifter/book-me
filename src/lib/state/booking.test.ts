import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookingState } from './booking.svelte';
import { addDays, addHours, format, startOfMonth } from 'date-fns';

// Mock fetch for availability
globalThis.fetch = vi.fn();

describe('BookingState', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Reset state
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
        bookingState.viewDate = new Date();
        bookingState.availability = [];
        bookingState.loading = false;
        bookingState.error = null;
        bookingState.step = 'calendar';
    });

    it('should initialize with default values', () => {
        expect(bookingState.step).toBe('calendar');
        expect(bookingState.selectedDate).toBeNull();
        expect(bookingState.selectedTime).toBeNull();
    });

    it('should update step based on selection via syncState', () => {
        const today = new Date();

        // Select Date -> moves to time
        bookingState.syncState({ viewMonth: today, selectedDate: today, selectedTime: null });
        expect(bookingState.step).toBe('time');

        // Select Time -> moves to form
        bookingState.syncState({ viewMonth: today, selectedDate: today, selectedTime: '10:00' });
        expect(bookingState.step).toBe('form');
    });

    it('should fetch availability', async () => {
        const mockSlots = [
            { start: '2023-10-10T10:00:00', end: '2023-10-10T10:30:00' }
        ];

        (globalThis.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockSlots
        });

        const date = new Date(2026, 1, 10); // Jan 10 2026
        await bookingState.fetchAvailability(date);

        expect(globalThis.fetch).toHaveBeenCalled();
        expect(bookingState.availability).toEqual(mockSlots);
        expect(bookingState.loading).toBe(false);
    });

    it('should handle fetch errors', async () => {
        (globalThis.fetch as any).mockResolvedValue({
            ok: false,
            text: async () => 'Error'
        });

        const date = new Date();
        await bookingState.fetchAvailability(date);

        expect(bookingState.error).toBe('Failed to load availability. Please try again.');
        expect(bookingState.loading).toBe(false);
    });
});
