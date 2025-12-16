<script lang="ts">
    import { bookingState } from "$lib/state/booking.svelte";
    import { format, parseISO } from "date-fns";
    import Button from "./ui/Button.svelte";
    import Icon from "./ui/Icon.svelte";
    import {
        generateGoogleCalendarUrl,
        downloadIcsFile,
    } from "$lib/utils/calendar";
    import type { CalendarEvent } from "$lib/utils/calendar";

    // We should probably safeguard if selectedSlot is null, though we shouldn't get here if so.
    let start = $derived(
        bookingState.selectedSlot
            ? parseISO(bookingState.selectedSlot.start)
            : new Date(),
    );

    function getEventDetails(): CalendarEvent {
        const endDate = new Date(start.getTime() + 30 * 60000); // 30 min duration
        return {
            title: "Meeting with ACME Corp",
            description: "Sales Discovery Call regarding your product needs.",
            location: "Video Meeting",
            start: start,
            end: endDate,
        };
    }

    function addToGoogle() {
        const url = generateGoogleCalendarUrl(getEventDetails());
        window.open(url, "_blank");
    }

    function downloadIcs() {
        downloadIcsFile(getEventDetails());
    }
</script>

<div
    class="h-full flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-300"
>
    <!-- Success Icon -->
    <div
        class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"
    >
        <Icon name="check" class="w-8 h-8" />
    </div>

    <h2 class="text-2xl font-bold text-gray-900 mb-2">Authenticated!</h2>
    <p class="text-gray-600 mb-6">You are scheduled with ACME Corp.</p>

    <!-- Meeting Details Card -->
    <div
        class="bg-gray-50 rounded-lg p-5 mb-8 w-full border border-gray-100 shadow-sm"
    >
        <div class="flex flex-col gap-3">
            <div
                class="flex items-center justify-center text-gray-800 font-medium"
            >
                <Icon
                    name="calendar"
                    class="w-5 h-5 mr-3 text-indigo-500 shrink-0"
                />
                <span>{format(start, "EEEE, MMMM do, yyyy")}</span>
            </div>
            <div class="flex items-center justify-center text-gray-600">
                <Icon
                    name="clock"
                    class="w-5 h-5 mr-3 text-indigo-500 shrink-0"
                />
                <div class="flex items-center">
                    <span
                        >{format(start, "h:mm a")} - {format(
                            new Date(start.getTime() + 30 * 60000),
                            "h:mm a",
                        )}</span
                    >
                    <span class="text-xs text-gray-400 ml-2 pt-0.5"
                        >({bookingState.timeZone})</span
                    >
                </div>
            </div>
        </div>
    </div>

    <!-- Calendar Actions -->
    <div class="flex flex-col gap-3 w-full max-w-xs mb-8">
        <Button
            variant="outline"
            class="w-full justify-center"
            onclick={addToGoogle}
        >
            <Icon name="calendar" class="w-4 h-4 mr-2" />
            Add to Google Calendar
        </Button>
        <Button
            variant="outline"
            class="w-full justify-center"
            onclick={downloadIcs}
        >
            <Icon name="download" class="w-4 h-4 mr-2" />
            Download for Outlook/iCal
        </Button>
    </div>

    <button
        class="text-sm text-gray-400 hover:text-indigo-600 transition-colors"
        onclick={() => bookingState.reset()}
    >
        Book Another Meeting
    </button>
</div>
