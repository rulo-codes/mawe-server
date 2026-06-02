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


//Test: Get data and filter out unnecessary data
app.get('/api/test', async (req, res) => {
    const jsonPath = path.join(__dirname, 'weather.json');
    const date = new Date().toISOString();
    const currentHourTarget = new Date().toISOString().substring(10, 13); // "2026-06-02T19"
    const day = new Date().toISOString().substring(8, 10);

    const weatherObject = [];

    try{
      const readData = fs.readFileSync(jsonPath, 'utf8');
      const data = JSON.parse(readData);
      const filterData = data.hours.filter(item => item.time.substring(10, 13) == currentHourTarget && parseInt(item.time.substring(8, 10)) < parseInt(day) + 7);

      weatherObject.push({'lat':data.meta.lat,'lng':data.meta.lng,'date':date,'weather':filterData});
      res.json(weatherObject);
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