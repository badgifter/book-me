export interface AvailabilitySlot {
    start: string;
    end: string;
}

export interface BookingAttendee {
    name: string;
    email: string;
}

export interface BookingRequest {
    start: string;
    end: string;
    attendees: BookingAttendee[];
}

export interface AvailabilityResponse {
    slots: AvailabilitySlot[];
}
