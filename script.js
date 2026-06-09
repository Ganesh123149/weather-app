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
