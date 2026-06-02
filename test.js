import jsonData from './weather.json' with {type: 'json'};

const date = new Date().toISOString();
const currentHourTarget = new Date().toISOString().substring(10, 13); // "2026-06-02T19"
const day = new Date().toISOString().substring(8, 10);
//const currentHourForecast = data.hours.find(item => 
//  item.time.substring(0, 13) === currentHourTarget
//);

const filteredArray = jsonData.hours.filter(item => item.time.substring(10, 13) == currentHourTarget && parseInt(item.time.substring(8, 10)) < parseInt(day) + 7);
console.log(parseInt(day));
console.log(date);
console.log(filteredArray);
