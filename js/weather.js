/**
 * Weather Service - Fetches weather data and provides fallbacks
 */

export class WeatherService {
    constructor() {
        this.apiKey = null; // User can add their own key
        this.cachedWeather = null;
        this.cacheTime = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Set OpenWeatherMap API key
     * @param {string} key - API key
     */
    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Get user's location
     * @returns {Promise<Object>} Location data
     */
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    /**
     * Fetch weather data from OpenWeatherMap
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} Weather data
     */
    async fetchWeather(lat, lon) {
        // Check cache
        if (this.cachedWeather && this.cacheTime && 
            (Date.now() - this.cacheTime) < this.cacheDuration) {
            return this.cachedWeather;
        }

        if (!this.apiKey) {
            console.warn('No API key set, using fallback weather');
            return this.getFallbackWeather();
        }

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }

            const data = await response.json();
            
            const weather = {
                temperature: Math.round(data.main.temp),
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
                conditions: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                city: data.name,
                country: data.sys.country
            };

            this.cachedWeather = weather;
            this.cacheTime = Date.now();
            return weather;
        } catch (error) {
            console.warn('Weather fetch failed:', error);
            return this.getFallbackWeather();
        }
    }

    /**
     * Get fallback weather when API fails
     * @returns {Object} Fallback weather data
     */
    getFallbackWeather() {
        // Generate random but realistic weather
        const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Mist', 'Thunderstorm'];
        const temps = [5, 10, 15, 20, 25, 30];
        const humidities = [30, 40, 50, 60, 70, 80];
        const pressures = [1005, 1010, 1015, 1020, 1025];
        const windSpeeds = [5, 10, 15, 20, 25, 30];

        return {
            temperature: temps[Math.floor(Math.random() * temps.length)],
            humidity: humidities[Math.floor(Math.random() * humidities.length)],
            pressure: pressures[Math.floor(Math.random() * pressures.length)],
            windSpeed: windSpeeds[Math.floor(Math.random() * windSpeeds.length)],
            conditions: conditions[Math.floor(Math.random() * conditions.length)],
            description: 'Unknown conditions',
            icon: '01d',
            city: 'Unknown',
            country: 'XX',
            isFallback: true
        };
    }

    /**
     * Get weather emoji based on conditions
     * @param {string} conditions - Weather condition
     * @returns {string} Emoji
     */
    getWeatherEmoji(conditions) {
        const emojiMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Thunderstorm': '⛈️',
            'Drizzle': '🌦️'
        };
        return emojiMap[conditions] || '🌤️';
    }

    /**
     * Get weather flavor text for rituals
     * @param {Object} weather - Weather data
     * @returns {string} Flavor text
     */
    getWeatherFlavor(weather) {
        const temp = weather.temperature;
        const conditions = weather.conditions;
        const emoji = this.getWeatherEmoji(conditions);

        if (temp > 30) {
            return `${emoji} Scorching ${temp}°C! The sun god Ra is furious today!`;
        } else if (temp > 25) {
            return `${emoji} Warm ${temp}°C. The cosmos is comfortable and generous.`;
        } else if (temp > 15) {
            return `${emoji} Pleasant ${temp}°C. The gods are in a good mood.`;
        } else if (temp > 5) {
            return `${emoji} Cool ${temp}°C. The Norse winds carry ancient wisdom.`;
        } else {
            return `${emoji} Freezing ${temp}°C! Jotunheim's frost reaches out!`;
        }
    }
}