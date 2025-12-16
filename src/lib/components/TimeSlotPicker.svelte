<script lang="ts">
    import { bookingState } from "$lib/state/booking.svelte";
    import { format, parseISO, isBefore } from "date-fns";
    import Button from "./ui/Button.svelte";
    import Icon from "./ui/Icon.svelte";
    import TimeZoneIndicator from "./ui/TimeZoneIndicator.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    // Sort slots by time just in case
    let sortedSlots = $derived(
        [...bookingState.availability].sort((a, b) =>
            a.start.localeCompare(b.start),
        ),
    );

    const now = new Date();

    function updateUrl(params: Record<string, string | null>) {
        const url = new URL($page.url);
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        });
        goto(url.toString(), { keepFocus: true, noScroll: true });
    }

    function handleBack() {
        // Clear day and time to go back to calendar view
        updateUrl({ day: null, time: null });
    }

    function handleSelect(slot: any) {
        const timeStr = format(parseISO(slot.start), "HH:mm");
        updateUrl({ time: timeStr });
    }
</script>

<div class="h-full flex flex-col">
    <div class="mb-4">
        <button
            class="md:hidden text-sm text-gray-500 hover:text-indigo-600 flex items-center mb-2 transition-colors"
            onclick={handleBack}
        >
            <Icon name="left-chevron" class="w-4 h-4 mr-1" />
            Back to Calendar
        </button>
        <h3 class="text-lg font-semibold text-gray-800">Available times</h3>
        <p class="text-sm text-gray-500">
            {#if bookingState.selectedDate}
                {format(bookingState.selectedDate, "EEEE, MMMM do")}
            {/if}
        </p>
        <TimeZoneIndicator />
    </div>

    {#if bookingState.loading}
        <div class="flex-1 flex items-center justify-center min-h-[200px]">
            <Icon name="spinner" class="animate-spin h-8 w-8 text-indigo-600" />
        </div>
    {:else if bookingState.error}
        <div
            class="flex-1 flex flex-col items-center justify-center text-center p-4"
        >
            <p class="text-red-500 mb-2">{bookingState.error}</p>
            {#if bookingState.selectedDate}
                <Button
                    variant="outline"
                    onclick={() =>
                        bookingState.fetchAvailability(
                            bookingState.selectedDate!,
                        )}
                >
                    Try Again
                </Button>
            {/if}
        </div>
    {:else if sortedSlots.length === 0}
        <div
            class="flex-1 flex items-center justify-center text-center p-4 min-h-[200px]"
        >
            <p class="text-gray-500">No slots available for this day.</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 gap-2 overflow-y-auto max-h-[400px] p-2">
            {#each sortedSlots as slot}
                {@const start = parseISO(slot.start)}
                {@const isPast = isBefore(start, now)}
                <Button
                    variant="outline"
                    class="w-full !justify-center gap-4 group hover:cursor-pointer hover:border-indigo-600/25 hover:ring-1 hover:ring-indigo-600 transition-all {isPast
                        ? 'opacity-50 cursor-not-allowed hover:border-gray-300 hover:ring-0'
                        : ''}"
                    disabled={isPast}
                    onclick={() => !isPast && handleSelect(slot)}
                >
                    <span class="font-medium {isPast ? 'text-gray-400' : ''}"
                        >{format(start, "h:mm a")}</span
                    >
                    <span
                        class="text-xs text-gray-400 {isPast
                            ? ''
                            : 'group-hover:text-indigo-500'}">30 min</span
                    >
                </Button>
            {/each}
        </div>
    {/if}
</div>
