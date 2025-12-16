<script lang="ts">
    import { bookingState } from "$lib/state/booking.svelte";
    import Icon from "./Icon.svelte";

    // Future-proofing for "adjustability" as requested
    // For now, it just displays the state's timezone
</script>

<p class="text-xs text-gray-400 mt-1 flex items-center">
    <Icon name="clock" class="w-3 h-3 mr-1" />
    {bookingState.timeZone}
</p>
