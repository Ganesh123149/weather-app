# Weather App
A responsive weather app you can publish with GitHub Pages. It uses the free Open-Meteo geocoding and forecast APIs, so no API key is needed.
## Features
- Search weather by city
- Current temperature, condition, wind, humidity, feels-like, and rain chance
- Today high, low, sunrise, and sunset
- 7-day forecast
- Celsius and Fahrenheit toggle
- Mobile-friendly layout
## Run locally
Open `index.html` in a browser, or run a tiny local server:
```bash
python3 -m http.server 8000
...
Then visit:
```text
http://localhost:8000
```
## Publish on GitHub Pages
1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md`.
3. Open the repository settings.
4. Go to **Pages**.
5. Set the source to the `main` branch and `/root`.
6. Save, then open the URL GitHub provides.
