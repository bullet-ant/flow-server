require("dotenv").config();
const path = require("path");
const app = require("express")();
const cors = require("cors");
const Reader = require("@maxmind/geoip2-node").Reader;

const OPENWEATHERAPIKEY = process.env.OPENWEATHERAPIKEY;
const UNSPLASHAPIKEY = process.env.UNSPLASHAPIKEY;

app.use(cors());

app.get("/api", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.json({ status: "healthy" });
});

app.get("/api/wallpaper", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Cache-Control",
    "public, s-max-age=86400, stale-while-revalidate"
  );

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
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Cache-Control",
    "public, s-max-age=86400, stale-while-revalidate"
  );

  const id = req.query.id;

  try {
    const unsplashApi = `https://api.unsplash.com/photos/${id}?client_id=${UNSPLASHAPIKEY}`;
    const wallpaperResponse = await fetch(unsplashApi);

    if (!wallpaperResponse.ok)
      throw new Error(`HTTP error! Status: ${wallpaperResponse.status}`);

    const wallpaper = await wallpaperResponse.json();
    res.json({ id: wallpaper.id, location: wallpaper.location });
  } catch (err) {
    console.error("Error fetching location data:", err);
  }
});

app.get("/api/weather", async (req, res) => {
  const ip = req.headers["x-real-ip"] || req.socket.remoteAddress || "8.8.8.8";

  try {
    const dbPath = path.resolve(__dirname, "GeoLite2-City.mmdb");
    const reader = await Reader.open(dbPath);
    const geoLocation = reader.city(ip);
    const lat = geoLocation.location.latitude;
    const lon = geoLocation.location.longitude;

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
