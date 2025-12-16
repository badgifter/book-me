<script lang="ts">
    import { bookingState } from "$lib/state/booking.svelte";
    import { format, parseISO } from "date-fns";
    import Button from "./ui/Button.svelte";
    import Input from "./ui/Input.svelte";
    import Icon from "./ui/Icon.svelte";
    import TimeZoneIndicator from "./ui/TimeZoneIndicator.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let name = $state("");
    let email = $state("");
    let errors = $state<{ name?: string; email?: string }>({});

    function validate() {
        errors = {};
        let isValid = true;

        const nameParts = name.trim().split(/\s+/);
        if (nameParts.length < 2) {
            errors.name = "Please enter your First and Last name";
            isValid = false;
        }

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Valid email is required";
            isValid = false;
        }

        return isValid;
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        if (!validate()) return;

        await bookingState.bookMeeting({ name, email });
    }

    // Construct the date object from selectedDate and selectedTime
    let selectedStart = $derived.by(() => {
        if (!bookingState.selectedDate) return new Date(); // Fallback

        const dateStr = format(bookingState.selectedDate, "yyyy-MM-dd");
        // use selectedSlot if available (verified), otherwise use raw selectedTime
        if (bookingState.selectedSlot) {
            return parseISO(bookingState.selectedSlot.start);
        } else if (bookingState.selectedTime) {
            return parseISO(`${dateStr}T${bookingState.selectedTime}:00`);
        }

        return bookingState.selectedDate;
    });

    function handleBack() {
        const url = new URL($page.url);
        url.searchParams.delete("time");
        goto(url.toString(), { keepFocus: true, noScroll: true });
    }
</script>

<div class="h-full flex flex-col">
    <div class="mb-6">
        <button
            class="text-sm text-gray-500 hover:text-indigo-600 flex items-center mb-2 transition-colors"
            onclick={handleBack}
        >
            <Icon name="left-chevron" class="w-4 h-4 mr-1" />
            Back
        </button>
        <h3 class="text-lg font-semibold text-gray-800">Enter Details</h3>
        <p class="text-sm text-gray-500">
            {format(selectedStart, "EEEE, MMMM do")} at {format(
                selectedStart,
                "h:mm a",
            )}
        </p>
        <TimeZoneIndicator />
    </div>

    <form onsubmit={handleSubmit} class="space-y-4 flex-1">
        <Input
            id="name"
            label="Your Full Name"
            placeholder="John Doe"
            bind:value={name}
            error={errors.name}
        />

        <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            bind:value={email}
            error={errors.email}
        />

        {#if bookingState.error}
            <div class="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {bookingState.error}
            </div>
        {/if}

        <div class="pt-4">
            <Button type="submit" class="w-full" loading={bookingState.loading}>
                Schedule Meeting
            </Button>
        </div>
    </form>
</div>
