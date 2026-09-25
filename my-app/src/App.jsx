import { useState, useEffect } from "react";
import { useWeather } from "./API";
import "./App.css";

const DEFAULT_DESTINATION = {
  name: "London",
  admin1: "England",
  country: "United Kingdom",
  latitude: 51.5085,
  longitude: -0.1257,
  zone: "Europe/London",
};

function App() {
  const [selectedDestination, setSelectedDestination] =
    useState(DEFAULT_DESTINATION);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { data, loading, error } = useWeather(
    selectedDestination.latitude,
    selectedDestination.longitude,
  );

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query,
          )}&count=10&language=en&format=json`,
        );
        const data = await response.json();

        if (data.results) {
          const mappedResults = data.results.map((city) => ({
            name: city.name,
            // Capture state/province (admin1) and county/district (admin2)
            admin1: city.admin1 || "",
            admin2: city.admin2 || "",
            country: city.country || "",
            latitude: city.latitude,
            longitude: city.longitude,
            zone: city.timezone || "UTC",
          }));
          setSearchResults(mappedResults);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Helper to format the secondary location text nicely (e.g., "Texas, United States" or "Greater London, United Kingdom")
  const formatLocationDetails = (destination) => {
    const details = [
      destination.admin2,
      destination.admin1,
      destination.country,
    ].filter(Boolean);
    return details.join(", ");
  };

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
                if (event.key === "Enter" && searchResults[0]) {
                  setSelectedDestination(searchResults[0]);
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
                <span>
                  {isSearching
                    ? "Searching..."
                    : `${searchResults.length} results`}
                </span>
              </div>

              {searchResults.length > 0 ? (
                searchResults.map((destination) => (
                  <button
                    className="destination-option"
                    key={`${destination.latitude}-${destination.longitude}`}
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
                      <small>{formatLocationDetails(destination)}</small>
                    </span>
                    <span className="option-arrow">↗</span>
                  </button>
                ))
              ) : (
                <p className="empty-popup">
                  {query.trim() === ""
                    ? "Type to search any city in the world..."
                    : isSearching
                      ? "Looking up skies..."
                      : "No familiar skies found. Try another city."}
                </p>
              )}
            </div>
          )}
        </div>

        <section className="forecast-panel" aria-live="polite">
          <div className="forecast-heading">
            <div>
              <span className="eyebrow">
                {selectedDestination.admin1
                  ? `${selectedDestination.admin1}, ${selectedDestination.country}`
                  : selectedDestination.country}
              </span>
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
