export default function getWeatherCode(weatherData) {
  // Extract values using StormGlass default 'sg' source
  const precipitation = Number(weatherData.precipitation?.sg ?? 0);
  const cloudCover = Number(weatherData.cloudCover?.sg ?? 0);
  const visibility = Number(weatherData.visibility?.sg ?? 20);
  const windSpeed = Number(weatherData.windSpeed?.sg ?? 0);
  const gust = Number(weatherData.gust?.sg ?? 0);
  const airPressure = Number(
    weatherData.airPressure?.sg ?? weatherData.pressure?.sg ?? 1013.25
  );

  // Severe Weather Storm Alerts (marine thresholds based on StormGlass data)
  // Tropical Cyclone / Hurricane Check (very low pressure + sustained strong winds)
  if (airPressure <= 980 && (windSpeed >= 32 || gust >= 38)) {
    return {
      condition: "Hurricane / Tropical Cyclone Force",
      iconId: "extreme_weather",
      alertLevel: "CRITICAL",
    };
  }

  // Tropical Storm / Severe Gale Check
  if (airPressure <= 1000 && (windSpeed >= 20 || gust >= 24)) {
    return {
      condition: "Tropical Storm Warning",
      iconId: "extreme_weather",
      alertLevel: "WARNING",
    };
  }

  // Convective Checks
  if (precipitation >= 2.5 && (gust >= 12 || windSpeed >= 12)) {
    if (gust >= 18 || windSpeed >= 18) {
      return {
        condition: "Severe Thunderstorm",
        iconId: "thunderstorm",
        alertLevel: "ADVISORY",
      };
    }
    return {
      condition: "Thunderstorm",
      iconId: "thunderstorm",
      alertLevel: "NONE",
    };
  }

  // Standard Weather Conditions
  // Dry High Wind Safety Hazard (10.8 m/s is a strong breeze / near-gale on open water)
  if (windSpeed >= 10.8 || gust >= 14.4) {
    return { condition: "Windy / Gale", iconId: "windy", alertLevel: "NONE" };
  }

  // Precipitation bands for StormGlass mm/h values
  if (precipitation >= 8) {
    return {
      condition: "Heavy Rain",
      iconId: "rain_heavy",
      alertLevel: "NONE",
    };
  }

  if (precipitation >= 5) {
    return {
      condition: "Moderate Rain",
      iconId: "rain_light",
      alertLevel: "NONE",
    };
  }

  if (precipitation > 1) {
    return {
      condition: "Light Rain",
      iconId: "rain_light",
      alertLevel: "NONE",
    };
  }

  // Fog and Visibility Restrictions
  if (visibility <= 1) {
    return { condition: "Foggy", iconId: "fog", alertLevel: "NONE" };
  } else if (visibility <= 10) {
    return { condition: "Misty / Hazy", iconId: "mist", alertLevel: "NONE" };
  }

  // Cloud Cover Mapping (StormGlass cloudCover is a 0-100% percentage)
  if (cloudCover < 15) {
    return {
      condition: "Sunny / Clear",
      iconId: "clear_sky",
      alertLevel: "NONE",
    };
  } else if (cloudCover < 50) {
    return {
      condition: "Partly Cloudy",
      iconId: "cloudy_partly",
      alertLevel: "NONE",
    };
  } else if (cloudCover < 90) {
    return {
      condition: "Cloudy",
      iconId: "cloudy_full",
      alertLevel: "NONE",
    };
  } else {
    return {
      condition: "Overcast",
      iconId: "cloudy_full",
      alertLevel: "NONE",
    };
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
