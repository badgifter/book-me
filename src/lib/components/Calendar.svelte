<script lang="ts">
    import {
        format,
        addMonths,
        subMonths,
        startOfMonth,
        endOfMonth,
        startOfWeek,
        endOfWeek,
        eachDayOfInterval,
        isSameMonth,
        isSameDay,
        isToday,
        isBefore,
        startOfDay,
    } from "date-fns";
    import { bookingState } from "$lib/state/booking.svelte";
    import Icon from "./ui/Icon.svelte";

    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    // Use viewDate from state (synced from URL)
    let currentMonth = $derived(bookingState.viewDate);

    // Computed days for the grid
    let days = $derived.by(() => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

    function nextMonth() {
        const next = addMonths(currentMonth, 1);
        updateUrl({ month: format(next, "yyyy-MM") });
    }

    function prevMonth() {
        const prev = subMonths(currentMonth, 1);
        updateUrl({ month: format(prev, "yyyy-MM") });
    }

    function handleSelect(day: Date) {
        if (isBefore(day, startOfDay(new Date()))) return; // Disable past dates
        // Keep current month in URL to avoid jumping if day is in next month but we want to stay in view?
        updateUrl({
            day: format(day, "yyyy-MM-dd"),
            time: null, // Reset time when date changes
        });
    }

    // Check for availability in previous/next months for navigation hints
    let hasPrevAvailability = $derived.by(() => {
        const prevMonth = subMonths(currentMonth, 1);
        const daysInPrev = eachDayOfInterval({
            start: startOfMonth(prevMonth),
            end: endOfMonth(prevMonth),
        });
        return daysInPrev.some((day) =>
            bookingState.availableDays.has(format(day, "yyyy-MM-dd")),
        );
    });

    let hasNextAvailability = $derived.by(() => {
        const nextMonth = addMonths(currentMonth, 1);
        const daysInNext = eachDayOfInterval({
            start: startOfMonth(nextMonth),
            end: endOfMonth(nextMonth),
        });
        return daysInNext.some((day) =>
            bookingState.availableDays.has(format(day, "yyyy-MM-dd")),
        );
    });

    let isCurrentMonth = $derived(isSameMonth(currentMonth, new Date()));
</script>

<div
    class="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 relative min-h-[380px]"
>
    <!-- Loading Overlay -->
    {#if bookingState.monthLoading}
        <div
            class="absolute inset-0 bg-white/40 z-20 flex items-center justify-center transition-all duration-300 pointer-events-none"
        >
            <div
                class="bg-white/80 p-3 rounded-full shadow-lg backdrop-blur-sm"
            >
                <Icon
                    name="spinner"
                    class="animate-spin h-6 w-6 text-indigo-600"
                />
            </div>
        </div>
    {/if}

    <!-- Header -->
    <div
        class="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50"
    >
        <button
            class="p-2 rounded-lg transition-colors text-gray-600 relative
            {hasPrevAvailability && !isCurrentMonth
                ? 'bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100'
                : ''}
            {!hasPrevAvailability && !isCurrentMonth ? 'hover:bg-gray-200' : ''}
            {isCurrentMonth
                ? 'opacity-30 cursor-not-allowed text-gray-400'
                : ''}"
            onclick={prevMonth}
            disabled={isCurrentMonth}
            aria-label="Previous month"
        >
            <Icon name="left-chevron" class="h-5 w-5" />
        </button>
        <h2 class="text-lg font-semibold text-gray-800">
            {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
            class="p-2 rounded-lg transition-colors text-gray-600 relative
            {hasNextAvailability
                ? 'bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100'
                : 'hover:bg-gray-200'}"
            onclick={nextMonth}
            aria-label="Next month"
        >
            <Icon name="right-chevron" class="h-5 w-5" />
        </button>
    </div>

    <div class="p-4">
        <div class="grid grid-cols-7 mb-2">
            {#each weekDays as day}
                <div class="text-center text-xs font-medium text-gray-400 py-1">
                    {day}
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-7 gap-1">
            {#each days as day}
                {@const isSelected =
                    bookingState.selectedDate &&
                    isSameDay(day, bookingState.selectedDate)}
                {@const isCurrentMonth = isSameMonth(day, currentMonth)}
                {@const isDisabled = isBefore(day, startOfDay(new Date()))}
                {@const isTodayDate = isToday(day)}
                {@const dayStr = format(day, "yyyy-MM-dd")}
                {@const hasAvailability =
                    bookingState.availableDays.has(dayStr)}

                <!-- Render all days to keep grid stable, but gray out non-current month dates -->
                <button
                    class="
                        h-10 w-full rounded-lg text-sm transition-[background-color,color,transform,box-shadow] duration-200 relative
                        flex items-center justify-center
                        {isSelected
                        ? 'bg-indigo-600 text-white shadow-md scale-105 z-10 font-bold'
                        : ''}
                        {!isSelected && hasAvailability && isCurrentMonth
                        ? 'bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 hover:scale-105 cursor-pointer'
                        : ''}
                        {(!hasAvailability || !isCurrentMonth) &&
                    !isDisabled &&
                    !isSelected
                        ? 'text-gray-300 cursor-default'
                        : ''}
                        {isDisabled ? 'text-gray-200 cursor-not-allowed' : ''}
                    "
                    class:!opacity-0={!isCurrentMonth}
                    disabled={isDisabled ||
                        (!hasAvailability && !isSelected) ||
                        !isCurrentMonth}
                    onclick={() =>
                        hasAvailability && isCurrentMonth && handleSelect(day)}
                >
                    {format(day, "d")}
                    {#if isTodayDate && !isSelected && isCurrentMonth}
                        <span
                            class="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 h-1 w-1 bg-indigo-500 rounded-full"
                        ></span>
                    {/if}
                </button>
            {/each}
        </div>
    </div>
</div>
