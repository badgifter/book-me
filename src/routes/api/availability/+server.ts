import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const BASE_URL = 'https://calendar.meetchase.ai/api/availability';

export const GET: RequestHandler = async ({ url, fetch }) => {
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    if (!start || !end) {
        return json({ error: 'Missing start or end date' }, { status: 400 });
    }

    try {
        const response = await fetch(`${BASE_URL}?start=${start}&end=${end}`);

        if (!response.ok) {
            const error = await response.text();
            return json({ error }, { status: response.status });
        }

        const data = await response.json();
        return json(data);
    } catch (e) {
        console.error('Error fetching availability:', e);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
