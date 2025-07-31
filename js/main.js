// || TOGGLE HAMBURGER BAR
const hamburger = document.querySelector(".hamburger");
const slidebar = document.querySelector(".slidebar");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  if (!slidebar.classList.contains("active")) {
    slidebar.style.opacity = 0;
    slidebar.style.transform = "translateX(100%)";
    setTimeout(() => {
      slidebar.classList.add("active");
      slidebar.style.opacity = 1;
      slidebar.style.transform = "translateX(0%)";
    }, 50);
  } else {
    slidebar.classList.remove("active");
  }
});

const city = document.getElementById("city");
const country = document.getElementById("country");
const searchCity = document.getElementById("search");
const cityTemp = document.getElementById("temp");
const weatherIcon = document.getElementById("weather-icon");
const weatherDescription = document.getElementById("description");
const weatherPressure = document.getElementById("pressure");
const weatherVisibilty = document.getElementById("visibility");
const weatherHumidity = document.getElementById("humidity");
const sunriseTime = document.getElementById("sunrise-time");
const sunsetTime = document.getElementById("sunset-time");
const uviRays = document.getElementById("uvi-rays");
const uviConcernLevel = document.querySelector(".uvi-level");
const uviConcernLevel2 = document.querySelector(".uvi-level2");
const hoursIcon = document.querySelectorAll(".hourly-icon");
const hoursTemp = document.querySelectorAll(".hours-temp");
const daysIcon = document.querySelectorAll(".days-icon");
const nextDay = document.querySelectorAll(".prediction-day");
const predictionDesc = document.querySelectorAll(".prediction-desc");
const daysTemp = document.querySelectorAll(".days-temp");
const currentTime = document.querySelector(".time");
const currentDate = document.querySelector(".date");
const aqiValue = document.getElementById("aqi-value");
const aqiStatus = document.getElementById("aqi-status");

let responseData;
const monthName = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
const weekDays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];

async function weatherReport(searchCity) {
  try {
    const weatherApi = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=da2103b2c4ce4f95af051626232503&q=${searchCity}&days=7&aqi=yes&alerts=no`
    );
    responseData = await weatherApi.json();
    todayWeatherReport();
    hoursWeatherReport();
    forecastdayReport();
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    alert("Error loading weather. Try again.");
  }
}

function todayWeatherReport() {
  city.innerHTML = responseData.location.name;
  country.innerHTML = '<i class="fa-sharp fa-solid fa-location-dot"></i> ' + responseData.location.country;

  cityTemp.innerHTML = responseData.current.temp_c;
  weatherDescription.innerHTML = responseData.current.condition.text;
  weatherIcon.setAttribute("src", responseData.current.condition.icon);
  weatherPressure.innerHTML = responseData.current.pressure_mb + "mb";
  weatherVisibilty.innerHTML = responseData.current.vis_km + " km";
  weatherHumidity.innerHTML = responseData.current.humidity + "%";

  const aqiIndex = responseData.current.air_quality?.["us-epa-index"];
  if (aqiIndex) {
    aqiValue.innerHTML = aqiIndex;
    const aqiLabels = ["Good", "Moderate", "Unhealthy (Sensitive)", "Unhealthy", "Very Unhealthy", "Hazardous"];
    const colors = ["#6ae17c", "#c6e16a", "#e1b16a", "#e16a6a", "#d43114", "#860000"];
    aqiStatus.innerHTML = aqiLabels[aqiIndex - 1] || "Unknown";
    aqiStatus.style.color = "#fff";
    aqiStatus.style.padding = "2px 8px";
    aqiStatus.style.borderRadius = "8px";
    aqiStatus.style.backgroundColor = colors[aqiIndex - 1] || "#999";
  } else {
    aqiValue.innerHTML = "--";
    aqiStatus.innerHTML = "Unavailable";
  }

  sunriseTime.innerHTML = responseData.forecast.forecastday[0].astro.sunrise;
  sunsetTime.innerHTML = responseData.forecast.forecastday[0].astro.sunset;
  uviRays.innerHTML = responseData.current.uv + " UVI";
  checkUVraysIndex();
  updateTime();
}

function checkUVraysIndex() {
  let uviLevel = parseInt(uviRays.textContent);
  if (uviLevel <= 2) checkUviValue("Good", "#6ae17c");
  else if (uviLevel <= 5) checkUviValue("Moderate", "#CCE16A");
  else if (uviLevel <= 7) checkUviValue("High", "#d4b814");
  else if (uviLevel <= 10) checkUviValue("Very high", "#d43114");
  else checkUviValue("Extreme high", "#dc15cf");
}

function checkUviValue(level, color) {
  uviConcernLevel.innerHTML = level;
  uviConcernLevel.style.backgroundColor = color;
  uviConcernLevel2.innerHTML = level;
}

function hoursWeatherReport() {
  hoursTemp.forEach((t, i) => {
    if (responseData.forecast.forecastday[0].hour[i]) {
      t.innerHTML = responseData.forecast.forecastday[0].hour[i].temp_c + " °c";
    }
  });
  hoursIcon.forEach((t, i) => {
    if (responseData.forecast.forecastday[0].hour[i]) {
      t.src = responseData.forecast.forecastday[0].hour[i].condition.icon;
    }
  });
}

function forecastdayReport() {
  daysIcon.forEach((icon, index) => {
    icon.src = responseData.forecast.forecastday[index].day.condition.icon;
  });

  daysTemp.forEach((temp, index) => {
    temp.innerHTML =
      Math.round(responseData.forecast.forecastday[index].day.maxtemp_c) + "°c <span>/</span> " +
      Math.round(responseData.forecast.forecastday[index].day.mintemp_c) + "°c";
  });

  predictionDesc.forEach((d, index) => {
    d.innerHTML = responseData.forecast.forecastday[index].day.condition.text;
  });

  nextDay.forEach((day, index) => {
    let dateObj = new Date(responseData.forecast.forecastday[index].date);
    day.innerHTML = `${weekDays[dateObj.getDay()]} ${dateObj.getDate()}`;
  });
}

function updateTime() {
  const timezone = responseData.location?.tz_id;
  const now = new Date().toLocaleTimeString("en-US", { timeZone: timezone });
  currentTime.innerHTML = now;

  const today = new Date(responseData.forecast.forecastday[0].date);
  currentDate.innerHTML = `${today.getDate()} ${monthName[today.getMonth()]} ${today.getFullYear()}, ${weekDays[today.getDay()]}`;
}

setInterval(updateTime, 1000);

document.querySelector(".search-area button").addEventListener("click", function () {
  weatherReport(searchCity.value);
});
searchCity.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    weatherReport(searchCity.value);
  }
});

// DARK MODE
document.addEventListener('DOMContentLoaded', function () {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const darkModeText = document.getElementById('darkModeText');

  if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
    darkModeText.textContent = 'Light Mode';
  }

  darkModeToggle.addEventListener('change', function () {
    document.body.classList.toggle('dark-mode');
    darkModeText.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('dark-mode', darkModeToggle.checked ? 'enabled' : null);
  });
});

// GEOLOCATION AUTO LOAD
window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError);
  } else {
    weatherReport("New Delhi");
  }
});

function onGeoSuccess(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
    .then(response => response.json())
    .then(data => {
      const detectedCity = data.address.city || data.address.town || data.address.village;
      weatherReport(detectedCity || "New Delhi");
    })
    .catch(() => weatherReport("New Delhi"));
}

function onGeoError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  weatherReport("New Delhi");
}
