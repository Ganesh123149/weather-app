const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const statusMessage = document.querySelector("#status-message");
const unitButtons = document.querySelectorAll(".unit-button");
const forecastGrid = document.querySelector("#forecast-grid");

const elements = {
  locationName: document.querySelector("#location-name"),
  conditionIcon: document.querySelector("#condition-icon"),
  currentTemp: document.querySelector("#current-temp"),
  currentUnit: document.querySelector("#current-unit"),
  conditionText: document.querySelector("#condition-text"),
  feelsLike: document.querySelector("#feels-like"),
  windSpeed: document.querySelector("#wind-speed"),
  humidity: document.querySelector("#humidity"),
  rainChance: document.querySelector("#rain-chance"),
  todayHigh: document.querySelector("#today-high"),
  todayLow: document.querySelector("#today-low"),
  sunrise: document.querySelector("#sunrise"),
  sunset: document.querySelector("#sunset"),
  updatedAt: document.querySelector("#updated-at"),
};

const weatherCodes = {
  0: ["Clear sky", "☀"],
  1: ["Mainly clear", "🌤"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁"],
  45: ["Fog", "🌫"],
  48: ["Rime fog", "🌫"],
  51: ["Light drizzle", "🌦"],
  53: ["Drizzle", "🌦"],
  55: ["Heavy drizzle", "🌧"],
  56: ["Freezing drizzle", "🌧"],
  57: ["Freezing drizzle", "🌧"],
  61: ["Light rain", "🌦"],
  63: ["Rain", "🌧"],
  65: ["Heavy rain", "🌧"],
  66: ["Freezing rain", "🌧"],
  67: ["Freezing rain", "🌧"],
  71: ["Light snow", "🌨"],
  73: ["Snow", "🌨"],
  75: ["Heavy snow", "❄"],
  77: ["Snow grains", "❄"],
  80: ["Rain showers", "🌦"],
  81: ["Rain showers", "🌧"],
  82: ["Heavy showers", "🌧"],
  85: ["Snow showers", "🌨"],
  86: ["Snow showers", "🌨"],
  95: ["Thunderstorm", "⛈"],
  96: ["Thunderstorm hail", "⛈"],
  99: ["Thunderstorm hail", "⛈"],
};

let activeUnit = "celsius";
let currentPlace = null;
let currentWeather = null;

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function getCondition(code) {
  return weatherCodes[code] ?? ["Unknown", "•"];
}

function formatTemp(value) {
  return `${Math.round(value)}°`;
}

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDay(value) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

async function getJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("The weather service could not complete the request.");
  }

  return response.json();
}

async function searchLocation(query) {
  const params = new URLSearchParams({
    name: query,
    count: "1",
    language: "en",
    format: "json",
  });
  const data = await getJson(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
  );

  if (!data.results?.length) {
    throw new Error("No matching city found. Try a nearby larger city.");
  }

  return data.results[0];
}

async function fetchWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
    temperature_unit: activeUnit,
    wind_speed_unit: activeUnit === "fahrenheit" ? "mph" : "kmh",
    timezone: "auto",
  });

  return getJson(`https://api.open-meteo.com/v1/forecast?${params}`);
}

function renderWeather(place, weather) {
  const current = weather.current;
  const daily = weather.daily;
  const [condition, icon] = getCondition(current.weather_code);
  const unitMark = activeUnit === "fahrenheit" ? "F" : "C";
  const windUnit = activeUnit === "fahrenheit" ? "mph" : "km/h";

  elements.locationName.textContent = [
    place.name,
    place.admin1,
    place.country,
  ]
    .filter(Boolean)
    .join(", ");
  elements.conditionIcon.textContent = icon;
  elements.currentTemp.textContent = Math.round(current.temperature_2m);
  elements.currentUnit.textContent = `°${unitMark}`;
  elements.conditionText.textContent = condition;
  elements.feelsLike.textContent = formatTemp(current.apparent_temperature);
  elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} ${windUnit}`;
  elements.humidity.textContent = `${current.relative_humidity_2m}%`;
  elements.rainChance.textContent = `${current.precipitation_probability ?? daily.precipitation_probability_max[0]}%`;
  elements.todayHigh.textContent = formatTemp(daily.temperature_2m_max[0]);
  elements.todayLow.textContent = formatTemp(daily.temperature_2m_min[0]);
  elements.sunrise.textContent = formatTime(daily.sunrise[0]);
  elements.sunset.textContent = formatTime(daily.sunset[0]);
  elements.updatedAt.textContent = `Updated ${formatTime(current.time)}`;

  forecastGrid.innerHTML = "";

  daily.time.forEach((day, index) => {
    const [label, dayIcon] = getCondition(daily.weather_code[index]);
    const card = document.createElement("article");
    card.className = "forecast-card";
    card.innerHTML = `
      <div>
        <p class="forecast-day">${formatDay(day)}</p>
        <div class="forecast-icon" aria-hidden="true">${dayIcon}</div>
      </div>
      <div>
        <strong>${formatTemp(daily.temperature_2m_max[index])} / ${formatTemp(daily.temperature_2m_min[index])}</strong>
        <span>${label}</span>
      </div>
    `;
    forecastGrid.append(card);
  });
}

async function loadWeather(query) {
  try {
    setStatus("Finding forecast...");
    const place = await searchLocation(query);
    const weather = await fetchWeather(place);

    currentPlace = place;
    currentWeather = weather;
    renderWeather(place, weather);
    setStatus("Forecast ready.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = cityInput.value.trim();

  if (query) {
    loadWeather(query);
  }
});

unitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeUnit = button.dataset.unit;
    unitButtons.forEach((unitButton) => {
      unitButton.classList.toggle("active", unitButton === button);
    });

    if (currentPlace) {
      fetchWeather(currentPlace)
        .then((weather) => {
          currentWeather = weather;
          renderWeather(currentPlace, currentWeather);
          setStatus("Units updated.");
        })
        .catch((error) => setStatus(error.message, true));
    }
  });
});

loadWeather("Mumbai");
