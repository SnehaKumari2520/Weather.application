# Weather App (Vite + React)

This is a small weather UI built with Vite and React. It displays current weather using WeatherAPI and includes a local icon-mapping fallback, a toggle to use the API's remote icon, and a debug panel for inspecting responses.



## Features implemented

- Search input: type a city and press Enter or click the search button to fetch current weather.
- Local icon mapping: maps WeatherAPI condition text to local icons in `src/assets/`.
- Remote icon toggle: checkbox lets you use WeatherAPI's provided icon URL instead of local images.
- Loading and error UI: shows status while fetching and displays error messages if the request fails.
- Debug panel: view raw API response and the chosen icon (for troubleshooting).

## Files of interest

- `src/components/Weather.jsx` — main component with fetch logic, icon mapping, and UI.
- `src/components/Weather.css` — component styles.
- `src/assets/` — local icon PNGs used by the mapper (clear, cloud, rain, drizzle, snow, humidity, wind, search).

## Troubleshooting

- Missing or invalid API key: if your key is missing or wrong you will see an error in the UI. Add `VITE_WEATHER_API_ID` to `.env` and restart Vite.
- CORS/network errors: check the browser console for fetch failures. WeatherAPI is typically accessible from browsers but network issues or firewall rules may block requests.
- Port conflicts: Vite will try alternate ports if the default is in use — check the terminal output for the actual URL.
- Remote icon not showing: some API icons are protocol-relative (start with `//`). The app prefixes them with `https:` to load safely. If your environment blocks external images, use local icons by keeping the toggle off.

