# Install dependencies

```sh
pnpm install
```

# Run development server

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Run tests

```sh
npx playwright install    # might be needed
pnpm run test
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

# Deploy

App is deployed to [Vercel](https://vercel.com).

# Todo

- [ ] Add timezone support ( allow user to change tz )
- [ ] Add more error handling and toast notifications
- [ ] Add more validation on name and email and time data in url ( providing invalid date, time, etc will break the app)
- [ ] Add more tests & documentation
