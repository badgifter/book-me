## Install dependencies

```sh
pnpm install
```

## Run development server

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Run tests

```sh
pnpm run test
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deploy

App is deployed to [Vercel](https://book-me-six.vercel.app).

## Todo

- [ ] Add timezone support ( allow user to change tz )
- [ ] Add more error handling and toast notifications
- [ ] Add more validation on name and email and time data in url ( providing invalid date, time, etc will break the app)
- [ ] Add more tests & documentation

### Design choices

- Did not use mutltiple routes (/[month]/[day]/[time]) and went with a single page app with url params instead to avoid complexity.
    - Originally used no routes or url params, then realized it would be nice for a user to bookmark, come back, share or navigate through the UI to a specific time.
    - Routing would be nice for updating website title, favicon, etc. 
- I seperated the icon into components to dynamically load them, just to reduce initial bundle size. Wasn't really needed.
- Static timezone based on user's browser timezone. Didn't see a need to support multiple timezones for a test.
- Used just a beige background and default text/logo, could impliment a themed page and background per company, with a custom logo, meeting description, etc. Via api call to a backend service.
- Could have shown a full sized calendar on 1st load, but went with a split view in order to show the select a date to view message. Avoids shifting UI
- Didn't center the calendar or timeslot picker in order to keep UI simple and easy to follow for UX and in the future, a timezome selector would go under the calendar.
- Used "15 minute" slots for simplicity, but could be changed to any time slot length. Meetings are 30 minutes long, but the API returned open times with 15 minute increments. Seemed to be the best balance of simplicity and functionality.
- One input box for name instead of two, very annoying to have to type your name seperately, but did validate that "2+" names were provided.
- Email could have a regex validation, but stuck with html validation for simplicity. ( server side could validate the email is real before allowing as well )
- Timeslots show the starting time for a meeting, not the ending time, but does reiterate the duration. Why, having two time's in the UI is overwhelming, and the duration is already clear.
- Chose to use sveltekit's server side for accessing the api, instead of client side. Either would work, but using the sveltekit server side allows for a future update to the api, or use of a API key to access the api. Increases the round trip time, but reduces tech debt in the long run.
- Could have added an "effect" on success, but it seemed distracting, not needed. 
- Could add a way to cancel meetings, but not needed for a test.
- Could add a way to update meetings, but not needed for a test.
- I should use $derived to format dates, instead of using format() in the template and/or format it in the Class.


Overall, a simple calendar to book meetings with Acme. Works, smooth, mobile friendly, and easy to use. 