import type { BookingRequest, AvailabilitySlot } from '$lib/types';
import { format, startOfMonth, endOfMonth, parseISO, subMonths, addMonths, isBefore, startOfDay, max, addMinutes, getMinutes, startOfMinute, setMinutes, isAfter } from 'date-fns';

type BookingStep = 'calendar' | 'time' | 'form' | 'success';

export class BookingState {
    step = $state<BookingStep>('calendar');
    selectedDate = $state<Date | null>(null);
    loading = $state(false);
    error = $state<string | null>(null);
    availability = $state<AvailabilitySlot[]>([]);

    // !TODO: make timezone dynamic from user list
    timeZone = $state(Intl.DateTimeFormat().resolvedOptions().timeZone);
    availableDays = $state<Set<string>>(new Set());
    monthLoading = $state(false);

    // URL-Driven State - previous was selectDate and selectSlot
    viewDate = $state(new Date()); // The month being viewed
    // Store the raw time string from URL (e.g. "14:30") to allow display before slot hydration
    selectedTime = $state<string | null>(null);

    // Derived State: Automatically find the slot when availablity loads
    selectedSlot = $derived(
        this.selectedTime
            ? this.availability.find(s => s.start.includes(`T${this.selectedTime}`)) || null
            : null
    );

    private loadingTimer: ReturnType<typeof setTimeout> | null = null;
    private lastFetchedMonthStr: string | null = null;

    constructor() { }

    // Sync state from URL parameters
    syncState(params: { viewMonth: Date; selectedDate: Date | null; selectedTime: string | null }) {
        // 1. Update View Month
        if (!this.lastFetchedMonthStr || this.lastFetchedMonthStr !== format(params.viewMonth, 'yyyy-MM')) {
            this.viewDate = params.viewMonth;
            this.fetchMonthAvailability(this.viewDate);
            this.lastFetchedMonthStr = format(params.viewMonth, 'yyyy-MM');
        }

        // 2. Update Selected Date
        if (params.selectedDate) {
            // Only update if different to avoid refetching slots unnecessarily
            if (!this.selectedDate || format(this.selectedDate, 'yyyy-MM-dd') !== format(params.selectedDate, 'yyyy-MM-dd')) {
                this.selectedDate = params.selectedDate;
                this.fetchAvailability(this.selectedDate);
            }
        } else {
            this.selectedDate = null;
            this.availability = [];
        }

        // 3. Update Selected Time / Step
        if (params.selectedTime) {
            this.selectedTime = params.selectedTime;
            // selectedSlot will derive automatically

            // If we have a time, we go to form.
            this.step = 'form';
        } else {
            this.selectedTime = null;
            // derived selectedSlot auto-clears

            if (this.selectedDate) {
                this.step = 'time';
            } else {
                this.step = 'calendar';
            }
        }
    }

    async fetchMonthAvailability(date: Date) {
        // Debounce loading state: only show if request takes > 1000ms
        if (this.loadingTimer) clearTimeout(this.loadingTimer);
        this.loadingTimer = setTimeout(() => {
            this.monthLoading = true;
        }, 1000);

        try {
            // Fetch previous, current, and next month to support navigation hints
            // Ensure we don't query for dates in the past
            const today = startOfDay(new Date());
            const idealStart = startOfMonth(subMonths(date, 1));

            const start = max([idealStart, today]);
            const end = endOfMonth(addMonths(date, 1));

            // If start is after end (e.g. looking at deep past history?), abort
            if (isBefore(end, start)) {
                this.availableDays = new Set();
                return;
            }

            const startStr = format(start, "yyyy-MM-dd");
            const endStr = format(end, "yyyy-MM-dd");

            const res = await fetch(`/api/availability?start=${startStr}&end=${endStr}`);
            if (!res?.ok) return; // Silent fail could add toasts

            const data: AvailabilitySlot[] = await res.json();

            // We'll add to the existing set instead of replacing it, to cache visited months
            // But for simplicity/freshness, will replace
            const newDays: Set<string> = new Set(); //this.availableDays

            data.forEach(slot => {
                const slotDate = parseISO(slot.start);
                // Double check filtering (though API should handle query params, good to be safe)
                if (!isBefore(slotDate, today)) {
                    newDays.add(format(slotDate, "yyyy-MM-dd"));
                }
            });
            this.availableDays = newDays;
        } catch (e) {
            console.error("Failed to fetch month availability", e);
        } finally {
            if (this.loadingTimer) clearTimeout(this.loadingTimer);
            this.monthLoading = false;
        }
    }

    async fetchAvailability(date: Date) {
        this.loading = true;
        this.error = null;
        this.availability = []; // Clears derived selectedSlot

        try {
            const startStr = format(date, "yyyy-MM-dd");
            const endStr = format(date, "yyyy-MM-dd");

            const res = await fetch(`/api/availability?start=${startStr}&end=${endStr}`);
            if (!res?.ok) throw new Error(await res?.text());

            const ranges: AvailabilitySlot[] = await res?.json();

            // Process ranges into 30 minute slots starting every 15 minutes
            // magic numbers removed
            const SLOT_DURATION_MIN = 30;
            const SLOT_STEP_MIN = 15;

            const slots: AvailabilitySlot[] = [];

            for (const range of ranges) {
                let start = parseISO(range.start);
                const end = parseISO(range.end);

                // Round start up to next 15-minute boundary
                const minutes = getMinutes(start);
                const roundedMinutes = Math.ceil(minutes / SLOT_STEP_MIN) * SLOT_STEP_MIN;
                start = setMinutes(start, roundedMinutes);
                start = startOfMinute(start);

                // Latest possible start that still fits a 30-min slot
                const lastStart = addMinutes(end, -SLOT_DURATION_MIN);

                if (!isBefore(start, end) || !isBefore(start, addMinutes(end, 1))) {
                    continue;
                }

                while (!isAfter(start, lastStart)) {
                    const slotEnd = addMinutes(start, SLOT_DURATION_MIN);

                    slots.push({
                        start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
                        end: format(slotEnd, "yyyy-MM-dd'T'HH:mm:ss")
                    });

                    start = addMinutes(start, SLOT_STEP_MIN);
                }
            }
            // This logic for splitting up the time could be anything.. round to 30 min slots, only round if time isnt even, etc. 

            this.availability = slots; // Populates derived selectedSlot (if match)
        } catch (e) {
            console.error(e);
            this.error = "Failed to load availability. Please try again.";
        } finally {
            this.loading = false;
        }
    }

    reset() {
        this.step = 'calendar';
        this.selectedDate = null;
        this.selectedTime = null;
        // selectedSlot auto-clears
        this.error = null;
        this.availability = [];
    }

    async bookMeeting(attendee: { name: string; email: string }) {
        if (!this.selectedSlot) return this.error = "Time Slot is not available";

        this.loading = true;
        this.error = null;

        const payload: BookingRequest = {
            start: format(parseISO(this.selectedSlot.start), "yyyy-MM-dd'T'HH:mm:ssXXX"),
            end: format(parseISO(this.selectedSlot.end), "yyyy-MM-dd'T'HH:mm:ssXXX"),
            attendees: [attendee]
        };

        try {
            const res = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Booking failed');
            }

            this.step = 'success';
        } catch (e: any) {
            console.error(e);
            this.error = e.message || "Failed to book meeting.";
        } finally {
            this.loading = false;
        }
    }
}

export const bookingState = new BookingState();
