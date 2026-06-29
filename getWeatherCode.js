export default function getWeatherCode(weatherData) {
  // Extract values using StormGlass default 'sg' source
  const precipitation = weatherData.precipitation?.sg ?? 0;
  const cloudCover = weatherData.cloudCover?.sg ?? 0;
  const visibility = weatherData.visibility?.sg ?? 20;
  const windSpeed = weatherData.windSpeed?.sg ?? 0;
  const gust = weatherData.gust?.sg ?? 0;
  const airPressure = weatherData.airPressure?.sg ?? 1013.25;

  // Sever Weather Storm Alerts
  // Tropical Cyclone / Hurricane Check (Extreme low pressure + extreme sustained winds)
  if (airPressure < 990 && windSpeed > 32) {
    return {
      condition: "Hurricane / Tropical Cyclone Force",
      iconId: "extreme_cyclone",
      alertLevel: "CRITICAL",
    };
  }

  // Tropical Storm / Severe Gale Check
  if (airPressure < 1002 && (windSpeed > 17 || gust > 24)) {
    return {
      condition: "Tropical Storm Warning",
      iconId: "extreme_storm",
      alertLevel: "WARNING",
    };
  }

  //Convective Checks
  if (precipitation > 2.5) {
    if (gust > 15) {
      return {
        condition: "Severe Thunderstorm",
        iconId: "thunderstorm_severe",
        alertLevel: "ADVISORY",
      };
    } else if (gust > 11) {
      return {
        condition: "Thunderstorm",
        iconId: "thunderstorm",
        alertLevel: "NONE",
      };
    }
  }

  //Standard Weather Conditions
  // Dry High Wind Safety Hazard
  if (windSpeed > 11 || gust > 15) {
    return { condition: "Windy / Gale", iconId: "windy", alertLevel: "NONE" };
  }

  // Standard Rain
  if (precipitation > 0) {
    return precipitation <= 2.5
      ? { condition: "Light Rain", iconId: "rain_light", alertLevel: "NONE" }
      : { condition: "Heavy Rain", iconId: "rain_heavy", alertLevel: "NONE" };
  }

  // Fog and Visibility Restrictions
  if (visibility <= 1) {
    return { condition: "Foggy", iconId: "fog", alertLevel: "NONE" };
  } else if (visibility <= 10) {
    return { condition: "Misty / Hazy", iconId: "mist", alertLevel: "NONE" };
  }

  // Cloud Cover Mapping (Clear Sky spectrum)
  if (cloudCover < 10) {
    return {
      condition: "Sunny / Clear",
      iconId: "clear_sky",
      alertLevel: "NONE",
    };
  } else if (cloudCover <= 50) {
    return {
      condition: "Partly Cloudy",
      iconId: "cloudy_partly",
      alertLevel: "NONE",
    };
  } else {
    return { condition: "Cloudy", iconId: "cloudy_full", alertLevel: "NONE" };
  }
}

// -- For Testing --

//const cycloneSample = {
//	airPressure: { sg: 974.5 },
//	windSpeed: { sg: 36.2 },
//	precipitation: { sg: 18.4 },
//	cloudCover: { sg: 100 },
//	visibility: { sg: 1.2 },
//};

//const finalStatus = parseStormGlassAllWeather(cycloneSample);
//console.log(`Condition: ${finalStatus.condition}`);
//console.log(`Alert Level: ${finalStatus.alertLevel}`);
