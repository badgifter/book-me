
import { format } from "date-fns";

export interface CalendarEvent {
    title: string;
    description: string;
    start: Date;
    end: Date;
    location?: string;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
    const startStr = format(event.start, "yyyyMMdd'T'HHmmss");
    const endStr = format(event.end, "yyyyMMdd'T'HHmmss");

    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", event.title);
    url.searchParams.set("dates", `${startStr}/${endStr}`);
    url.searchParams.set("details", event.description);
    if (event.location) {
        url.searchParams.set("location", event.location);
    }

    return url.toString();
}

export function downloadIcsFile(event: CalendarEvent) {
    const startStr = format(event.start, "yyyyMMdd'T'HHmmss");
    const endStr = format(event.end, "yyyyMMdd'T'HHmmss");
    const nowStr = format(new Date(), "yyyyMMdd'T'HHmmss");

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Bad Gifter//Book Me//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `DTSTAMP:${nowStr}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
        event.location ? `LOCATION:${event.location}` : "",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
    ].filter(Boolean).join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link to download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "meeting.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
