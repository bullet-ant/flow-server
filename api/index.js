require("dotenv").config();
const app = require("express")();

const OPENWEATHERAPIKEY = process.env.OPENWEATHERAPIKEY;
const GEOLITEUSERNAME = process.env.GEOLITEUSERNAME;
const GEOLITEPASSWORD = process.env.GEOLITEPASSWORD;
const UNSPLASHAPIKEY = process.env.UNSPLASHAPIKEY;

app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.json({ status: "healthy" });
});

app.get("/api/wallpaper", async (req, res) => {
  try {
    const collectionId = req.query.collection_id || "Ql7C2dPpjkw";
    const unsplashApi = `https://api.unsplash.com/collections/${collectionId}/photos?client_id=${UNSPLASHAPIKEY}`;
    const wallpaperResponse = await fetch(unsplashApi);

    if (!wallpaperResponse.ok)
      throw new Error(`HTTP error! Status: ${wallpaperResponse.status}`);

    const wallpapers = await wallpaperResponse.json();
    res.json(wallpapers);
  } catch (err) {
    console.error("Error fetching location data:", err);
  }
});

app.get("/api/location", async (req, res) => {
  try {
    const url = "https://geolite.info/geoip/v2.1/city/me";
    const headers = new Headers({
      Authorization: "Basic " + btoa(`${GEOLITEUSERNAME}:${GEOLITEPASSWORD}`),
    });

    const output = await fetch(url, { method: "GET", headers });

    if (!output.ok) throw new Error(`HTTP error! Status: ${output.status}`);

    const location = await output.json();

    res.json(location);
  } catch (err) {
    console.error("Error fetching location data:", err);
  }
});

app.get("/api/weather", async (req, res) => {
  try {
    const url = "https://geolite.info/geoip/v2.1/city/me";
    const headers = new Headers({
      Authorization: "Basic " + btoa(`${GEOLITEUSERNAME}:${GEOLITEPASSWORD}`),
    });

    const locationResponse = await fetch(url, { method: "GET", headers });

    if (!locationResponse.ok)
      throw new Error(`HTTP error! Status: ${locationResponse.status}`);

    const location = await locationResponse.json();
    const lat = location?.location?.latitude;
    const lon = location?.location?.longitude;

    const weatherApi = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERAPIKEY}`;
    const weatherResponse = await fetch(weatherApi);

    if (!weatherResponse.ok)
      throw new Error(`HTTP error! Status: ${weatherResponse.status}`);

    const weather = await weatherResponse.json();

    res.json(weather);
  } catch (err) {
    console.error("Error fetching location data:", err);
  }
});

module.exports = app;
