import { useState } from "react";
import { useWeather } from "./API";
import "./App.css";

const destinations = [
  {
    name: "London",
    country: "United Kingdom",
    latitude: 51.5085,
    longitude: -0.1257,
    zone: "Europe/London",
  },
  {
    name: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.006,
    zone: "America/New_York",
  },
  {
    name: "Tokyo",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    zone: "Asia/Tokyo",
  },
  {
    name: "Sydney",
    country: "Australia",
    latitude: -33.8688,
    longitude: 151.2093,
    zone: "Australia/Sydney",
  },
  {
    name: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
    zone: "Europe/Paris",
  },
  {
    name: "Cape Town",
    country: "South Africa",
    latitude: -33.9249,
    longitude: 18.4241,
    zone: "Africa/Johannesburg",
  },
];

function App() {
  const [selectedDestination, setSelectedDestination] = useState(
    destinations[0],
  );
  const [query, setQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { data, loading, error } = useWeather(
    selectedDestination.latitude,
    selectedDestination.longitude,
  );
  const filteredDestinations = destinations.filter((destination) =>
    `${destination.name} ${destination.country}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const currentTemperature = data?.hourly?.temperature_2m?.[0];

  if (error)
    return (
      <main className="weather-shell">
        <div className="status-card">
          <span className="eyebrow">Forecast unavailable</span>
          <h1>We lost the signal.</h1>
          <p>Try selecting the destination again in a moment.</p>
        </div>
      </main>
    );

  return (
    <main className="weather-shell">
      <div className="weather-orbit weather-orbit-one" />
      <div className="weather-orbit weather-orbit-two" />
      <section className="weather-page">
        <header className="app-header">
          <div className="brand-mark">
            <span>W</span>
            <span>eather / now</span>
          </div>
          <span className="live-pill">
            <i /> Live forecast
          </span>
        </header>
        <div className="hero-copy">
          <span className="eyebrow">Your window to the sky</span>
          <h1>
            Find your
            <br />
            <em>somewhere.</em>
          </h1>
          <p>Choose a destination and get a clear read on the hours ahead.</p>
        </div>
        <div className="destination-picker">
          <label htmlFor="location-input">Destination</label>
          <div className={`search-box ${isPopupOpen ? "is-active" : ""}`}>
            <span className="search-icon">⌕</span>
            <input
              type="search"
              name="location"
              id="location-input"
              value={query}
              placeholder={selectedDestination.name}
              autoComplete="off"
              onFocus={() => setIsPopupOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsPopupOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsPopupOpen(false);
                if (event.key === "Enter" && filteredDestinations[0]) {
                  setSelectedDestination(filteredDestinations[0]);
                  setQuery("");
                  setIsPopupOpen(false);
                }
              }}
            />
            <span className="search-shortcut">⌘ K</span>
          </div>
          {isPopupOpen && (
            <div className="destination-popup">
              <div className="popup-heading">
                <span>Suggested places</span>
                <span>{filteredDestinations.length} results</span>
              </div>
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((destination) => (
                  <button
                    className="destination-option"
                    key={destination.name}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSelectedDestination(destination);
                      setQuery("");
                      setIsPopupOpen(false);
                    }}
                  >
                    <span className="destination-icon">
                      {destination.name.slice(0, 1)}
                    </span>
                    <span>
                      <strong>{destination.name}</strong>
                      <small>{destination.country}</small>
                    </span>
                    <span className="option-arrow">↗</span>
                  </button>
                ))
              ) : (
                <p className="empty-popup">
                  No familiar skies found. Try another city.
                </p>
              )}
            </div>
          )}
        </div>
        <section className="forecast-panel" aria-live="polite">
          <div className="forecast-heading">
            <div>
              <span className="eyebrow">Right now in</span>
              <h2>{selectedDestination.name}</h2>
              <span className="coordinates">{selectedDestination.zone}</span>
            </div>
            <span className="sun-symbol">☼</span>
          </div>
          <div className="temperature-row">
            <strong>
              {loading ? "--" : Math.round(currentTemperature ?? 0)}
              <sup>°</sup>
            </strong>
            <div>
              <span className="condition">
                {loading ? "Reading the sky…" : "Current conditions"}
              </span>
              <span className="temperature-note">Feels calm and clear</span>
            </div>
          </div>
          <div className="hourly-strip">
            {(data?.hourly?.time?.slice(0, 5) ?? []).map((time, index) => (
              <div
                className={`hour ${index === 0 ? "current-hour" : ""}`}
                key={time.toISOString()}
              >
                <span>
                  {index === 0
                    ? "Now"
                    : time.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                </span>
                <b>{Math.round(data.hourly.temperature_2m[index])}°</b>
                <i>{index === 0 ? "☼" : "◒"}</i>
              </div>
            ))}
            {loading &&
              [0, 1, 2, 3, 4].map((index) => (
                <div className="hour" key={index}>
                  <span>—</span>
                  <b>—</b>
                  <i>·</i>
                </div>
              ))}
          </div>
        </section>
        <footer>
          <span>Open-Meteo forecast data</span>
          <span>Updated just now</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
