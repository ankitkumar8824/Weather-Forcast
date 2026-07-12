const apiKey = '4ccf457981240aa4b02e9494c65f790c'; 

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const errorMsg = document.getElementById('error-msg');
const weatherBox = document.getElementById('weather-box');

const locationEl = document.getElementById('location');
const dateEl = document.getElementById('date');
const tempValEl = document.getElementById('temp-value');
const weatherDescEl = document.getElementById('weather-desc');
const weatherIconEl = document.getElementById('weather-icon');
const humidityValEl = document.getElementById('humidity-val');
const windValEl = document.getElementById('wind-val');
const forecastCardsContainer = document.getElementById('forecast-cards');

// Formats today's date nicely in the header
function updateDate() {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const today = new Date();
    dateEl.innerText = today.toLocaleDateString('en-US', options);
}

// Fetches live data from the API
async function checkWeather(city) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(currentWeatherUrl);
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        
        // Hide error message and show the weather box smoothly
        errorMsg.style.display = 'none';
        weatherBox.style.display = 'block';

        // Update UI with Live API values
        locationEl.innerText = `${data.name}, ${data.sys.country}`;
        tempValEl.innerText = Math.round(data.main.temp);
        weatherDescEl.innerText = data.weather[0].description;
        humidityValEl.innerText = `${data.main.humidity}%`;
        windValEl.innerText = `${Math.round(data.wind.speed * 3.6)} km/h`; 
        weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        // Immediately request the 5-day forecast layout updates
        getForecastData(forecastUrl);

    } catch (error) {
        errorMsg.style.display = 'block';
        weatherBox.style.display = 'none'; // Hide the old data if search fails
        console.error("Weather fetch failed:", error);
    }
}

// Parses and injects the 5-Day Forecast dynamically
async function getForecastData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Forecast data unavailable');
        const data = await response.json();
        
        // Wipe out the hardcoded placeholder cards from index.html instantly
        forecastCardsContainer.innerHTML = ''; 

        // Filter out data to grab forecast instances matching daytime intervals
        const dailyForecasts = data.list.filter(forecast => forecast.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(dayData => {
            const date = new Date(dayData.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temp = Math.round(dayData.main.temp);
            const icon = dayData.weather[0].icon;

            const cardHTML = `
                <div class="forecast-card">
                    <p class="day">${dayName}</p>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather-icon">
                    <p class="forecast-temp">${temp}°C</p>
                </div>
            `;
            forecastCardsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error("Error processing forecast cards layout:", error);
    }
}

// Event Listeners for Actions
searchBtn.addEventListener('click', () => {
    if(cityInput.value.trim() !== "") {
        checkWeather(cityInput.value);
    }
});

cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && cityInput.value.trim() !== "") {
        checkWeather(cityInput.value);
    }
});

// App Initiation
window.addEventListener('load', () => {
    updateDate();
    checkWeather('Gurgaon'); 
});