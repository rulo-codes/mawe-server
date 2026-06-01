import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const weatherApi = process.env.WEATHER_API;


app.use(cors());         
app.use(express.json());  

const weather_params = 'airTemperature,pressure,currentDirection,currentSpeed,gust,humidity,iceCover,precipitation,rain,snow,seaIceThickness,seaLevel,swellDirection,swellHeight,swellPeriod,waterTemperature,waveDirection,waveHeight,wavePeriod,windDirection,windSpeed';

app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Server is running perfectly!' 
    });
});

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


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});