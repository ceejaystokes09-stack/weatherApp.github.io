import { useState, useEffect } from "react";
export function useWeather(latitude = 51.5085, longitude = -0.1257) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getWeather() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          latitude,
          longitude,
          hourly: "temperature_2m",
          forecast_days: 7,
        });
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
        );
        if (!response.ok) throw new Error("Weather request failed");
        const forecast = await response.json();

        const weatherData = {
          coordinates: {
            latitude: forecast.latitude,
            longitude: forecast.longitude,
            elevation: forecast.elevation,
            utcOffsetSeconds: forecast.utc_offset_seconds,
          },
          hourly: {
            time: forecast.hourly.time.map((time) => new Date(time)),
            temperature_2m: forecast.hourly.temperature_2m,
          },
        };

        setData(weatherData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    getWeather();
  }, [latitude, longitude]);

  return { data, loading, error };
}
