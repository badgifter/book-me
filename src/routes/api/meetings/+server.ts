import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { BookingRequest } from '$lib/types';

const BASE_URL = 'https://calendar.meetchase.ai/api/meetings';

export const POST: RequestHandler = async ({ request, fetch }) => {
    try {
        const body: BookingRequest = await request.json();

        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Booking failed:', error);
            return json({ error }, { status: response.status });
        }

        const data = await response.json();
        return json(data);
    } catch (e) {
        console.error('Error creating meeting:', e);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
