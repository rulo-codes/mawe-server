import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const weatherApi = process.env.WEATHER_API;


app.use(cors());         
app.use(express.json());  

const weather_params = 'airTemperature,pressure,currentDirection,currentSpeed,gust,humidity,iceCover,precipitation,rain,snow,seaIceThickness,seaLevel,swellDirection,swellHeight,swellPeriod,waterTemperature,waveDirection,waveHeight,wavePeriod,windDirection,windSpeed';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Server is running perfectly!' 
    });
});

//Get Weather Api
app.get('/api/weather', async (req, res) => {
    try{
      const {lat, lng} = req.query;

      if(!lat || !lng){
        return res.status(400).json({
          status: 'fail',
          message: 'Missing required query request: Coordinates are required.'
        });
      };

      const response = await fetch(`https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${weather_params}` , {
          headers: {
            'Authorization': weatherApi
          }
      })

      const data = await response.json();

      res.json(data);
    }catch (error){
      res.status(500).json({
        status: 'Server Error',
        message: error.message
      })
    }
});


// Filter Data
function filterCurrent(date, data){
    const currentTime = date.substring(0,13);
    const filterData = data.hours.filter(item => item.time.substring(0, 13) == currentTime);
   
    return filterData;
}

function filterHourly(date, data){
    const currentDay = date.substring(0,10);
    const filterData = data.hours.filter(item => item.time.substring(0, 10) == currentDay);

    return filterData;
}

function filterDaily(date, data){
    const currentHour = date.substring(10,13);
    const filterData = data.hours.filter(item => item.time.substring(10, 13) == currentHour);
    
    return filterData;
}

function filterDataByTime(data){
    const weatherData = { current: [], hourly: [], daily: [] };
    const date = "2026-06-01T19:42:17.329Z";

    const currentData = filterCurrent(date, data);
    weatherData.current.push(currentData);

    const hourlyData = filterHourly(date, data);
    weatherData.hourly.push(hourlyData);

    const dailyData = filterDaily(date, data);
    weatherData.daily.push(dailyData);

    return weatherData;
}

//Test: Get data and filter out unnecessary data
app.get('/api/test', async (req, res) => {
    const jsonPath = path.join(__dirname, 'weather.json');

    try{
      const readData = fs.readFileSync(jsonPath, 'utf8');
      const data = JSON.parse(readData);
      
      const filteredData = await filterDataByTime(data);

      res.json(filteredData);
    }catch(err){
      res.status(500).json({
        status: 'Server Error',
        message: err.message
      })
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