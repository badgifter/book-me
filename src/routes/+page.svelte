<script lang="ts">
    import { bookingState } from "$lib/state/booking.svelte";
    import Calendar from "$lib/components/Calendar.svelte";
    import TimeSlotPicker from "$lib/components/TimeSlotPicker.svelte";
    import BookingForm from "$lib/components/BookingForm.svelte";
    import SuccessView from "$lib/components/SuccessView.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    $effect(() => {
        bookingState.syncState(data);
    });

    let descriptionExpanded = $state(false);
    import { fade, fly } from "svelte/transition";

    // Responsive logic: On mobile, just stack them.
    // On desktop, split view
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div
        class="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
    >
        <!-- Sidebar / Company Info -->
        <div
            class="w-full md:w-1/3 bg-gray-900 p-8 text-white flex flex-col justify-between gap-8"
        >
            <div class="flex flex-col gap-8">
                <!-- Header Group -->
                <div class="flex flex-col gap-4">
                    <!-- Logo -->
                    <div
                        class="h-10 w-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl"
                    >
                        A
                    </div>

                    <div class="flex flex-col gap-2">
                        <h1 class="text-2xl font-bold">ACME Corp</h1>
                        <p class="text-gray-400">Sales Discovery Call</p>
                    </div>
                </div>

                <!-- Meeting Details -->
                <div class="flex flex-col gap-3 text-sm text-gray-300">
                    <div class="flex items-center gap-3">
                        <Icon name="clock" class="w-5 h-5 opacity-70" />
                        30 min
                    </div>
                    <div class="flex items-center text-gray-200 text-sm gap-3">
                        <Icon name="video" class="h-5 w-5 opacity-70" />
                        <span>Video Meeting</span>
                    </div>
                </div>

                <!-- About Meeting Section -->
                <div class="pt-6 border-t border-white/10">
                    <button
                        class="flex items-center justify-between w-full text-sm font-medium text-gray-200 md:cursor-default"
                        onclick={() =>
                            (descriptionExpanded = !descriptionExpanded)}
                    >
                        <span>About this meeting</span>
                        <Icon
                            name="left-chevron"
                            class="h-4 w-4 transform transition-transform md:hidden {descriptionExpanded
                                ? '-rotate-90'
                                : 'rotate-180'}"
                        />
                    </button>

                    <div
                        class="mt-3 text-sm text-gray-400 leading-relaxed overflow-y-auto max-h-[200px] pr-2 transition-all duration-300 md:block
                    {descriptionExpanded ? 'block' : 'hidden'}"
                    >
                        <p>
                            This discovery call is designed to understand your
                            team's specific needs and challenges. We'll explore
                            how our solutions can integrate with your existing
                            workflow and discuss potential strategies for
                            implementation. Please come prepared with any
                            questions you might have about our product suite.
                        </p>
                    </div>
                </div>
            </div>

            <div class="text-xs text-gray-500">© 2025 Bad Gifter</div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 p-6 relative overflow-hidden bg-white">
            {#if bookingState.step === "success"}
                <div in:fade={{ duration: 300 }} class="h-full">
                    <SuccessView />
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                    <!-- Left side of main content: Calendar -->
                    <!-- On mobile, this might be the only view initially -->
                    <div
                        class={bookingState.step === "calendar"
                            ? "block"
                            : "hidden md:block"}
                    >
                        <Calendar />
                    </div>

                    <!-- Right side: Time Picker or Form -->
                    <div
                        class="flex-1 h-full border-l border-gray-100 pl-8 md:pl-8"
                    >
                        {#if bookingState.step === "calendar"}
                            <div
                                class="h-full flex items-center justify-center text-gray-400 text-center px-4"
                            >
                                <p>Select a date to view availability</p>
                            </div>
                        {:else if bookingState.step === "time"}
                            <div
                                in:fly={{ x: 20, duration: 300 }}
                                class="h-full"
                            >
                                <TimeSlotPicker />
                            </div>
                        {:else if bookingState.step === "form"}
                            <div
                                in:fly={{ x: 20, duration: 300 }}
                                class="h-full"
                            >
                                <BookingForm />
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>
