import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import getWeatherCode from "./getWeatherCode.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const stormGlassApi = process.env.SG_API_KEY;
const openWeatherApi = process.env.OW_API_KEY;

app.use(cors());
app.use(express.json());

const weather_params =
  "airTemperature,pressure,cloudCover,currentDirection,currentSpeed,gust,humidity,iceCover,precipitation,rain,snow,seaIceThickness,seaLevel,swellDirection,swellHeight,swellPeriod,waterTemperature,waveDirection,waveHeight,wavePeriod,windDirection,windSpeed";

const bio_params =
  "chlorophyll,iron,nitrate,phyto,oxygen,ph,phytoplankton,phosphate,silicate,salinity";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running perfectly!",
  });
});

//Get Weather Api
app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        status: "fail",
        message: "Missing required query request: Coordinates are required.",
      });
    }

    const response = await fetch(
      `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${weather_params}&source=sg`,
      {
        headers: {
          Authorization: stormGlassApi,
        },
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      status: "Server Error",
      message: error.message,
    });
  }
});

app.get("/api/bio", async (req, res) => {
  try {
    const lat = "11.746956869985965";
    const lng = "124.86928660082111";
    const date = "2026-06-30T15:21:30.257Z";

    const response = await fetch(
      `https://api.stormglass.io/v2/bio/point?lat=${lat}&lng=${lng}&params=${bio_params}`,
      {
        headers: {
          Authorization: stormGlassApi,
        },
      }
    );

    const data = await response.json();
    const currentData = filterCurrent(date, data);

    res.json(currentData);
    //https://api.openweathermap.org/data/4.0/onecall/alert/{alert_id}?appid=KEY
  } catch (error) {
    res.status(500).json({
      status: "Server Error",
      message: error.message,
    });
  }
});

app.get("/api/astronomy", async (req, res) => {
  try {
    const lat = "11.746956869985965";
    const lng = "124.86928660082111";

    const response = await fetch(
      `https://api.stormglass.io/v2/astronomy/point?lat=${lat}&lng=${lng}`,
      {
        headers: {
          Authorization: stormGlassApi,
        },
      }
    );

    const data = await response.json();
    res.json(data);
    //https://api.openweathermap.org/data/4.0/onecall/alert/{alert_id}?appid=KEY
  } catch (error) {
    res.status(500).json({
      status: "Server Error",
      message: error.message,
    });
  }
});

// Filter Data
function filterCurrent(date, data) {
  const currentTime = date.substring(0, 13);
  const filterData = data.hours.filter(
    (item) => item.time.substring(0, 13) == currentTime
  );

  return filterData;
}

function filterHourly(date, data) {
  const currentDay = date.substring(0, 10);
  const filterData = data.hours.filter(
    (item) => item.time.substring(0, 10) == currentDay
  );

  return filterData;
}

function filterDaily(date, data) {
  const currentHour = date.substring(11, 13); // hour digits only
  const filterData = data.hours.filter(
    (item) => item.time.substring(11, 13) == currentHour
  );

  return filterData;
}

function filterDataByTime(data) {
  const weatherData = { code: [], current: [], hourly: [], daily: [] };
  const date = "2026-06-29T15:21:30.257Z";

  const currentData = filterCurrent(date, data);
  weatherData.current.push(currentData);

  const hourlyData = filterHourly(date, data);
  weatherData.hourly.push(hourlyData);

  const dailyData = filterDaily(date, data);
  weatherData.daily.push(dailyData);

  return weatherData;
}

//Test: Get data and filter out unnecessary data
app.get("/api/test", async (req, res) => {
  const jsonPath = path.join(__dirname, "weather.json");

  try {
    const readData = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(readData);

    const filteredData = await filterDataByTime(data);
    const weatherCode = await getWeatherCode(data);
    filteredData.code.push(weatherCode);

    res.json(filteredData);
  } catch (err) {
    res.status(500).json({
      status: "Server Error",
      message: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

/*
Slack water times: Crucial for navigating narrow channels safely.
Sunrise and sunset: Essential for compliance with navigation light laws.
Moon phase: High-contrast indicators for spring tides (stronger currents) during full or new moons.
*/
